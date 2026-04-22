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
async function buyTicket() {

    if (typeof MINIMASK === "undefined") {
        alert("MiniMask not loaded!");
        return;
    }

    console.log("🚀 Sending transaction via MiniMask...");

    MINIMASK.account.send(
        1,                          // amount
        "MxLOTTERY123",             // address
        "0x00",                     // token id (default MINIMA)
        {},                         // state
        function(resp) {

            console.log("MiniMask Response:", resp);

            if (!resp || resp.status === false) {
                alert("Transaction failed: " + (resp.error || "Unknown error"));
                return;
            }

            // TEMP entry (next step = real tracking)
            const user = "User_" + Math.floor(Math.random() * 9999);

            entries.push({
                address: user,
                time: new Date().toISOString()
            });

            localStorage.setItem("entries", JSON.stringify(entries));
            renderEntries();

            alert("🎟 Ticket purchased!");
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
