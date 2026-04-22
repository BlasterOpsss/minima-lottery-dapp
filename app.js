// ===============================
// 🔌 INIT MINIMASK
// ===============================
let userAddress = "";

MINIMASK.init(function (event) {

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
// ⚙ CONFIG
// ===============================
const LOTTERY_ADDRESS = "MxG086HDR94WWW3ZJE24E807D5SQ7F5WUDQFNN9N221P89D698ZET9YK8832YJQ";
const TICKET_PRICE = "1";

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
        alert("MiniMask not loaded!");
        return;
    }

    console.log("Checking wallet...");

    // 🔥 fallback check
    if (!userAddress) {
        console.log("Trying to fetch wallet...");

        MINIMASK.account.get(function(res) {

            console.log("Account fetch:", res);

            if (res && res.address) {
                userAddress = res.address;
                sendTransaction();
            } else {
                alert("Please login to MiniMask!");
            }
        });

    } else {
        sendTransaction();
    }
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
// 🚀 INIT
// ===============================
renderEntries();
