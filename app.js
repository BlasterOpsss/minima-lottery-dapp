// ===============================
// ⚙ CONFIG
// ===============================
const LOTTERY_ADDRESS = "0xFFEEDDFFEEDD99";

let entries = [];


// ===============================
// 🔌 INIT MINIMASK
// ===============================
window.onload = function () {

    if (typeof MINIMASK !== "undefined") {

        MINIMASK.init(function (msg) {

            console.log("MiniMask:", msg);

            if (msg.event === "MINIMASK_INIT") {

                if (!msg.data.data.loggedon) {
                    alert("⚠️ Please login to MiniMask");
                    return;
                }

                console.log("✅ MiniMask connected");

                loadEntries();
            }

            if (msg.event === "MINIMASK_PENDING") {
                console.log("⏳ Pending:", msg.data);
            }

        });

    } else {
        alert("❌ MiniMask not found");
    }
};



// ===============================
// 🎟 BUY TICKET
// ===============================
function buyTicket() {

    const state = {};
    state[1] = "ticket_" + Date.now();

    MINIMASK.account.send(
        "1", // ✅ 1 MINIMA
        LOTTERY_ADDRESS,
        "0x00",
        state,
        function (resp) {

            console.log("Response:", resp);

            if (resp.pending) {
                alert("🎟 Ticket sent! Approve in MiniMask");
            } else {
                alert("❌ Error: " + resp.error);
            }
        }
    );
}



// ===============================
// 📥 LOAD ENTRIES FROM BLOCKCHAIN
// ===============================
function loadEntries() {

    MINIMASK.meg.listcoins(LOTTERY_ADDRESS, "", "", function (resp) {

        console.log("Entries:", resp);

        entries = [];

        let listHTML = "";

        for (let i = 0; i < resp.data.length; i++) {

            const coin = resp.data[i];

            if (coin.state && coin.state[1]) {

                const entry = coin.state[1];

                entries.push(entry);

                listHTML += "<li>" + entry + "</li>";
            }
        }

        document.getElementById("entries").innerHTML = listHTML;
    });
}



// ===============================
// 🎯 DRAW WINNER
// ===============================
function drawWinner() {

    if (entries.length === 0) {
        alert("No entries yet!");
        return;
    }

    const winner = entries[Math.floor(Math.random() * entries.length)];

    document.getElementById("winner").innerText =
        "🏆 Winner: " + winner;
}
