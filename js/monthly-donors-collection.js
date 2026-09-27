// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXXMSZOOd1Cb_Tuwp8ZnjT6Iwd0jMrh6U",
  authDomain: "gulaman-e-risalat-team.firebaseapp.com",
  projectId: "gulaman-e-risalat-team",
  storageBucket: "gulaman-e-risalat-team.firebasestorage.app",
  messagingSenderId: "284287467697",
  appId: "1:284287467697:web:e57714c6b594b0a9be6290"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const tableBody = document.getElementById("donorsTableBody");

window.donationsData = {}; // Original data for modal
window.allDonationsList = []; // Array for filtering

function formatMonthYearString(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return `${months[monthIndex]}-${parts[0]}`;
}

// Fetch live Donations Data and Store in Array
db.collection("donations").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  window.donationsData = {}; 
  window.allDonationsList = [];
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id; // Save doc id inside data
    window.donationsData[doc.id] = data;
    window.allDonationsList.push(data);
  });

  renderTable(); // Fetch hone ke baad table render karein
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});

// FILTERING LOGIC
function renderTable() {
  const filterName = document.getElementById("filterName").value.toLowerCase();
  const filterMonth = document.getElementById("filterMonth").value;
  const filterType = document.getElementById("filterType").value;
  const filterStatus = document.getElementById("filterStatus").value;

  tableBody.innerHTML = "";
  let index = 1;
  let hasVisibleRows = false;

  window.allDonationsList.forEach((data) => {
    const currentStatus = data.status || "Pending";

    // Filter Conditions Check
    const matchName = data.donorName.toLowerCase().includes(filterName);
    const matchMonth = filterMonth === "" || data.monthYear === filterMonth;
    const matchType = filterType === "All" || data.donorType === filterType;
    const matchStatus = filterStatus === "All" || currentStatus === filterStatus;

    if (matchName && matchMonth && matchType && matchStatus) {
      hasVisibleRows = true;
      const displayMonthYear = formatMonthYearString(data.monthYear);

      let submitDate = "N/A";
      if (data.timestamp) {
        const dateObj = data.timestamp.toDate();
        submitDate = dateObj.toLocaleString("en-IN", { 
          day: '2-digit', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit', hour12: true 
        });
      }

      // STATUS BADGE
      let statusBadge = "";
      if (currentStatus === "Pending") {
        statusBadge = `<span style="background:#fff3cd; color:#856404; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">⏳ Pending</span>`;
      } else if (currentStatus === "Accepted") {
        statusBadge = `<span style="background:#d4edda; color:#155724; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">✅ Accepted</span>`;
      } else if (currentStatus === "Rejected") {
        statusBadge = `<span style="background:#f8d7da; color:#721c24; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">❌ Rejected</span>`;
      }

      // STATUS DROPDOWN
      const statusDropdown = `
        <select onchange="updateDonationStatus('${data.id}', this.value)" style="padding:4px; font-size:12px; border-radius:4px; border:1px solid #ccc; cursor:pointer; background:#f8f9fa;">
          <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Accepted" ${currentStatus === 'Accepted' ? 'selected' : ''}>✅ Accept</option>
          <option value="Rejected" ${currentStatus === 'Rejected' ? 'selected' : ''}>❌ Reject</option>
        </select>
      `;

      const row = `
        <tr>
          <td>${index++}</td>
          <td><strong style="color: #0056b3;">${data.donorName}</strong></td>
          <td>${displayMonthYear}</td>
          <td style="color: #28a745; font-weight: bold;">₹ ${data.amount}</td>
          <td><span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.donorType}</span></td>
          <td>
            <button onclick="openSlipModal('${data.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight:bold;">View Slip</button>
          </td>
          <td style="font-size: 13px; color: #555;">${submitDate}</td>
          <td>${statusBadge}</td>
          <td>${statusDropdown}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    }
  });

  if (!hasVisibleRows) {
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 15px; font-weight:bold; color:#dc3545;">No matching records found.</td></tr>`;
  }
}

// EVENT LISTENERS FOR FILTERS (Auto-Filter on change)
document.getElementById("filterName").addEventListener("input", renderTable);
document.getElementById("filterMonth").addEventListener("change", renderTable);
document.getElementById("filterType").addEventListener("change", renderTable);
document.getElementById("filterStatus").addEventListener("change", renderTable);

// CLEAR FILTERS FUNCTION
window.clearFilters = function() {
  document.getElementById("filterName").value = "";
  document.getElementById("filterMonth").value = "";
  document.getElementById("filterType").value = "All";
  document.getElementById("filterStatus").value = "All";
  renderTable(); // Reset table
};

// STATUS UPDATE FUNCTION IN DATABASE
window.updateDonationStatus = function(docId, newStatus) {
  if(confirm(`Are you sure you want to mark this donation as ${newStatus}?`)) {
    db.collection("donations").doc(docId).update({
      status: newStatus
    }).then(() => {
      // Firebase will auto trigger onSnapshot and renderTable
    }).catch((error) => {
      alert("Error updating status: " + error.message);
    });
  } else {
    renderTable(); // Reset dropdown visually if canceled
  }
};

// --- SLIP MODAL FUNCTIONS ---
window.openSlipModal = function(docId) {
  const data = window.donationsData[docId];
  if(!data) return;

  document.getElementById("mName").innerText = data.donorName;
  document.getElementById("mMonth").innerText = formatMonthYearString(data.monthYear);
  document.getElementById("mAmount").innerText = data.amount;
  document.getElementById("mType").innerText = data.donorType;
  document.getElementById("mCoord").innerText = data.coordinatorName || "N/A"; 

  let modalDate = "N/A";
  if (data.timestamp) {
    const dateObj = data.timestamp.toDate();
    modalDate = dateObj.toLocaleDateString("en-IN");
  }
  document.getElementById("mDate").innerText = modalDate;

  document.getElementById("slipModal").style.display = "flex";
};

window.closeSlipModal = function() {
  document.getElementById("slipModal").style.display = "none";
};

window.downloadSlipImage = async function() {
  const receiptElement = document.getElementById("adminReceiptContent");
  try {
    const canvas = await html2canvas(receiptElement, { scale: 2 }); 
    const link = document.createElement("a");
    link.download = "Donation_Receipt_Admin.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    alert("Error downloading image: " + error.message);
  }
};
