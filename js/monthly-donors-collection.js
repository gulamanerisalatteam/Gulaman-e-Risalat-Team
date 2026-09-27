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

window.donationsData = {}; 
window.allDonationsList = []; 

function formatMonthYearString(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return `${months[monthIndex]}-${parts[0]}`;
}

// Convert "2026-11" to "Nov-26" for Summary Headers
function formatShortMonthYear(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(parts[1], 10) - 1]}-${parts[0].slice(-2)}`;
}

// Populate Dropdowns Dynamically
function populateDropdowns() {
  const nameSet = new Set();
  const coordSet = new Set();

  window.allDonationsList.forEach((data) => {
    if (data.donorName) nameSet.add(data.donorName);
    if (data.coordinatorName) coordSet.add(data.coordinatorName);
  });

  const filterName = document.getElementById("filterName");
  const filterCoord = document.getElementById("filterCoord");

  const currentName = filterName.value;
  const currentCoord = filterCoord.value;

  filterName.innerHTML = `<option value="All">All Donors</option>`;
  filterCoord.innerHTML = `<option value="All">All Coordinators</option>`;

  Array.from(nameSet).sort().forEach(name => {
    filterName.innerHTML += `<option value="${name}">${name}</option>`;
  });
  
  Array.from(coordSet).sort().forEach(coord => {
    filterCoord.innerHTML += `<option value="${coord}">${coord}</option>`;
  });

  if (nameSet.has(currentName)) filterName.value = currentName;
  if (coordSet.has(currentCoord)) filterCoord.value = currentCoord;
}

// --- NEW: LOAD SAVED DATES ON PAGE LOAD ---
function loadSavedSummaryDates() {
  const savedFrom = localStorage.getItem("summaryFromMonth");
  const savedTo = localStorage.getItem("summaryToMonth");
  if (savedFrom) document.getElementById("summaryFromMonth").value = savedFrom;
  if (savedTo) document.getElementById("summaryToMonth").value = savedTo;
}
// Page load hote hi purani dates input box me daal do
loadSavedSummaryDates();

// Fetch live Donations Data
db.collection("donations").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  window.donationsData = {}; 
  window.allDonationsList = [];
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    document.getElementById("boxSummaryBody").innerHTML = `<tr><td style="text-align:center; padding: 15px;">No data</td></tr>`;
    document.getElementById("withoutBoxSummaryBody").innerHTML = `<tr><td style="text-align:center; padding: 15px;">No data</td></tr>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id; 
    window.donationsData[doc.id] = data;
    window.allDonationsList.push(data);
  });

  renderSummaries(); 
  populateDropdowns(); 
  renderTable(); 
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});


// --- DATE RANGE FILTER LOGIC FOR SUMMARIES (UPDATED WITH LOCALSTORAGE) ---

document.getElementById("summaryFromMonth").addEventListener("change", function() {
  localStorage.setItem("summaryFromMonth", this.value); // Data save kiya
  renderSummaries();
});

document.getElementById("summaryToMonth").addEventListener("change", function() {
  localStorage.setItem("summaryToMonth", this.value); // Data save kiya
  renderSummaries();
});

window.clearSummaryFilters = function() {
  document.getElementById("summaryFromMonth").value = "";
  document.getElementById("summaryToMonth").value = "";
  
  // Local storage se bhi data mita do
  localStorage.removeItem("summaryFromMonth");
  localStorage.removeItem("summaryToMonth");
  
  renderSummaries();
};

function renderSummaries() {
  const fromMonth = document.getElementById("summaryFromMonth").value;
  const toMonth = document.getElementById("summaryToMonth").value;

  // Get all unique monthYears from data
  let uniqueMonths = [...new Set(window.allDonationsList.map(d => d.monthYear))].filter(Boolean).sort();

  // Apply Date Range Filter lexicographically
  if (fromMonth) {
    uniqueMonths = uniqueMonths.filter(m => m >= fromMonth);
  }
  if (toMonth) {
    uniqueMonths = uniqueMonths.filter(m => m <= toMonth);
  }

  let boxData = {};
  let withoutBoxData = {};

  // Group data by DonorType -> DonorName -> Month (Only for filtered months)
  window.allDonationsList.forEach(d => {
    if (d.status === "Rejected") return; 
    // Ignore data outside the selected month range
    if (!uniqueMonths.includes(d.monthYear)) return;

    let target = (d.donorType === "Box") ? boxData : withoutBoxData;
    
    if (!target[d.donorName]) target[d.donorName] = {};
    if (!target[d.donorName][d.monthYear]) target[d.donorName][d.monthYear] = 0;
    
    target[d.donorName][d.monthYear] += Number(d.amount); 
  });

  // Generate Table Headers
  let headerHTML = `<tr><th style="text-align:center;">S.No.</th><th style="text-align:left;">Donor Name</th>`;
  if (uniqueMonths.length === 0) {
    headerHTML += `<th>No Months Selected/Found</th>`;
  } else {
    uniqueMonths.forEach(m => {
      headerHTML += `<th style="text-align:center;">${formatShortMonthYear(m)}</th>`;
    });
  }
  headerHTML += `</tr>`;

  document.getElementById("boxSummaryHead").innerHTML = headerHTML;
  document.getElementById("withoutBoxSummaryHead").innerHTML = headerHTML;

  // Render Box Summary Body
  let boxBodyHTML = "";
  let bIndex = 1;
  if (Object.keys(boxData).length > 0) {
    for (const [donorName, monthsObj] of Object.entries(boxData).sort()) {
      boxBodyHTML += `<tr><td style="text-align:center;">${bIndex++}</td><td style="text-align:left;"><strong style="color:#0056b3;">${donorName}</strong></td>`;
      uniqueMonths.forEach(m => {
        let amount = monthsObj[m] ? `<span style="color:#28a745; font-weight:bold;">₹${monthsObj[m]}</span>` : `<span style="color:#ccc;">-</span>`;
        boxBodyHTML += `<td style="text-align:center;">${amount}</td>`;
      });
      boxBodyHTML += `</tr>`;
    }
  } else {
    boxBodyHTML = `<tr><td colspan="${uniqueMonths.length + 2}" style="text-align:center;">No Box Donations found in this range</td></tr>`;
  }
  document.getElementById("boxSummaryBody").innerHTML = boxBodyHTML;

  // Render Without Box Summary Body
  let wBoxBodyHTML = "";
  let wIndex = 1;
  if (Object.keys(withoutBoxData).length > 0) {
    for (const [donorName, monthsObj] of Object.entries(withoutBoxData).sort()) {
      wBoxBodyHTML += `<tr><td style="text-align:center;">${wIndex++}</td><td style="text-align:left;"><strong style="color:#0056b3;">${donorName}</strong></td>`;
      uniqueMonths.forEach(m => {
        let amount = monthsObj[m] ? `<span style="color:#28a745; font-weight:bold;">₹${monthsObj[m]}</span>` : `<span style="color:#ccc;">-</span>`;
        wBoxBodyHTML += `<td style="text-align:center;">${amount}</td>`;
      });
      wBoxBodyHTML += `</tr>`;
    }
  } else {
    wBoxBodyHTML = `<tr><td colspan="${uniqueMonths.length + 2}" style="text-align:center;">No Without Box Donations found in this range</td></tr>`;
  }
  document.getElementById("withoutBoxSummaryBody").innerHTML = wBoxBodyHTML;
}

// FILTERING LOGIC FOR MAIN TABLE
function renderTable() {
  const filterName = document.getElementById("filterName").value;
  const filterCoord = document.getElementById("filterCoord").value;
  const filterMonth = document.getElementById("filterMonth").value;
  const filterType = document.getElementById("filterType").value;
  const filterStatus = document.getElementById("filterStatus").value;

  tableBody.innerHTML = "";
  let index = 1;
  let hasVisibleRows = false;

  window.allDonationsList.forEach((data) => {
    const currentStatus = data.status || "Pending";
    const currentCoord = data.coordinatorName || "N/A";

    const matchName = filterName === "All" || data.donorName === filterName;
    const matchCoord = filterCoord === "All" || currentCoord === filterCoord;
    const matchMonth = filterMonth === "" || data.monthYear === filterMonth;
    const matchType = filterType === "All" || data.donorType === filterType;
    const matchStatus = filterStatus === "All" || currentStatus === filterStatus;

    if (matchName && matchCoord && matchMonth && matchType && matchStatus) {
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

      let statusBadge = "";
      if (currentStatus === "Pending") {
        statusBadge = `<span style="background:#fff3cd; color:#856404; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">⏳ Pending</span>`;
      } else if (currentStatus === "Accepted") {
        statusBadge = `<span style="background:#d4edda; color:#155724; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">✅ Accepted</span>`;
      } else if (currentStatus === "Rejected") { 
        statusBadge = `<span style="background:#f8d7da; color:#721c24; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">❌ Rejected</span>`;
      }

      const statusDropdown = `
        <select onchange="updateDonationStatus('${data.id}', this.value)" style="padding:4px; font-size:12px; border-radius:4px; border:1px solid #ccc; cursor:pointer; background:#f8f9fa;">
          <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Accepted" ${currentStatus === 'Accepted' ? 'selected' : ''}>✅ Accept</option>
        </select>
      `;

      const row = `
        <tr>
          <td>${index++}</td>
          <td><strong style="color: #0056b3;">${data.donorName}</strong></td>
          <td>${displayMonthYear}</td>
          <td style="color: #28a745; font-weight: bold;">₹ ${data.amount}</td>
          <td><span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.donorType}</span></td>
          <td><strong style="color: #555;">${currentCoord}</strong></td>
          <td>
            <button onclick="openSlipModal('${data.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight:bold;">View Slip</button>
          </td>
          <td style="font-size: 13px; color: #555;">${submitDate}</td>
          <td>${statusBadge}</td>
          <td>${statusDropdown}</td>
          <td>
            <button onclick="deleteDonation('${data.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">🗑️ Delete</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    }
  });

  if (!hasVisibleRows) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px; font-weight:bold; color:#dc3545;">No matching records found.</td></tr>`;
  }
}

// EVENT LISTENERS FOR FILTERS
document.getElementById("filterName").addEventListener("change", renderTable);
document.getElementById("filterCoord").addEventListener("change", renderTable); 
document.getElementById("filterMonth").addEventListener("change", renderTable);
document.getElementById("filterType").addEventListener("change", renderTable);
document.getElementById("filterStatus").addEventListener("change", renderTable);

// CLEAR FILTERS
window.clearFilters = function() {
  document.getElementById("filterName").value = "All";
  document.getElementById("filterCoord").value = "All"; 
  document.getElementById("filterMonth").value = "";
  document.getElementById("filterType").value = "All";
  document.getElementById("filterStatus").value = "All";
  renderTable(); 
};

// STATUS UPDATE 
window.updateDonationStatus = function(docId, newStatus) {
  if(confirm(`Are you sure you want to mark this donation as ${newStatus}?`)) {
    db.collection("donations").doc(docId).update({
      status: newStatus
    }).catch((error) => {
      alert("Error updating status: " + error.message);
    });
  } else {
    renderTable();
  }
};

// DELETE DONATION RECORD
window.deleteDonation = function(docId) {
  if(confirm("Are you sure you want to permanently delete this donation record? This action cannot be undone.")) {
    db.collection("donations").doc(docId).delete().then(() => {
    }).catch((error) => {
      alert("Error deleting record: " + error.message);
    });
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
