// ===============================
// 🔌 INIT MINIMASK (SAFE LOAD)
// ===============================
let userAddress = "";

window.addEventListener("load", () => {

    // wait for extension injection
    setTimeout(() => {

        if (typeof MINIMASK === "undefined") {
            console.error("❌ MiniMask not injected");
            return;
        }

        console.log("✅ MiniMask detected");

        MINIMASK.init(function(event) {

            console.log("MiniMask Event:", event);

            // 🟢 Wallet info
            if (event.event === "MINIMASK_INIT") {

                if (event.data.loggedon) {
                    userAddress = event.data.address;
                    console.log("👤 User Address:", userAddress);
                } else {
                    console.log("⚠️ Not logged in MiniMask");
                }
            }

            // 🟢 Transaction result
            if (event.event === "MINIMASK_PENDING") {
                handlePending(event.data);
            }
        });

    }, 1000); // wait 1s

});


// ===============================
// ⚙ CONFIG
// ===============================
const LOTTERY_ADDRESS = "MxG086HDR94WWW3ZJE24E807D5SQ7F5WUDQFNN9N221P89D698ZET9YK8832YJQ";
const TICKET_PRICE = 1;


// ===============================
// 📦 STATE
// ===============================
let entries = JSON.parse(localStorage.getItem("entries")) || [];


// ===============================
// 🖥 Render Entries
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

    if (typeof MINIMASK === "undefined") {
        alert("❌ MiniMask not loaded yet!");
        return;
    }

    if (!userAddress) {
        alert("⚠️ MiniMask not ready or not logged in!");
        return;
    }

    console.log("🚀 Sending transaction...");

    MINIMASK.account.send(
        String(TICKET_PRICE),
        LOTTERY_ADDRESS,
        "0x00",
        {},
        function(resp) {

            console.log("MiniMask Response:", resp);

            if (!resp.pending && !resp.status) {
                alert("❌ Error: " + resp.error);
                return;
            }

            if (resp.pending) {
                alert("⏳ Transaction created! Open MiniMask → approve it.");
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

        entries.push({
            address: userAddress,
            time: new Date().toISOString()
        });

        localStorage.setItem("entries", JSON.stringify(entries));
        renderEntries();

        alert("🎟 Ticket confirmed!");

    } else {
        alert("❌ Transaction rejected or failed");
    }
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
// 🧹 RESET LOTTERY
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
