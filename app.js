// ===============================
// 🔌 MiniMask Wrapper
// ===============================
function sendToMiniMask(action, data = {}) {
    return new Promise((resolve) => {

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
// 🎯 CONFIG
// ===============================
const LOTTERY_ADDRESS = "MxLOTTERY123"; // 🔁 replace later
const TICKET_PRICE = 1;

// ===============================
// 📦 STATE (temporary storage)
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
// 🎟 Buy Ticket
// ===============================
async function buyTicket() {

    try {
        const response = await sendToMiniMask("send", {
            address: LOTTERY_ADDRESS,
            amount: TICKET_PRICE
        });

        console.log("MiniMask Response:", response);

        // ⚠️ TEMP FAKE USER (replace later with real address)
        const user = "User_" + Math.floor(Math.random() * 9999);

        entries.push({
            address: user,
            time: new Date().toISOString()
        });

        localStorage.setItem("entries", JSON.stringify(entries));

        renderEntries();

        alert("🎟 Ticket purchased!");

    } catch (err) {
        console.error(err);
        alert("Transaction failed");
    }
}

// ===============================
// 🎲 Draw Winner
// ===============================
function drawWinner() {

    if (entries.length === 0) {
        alert("No entries!");
        return;
    }

    // Better randomness than Math.random
    const rand = crypto.getRandomValues(new Uint32Array(1))[0];
    const index = rand % entries.length;

    const winner = entries[index];

    document.getElementById("winner").innerText =
        `🏆 Winner: ${winner.address}`;
}

// ===============================
// 🧹 Reset Lottery (optional)
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
