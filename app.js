// ===============================
// 📦 STATE & CONFIG
// ===============================
let userAddress = "";
const LOTTERY_ADDRESS = "MxG086HDR94WWW3ZJE24E807D5SQ7F5WUDQFNN9N221P89D698ZET9YK8832YJQ";
const TICKET_PRICE = "1"; // Keep as string for BigInt safety in blockchain libs

// Load entries from LocalStorage
let entries = JSON.parse(localStorage.getItem("entries")) || [];

// ===============================
// 🛡️ MINIMASK INITIALIZATION
// ===============================
if (typeof MINIMASK !== "undefined") {
    MINIMASK.init(function(event) {
        console.log("MiniMask Event:", event);

        switch (event.event) {
            case "MINIMASK_INIT":
                if (event.data.loggedon) {
                    userAddress = event.data.address;
                    console.log("Wallet Connected:", userAddress);
                } else {
                    console.warn("User not logged into MiniMask");
                }
                break;

            case "MINIMASK_PENDING":
                handlePending(event.data);
                break;
        }
    });
} else {
    console.error("MiniMask is not installed or detected.");
}

// ===============================
// 🖥️ UI RENDERING
// ===============================
function renderEntries() {
    const list = document.getElementById("entries");
    if (!list) return;

    list.innerHTML = "";
    entries.forEach((entry, index) => {
        const li = document.createElement("li");
        li.style.wordBreak = "break-all"; // Ensures long addresses don't break layout
        li.innerHTML = `<strong>#${index + 1}</strong>: ${entry.address}`;
        list.appendChild(li);
    });
}

// ===============================
// 🎟️ CORE LOGIC
// ===============================

function buyTicket() {
    if (typeof MINIMASK === "undefined") {
        alert("MiniMask not detected! Please install the extension.");
        return;
    }

    // Ensure we have a user address before proceeding
    if (!userAddress) {
        alert("Please log in to MiniMask first.");
        return;
    }

    console.log("🚀 Initiating transaction...");

    // Using the official send method
    MINIMASK.account.send(
        TICKET_PRICE,
        LOTTERY_ADDRESS,
        "0x00", // Payload/Data
        {},     // Options
        function(resp) {
            console.log("Transaction Callback:", resp);

            if (resp.error) {
                alert("❌ Error: " + resp.error);
                return;
            }

            if (resp.pending) {
                console.log("⏳ Transaction is pending approval...");
                // Note: The UI updates happen inside handlePending() via the init listener
            }
        }
    );
}

function handlePending(data) {
    console.log("Processing Pending Result:", data);

    // If response exists and status is true, the user approved and tx is sent
    if (data.response && data.response.status) {
        
        const newEntry = {
            address: userAddress || "Unknown User",
            time: new Date().toLocaleString(),
            txHash: data.response.txHash || ""
        };

        entries.push(newEntry);
        localStorage.setItem("entries", JSON.stringify(entries));
        
        renderEntries();
        alert("🎟️ Ticket purchased successfully!");
    } else {
        alert("❌ Transaction was rejected or failed to process.");
    }
}

// ===============================
// 🎲 LOTTERY MANAGEMENT
// ===============================

function drawWinner() {
    if (entries.length === 0) {
        alert("No entries found!");
        return;
    }

    // Cryptographically secure random selection
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const index = array[0] % entries.length;

    const winner = entries[index];
    const winnerDisplay = document.getElementById("winner");
    
    if (winnerDisplay) {
        winnerDisplay.innerText = `🏆 Winner: ${winner.address}`;
    }
    
    console.log("Winner Drawn:", winner);
}

function resetLottery() {
    if (confirm("Are you sure you want to clear all entries?")) {
        entries = [];
        localStorage.removeItem("entries");
        renderEntries();
        
        const winnerDisplay = document.getElementById("winner");
        if (winnerDisplay) winnerDisplay.innerText = "";
    }
}

// ===============================
// 🚀 START
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    renderEntries();
});
