let userAddress = "";

MINIMASK.init(function(event) {

    console.log("MiniMask Event:", event);

    // 🟢 Wallet ready
    if (event.event === "MINIMASK_INIT") {

        if (event.data.loggedon) {
            userAddress = event.data.address;
            console.log("User Address:", userAddress);
        } else {
            console.log("Not logged in MiniMask");
        }
    }

    // 🟢 Transaction result
    if (event.event === "MINIMASK_PENDING") {
        handlePending(event.data);
    }
});
// ===============================
// 🔌 MiniMask Wrapper (REAL BRIDGE)
// ===============================
function sendToMiniMask(action, data = {}) {
    return new Promise((resolve, reject) => {

        const randid = Math.random().toString(36).substring(7);

        function handler(event) {
            const msg = event.data;

            if (
                msg &&
                msg.minitype === "MINIMASK_RESPONSE" &&
                msg.randid === randid
            ) {
                window.removeEventListener("message", handler);
                resolve(msg.data);
            }
        }

        // safety timeout (important)
        setTimeout(() => {
            window.removeEventListener("message", handler);
            reject("MiniMask timeout");
        }, 5000);

        window.addEventListener("message", handler);

        window.postMessage({
            minitype: "MINIMASK_REQUEST",
            action: action,
            data: data,
            randid: randid
        });
    });
}

// ===============================
// ⚙ CONFIG
// ===============================
const LOTTERY_ADDRESS = "MxLOTTERY123"; // 🔁 replace with real address
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
// 🎟 BUY TICKET (FIXED)
// ===============================
function buyTicket() {

    if (typeof MINIMASK === "undefined") {
        alert("MiniMask not loaded!");
        return;
    }

    console.log("🚀 Sending transaction...");

    MINIMASK.account.send(
        1,                    // amount
        "MxLOTTERY123",       // your lottery address
        "0x00",               // MINIMA token
        {},                   // state
        function(resp) {

            console.log("MiniMask Response:", resp);

            // ✅ Correct handling
            if (resp.pending) {
                alert("⏳ Transaction pending! Open MiniMask and approve it.");
                return;
            }

            // ❌ Actual failure
            if (!resp.status) {
                alert("❌ Error: " + resp.error);
                return;
            }

            // ⚠️ No entry here — next step handles it
        }
    );
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
// 🚀 INIT
// ===============================
renderEntries();
