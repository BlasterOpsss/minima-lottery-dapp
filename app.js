// ===============================
// ⚙ CONFIG
// ===============================
const LOTTERY_ADDRESS = "MxG086HDR94WWW3ZJE24E807D5SQ7F5WUDQFNN9N221P89D698ZET9YK8832YJQ";
const TICKET_PRICE = 1;


// ===============================
// 📦 STATE
// ===============================
let userAddress = "";
let entries = JSON.parse(localStorage.getItem("entries")) || [];


// ===============================
// 📱 DEVICE DETECTION
// ===============================
function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


// ===============================
// 🔌 INIT MINIMASK (SAFE)
// ===============================
window.addEventListener("load", () => {

    setTimeout(() => {

        if (typeof MINIMASK === "undefined") {
            console.warn("⚠️ MiniMask not detected (mobile or not installed)");
            return;
        }

        console.log("✅ MiniMask detected");

        MINIMASK.init(function(event) {

            console.log("MiniMask Event:", event);

            // 🟢 Get wallet address properly
            if (event.event === "MINIMASK_INIT") {

                MINIMASK.account.getAddress(function(resp) {

                    console.log("Address response:", resp);

                    if (resp && resp.data) {
                        userAddress = resp.data;
                        console.log("👤 Logged in:", userAddress);
                    } else {
                        console.warn("⚠️ Could not get address");
                    }
                });
            }

            // 🟢 Handle confirmed tx
            if (event.event === "MINIMASK_PENDING") {
                handlePending(event.data);
            }
        });

    }, 1000);

});


// ===============================
// 🖥 RENDER ENTRIES
// ===============================
function renderEntries() {
    const list = document.getElementById("entries");
    if (!list) return;

    list.innerHTML = "";

    entries.forEach((entry, index) => {
        const li = document.createElement("li");
        li.innerText = `${index + 1}. ${entry.address}`;
        list.appendChild(li);
    });
}


// ===============================
// 🎟 BUY TICKET
// ===============================
function buyTicket() {

    const address = LOTTERY_ADDRESS;
    const amount = TICKET_PRICE;

    // ===============================
    // 📱 MOBILE FLOW (NO MINIMASK)
    // ===============================
    if (isMobile()) {

        const url = `minima://send?address=${address}&amount=${amount}`;

        window.location.href = url;

        alert("📲 Opening Minima Wallet... Confirm payment there.");

        // simple fallback confirmation
        setTimeout(() => {
            addEntry("MobileUser");
        }, 5000);

        return;
    }

    // ===============================
    // 💻 DESKTOP FLOW (MINIMASK)
    // ===============================
    if (typeof MINIMASK === "undefined") {
        alert("❌ MiniMask not installed!");
        return;
    }

    console.log("🚀 Sending transaction...");

    MINIMASK.account.send(
        String(amount),
        address,
        "0x00",
        {},
        function(resp) {

            console.log("MiniMask Response:", resp);

            if (!resp.pending && !resp.status) {
                alert("❌ Error: " + resp.error);
                return;
            }

            if (resp.pending) {
                alert("⏳ Transaction created! Open MiniMask → approve.");
            }
        }
    );
}


// ===============================
// ✅ HANDLE CONFIRMATION
// ===============================
function handlePending(data) {

    console.log("Pending Result:", data);

    if (data.response && data.response.status) {
        addEntry(userAddress || "Unknown");
        alert("🎟 Ticket confirmed!");
    } else {
        alert("❌ Transaction rejected");
    }
}


// ===============================
// ➕ ADD ENTRY
// ===============================
function addEntry(address) {

    entries.push({
        address: address,
        time: new Date().toISOString()
    });

    localStorage.setItem("entries", JSON.stringify(entries));
    renderEntries();
}


// ===============================
// 🎲 DRAW WINNER
// ===============================
function drawWinner() {

    if (entries.length === 0) {
        alert("No entries yet!");
        return;
    }

    const rand = crypto.getRandomValues(new Uint32Array(1))[0];
    const index = rand % entries.length;

    const winner = entries[index];

    document.getElementById("winner").innerText =
        `🏆 Winner: ${winner.address}`;
}


// ===============================
// 🧹 RESET
// ===============================
function resetLottery() {
    entries = [];
    localStorage.removeItem("entries");
    renderEntries();
    document.getElementById("winner").innerText = "";
}


// ===============================
// 🚀 INIT UI
// ===============================
renderEntries();
