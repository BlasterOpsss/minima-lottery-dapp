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
const LOTTERY_ADDRESS = "MxLOTTERY123"; // replace later
let entries = JSON.parse(localStorage.getItem("entries")) || [];

function renderEntries() {
    const list = document.getElementById("entries");
    list.innerHTML = "";
    entries.forEach(e => {
        const li = document.createElement("li");
        li.innerText = e.address + " (" + e.amount + ")";
        list.appendChild(li);
    });
}

async function buyTicket() {
    if (!window.minima) {
        alert("MiniMask not installed");
        return;
    }

    await window.minima.send({
        address: LOTTERY_ADDRESS,
        amount: 1
    });

    const user = "User_" + Math.floor(Math.random()*1000);
    entries.push({ address: user, amount: 1 });

    localStorage.setItem("entries", JSON.stringify(entries));
    renderEntries();
}

function drawWinner() {
    if (entries.length === 0) return;

    const index = Date.now() % entries.length;
    const winner = entries[index];

    document.getElementById("winner").innerText =
        "Winner: " + winner.address;
}

renderEntries();
