// 1. Check User Role (Admin or Coordinator)
let userRole = "";
let loggedInUser = null;

if (localStorage.getItem("adminUser")) {
  userRole = "admin";
} else if (localStorage.getItem("loggedInCoordinator")) {
  userRole = "coordinator";
  loggedInUser = JSON.parse(localStorage.getItem("loggedInCoordinator"));
} else {
  window.location.href = "index.html";
}

// 2. Hide Buttons for Coordinator
if (userRole === "coordinator") {
  document.getElementById("th-update").style.display = "none";
  document.getElementById("th-action").style.display = "none";
  document.getElementById("filterCoordContainer").style.display = "none"; // Hide coordinator filter
}

// 3. Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXXMSZOOd1Cb_Tuwp8ZnjT6Iwd0jMrh6U",
  authDomain: "gulaman-e-risalat-team.firebaseapp.com",
  projectId: "gulaman-e-risalat-team",
  storageBucket: "gulaman-e-risalat-team.firebasestorage.app",
  messagingSenderId: "284287467697",
  appId: "1:284287467697:web:e57714c6b594b0a9be6290"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const tableBody = document.getElementById("donorsTableBody");

window.donationsData = {}; 
window.allDonationsList = []; 

function formatMonthYearString(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[parseInt(parts[1], 10) - 1]}-${parts[0]}`;
}
function formatShortMonthYear(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(parts[1], 10) - 1]}-${parts[0].slice(-2)}`;
}
function generateMonthRange(start, end) {
  let months = [];
  let [startYear, startMonth] = start.split('-').map(Number);
  let [endYear, endMonth] = end.split('-').map(Number);
  let curr = new Date(startYear, startMonth - 1, 1);
  let endDate = new Date(endYear, endMonth - 1, 1);
  while (curr <= endDate) {
    months.push(`${curr.getFullYear()}-${(curr.getMonth() + 1).toString().padStart(2, '0')}`);
    curr.setMonth(curr.getMonth() + 1);
  }
  return months;
}

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

  Array.from(nameSet).sort().forEach(name => { filterName.innerHTML += `<option value="${name}">${name}</option>`; });
  Array.from(coordSet).sort().forEach(coord => { filterCoord.innerHTML += `<option value="${coord}">${coord}</option>`; });

  if (nameSet.has(currentName)) filterName.value = currentName;
  if (coordSet.has(currentCoord)) filterCoord.value = currentCoord;
}

function loadSavedSummaryDates() {
  const savedFrom = localStorage.getItem("summaryFromMonth");
  const savedTo = localStorage.getItem("summaryToMonth");
  if (savedFrom) document.getElementById("summaryFromMonth").value = savedFrom;
  if (savedTo) document.getElementById("summaryToMonth").value = savedTo;
}
loadSavedSummaryDates();

// Fetch live Donations Data
db.collection("donations").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  window.donationsData = {}; 
  window.allDonationsList = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id; 
    
    // 🔥 ROLE CHECK: Agar coordinator hai, toh sirf uska hi data list me daalo
    if (userRole === "coordinator" && data.coordinatorName !== loggedInUser.fullName) {
      return; 
    }
    
    window.donationsData[doc.id] = data;
    window.allDonationsList.push(data);
  });

  if (window.allDonationsList.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    document.getElementById("boxSummaryBody").innerHTML = `<tr><td style="text-align:center; padding: 15px;">No data</td></tr>`;
    document.getElementById("withoutBoxSummaryBody").innerHTML = `<tr><td style="text-align:center; padding: 15px;">No data</td></tr>`;
    return;
  }

  renderSummaries(); 
  populateDropdowns(); 
  renderTable(); 
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});

// --- DATE RANGE FILTER LOGIC FOR SUMMARIES ---
document.getElementById("summaryFromMonth").addEventListener("change", function() { localStorage.setItem("summaryFromMonth", this.value); renderSummaries(); });
document.getElementById("summaryToMonth").addEventListener("change", function() { localStorage.setItem("summaryToMonth", this.value); renderSummaries(); });

window.clearSummaryFilters = function() {
  document.getElementById("summaryFromMonth").value = "";
  document.getElementById("summaryToMonth").value = "";
  localStorage.removeItem("summaryFromMonth");
  localStorage.removeItem("summaryToMonth");
  renderSummaries();
};

function renderSummaries() {
  const fromMonth = document.getElementById("summaryFromMonth").value;
  const toMonth = document.getElementById("summaryToMonth").value;

  let displayMonths = [];
  let dataMonths = [...new Set(window.allDonationsList.map(d => d.monthYear))].filter(Boolean).sort();

  if (fromMonth && toMonth) displayMonths = generateMonthRange(fromMonth, toMonth);
  else if (fromMonth) displayMonths = generateMonthRange(fromMonth, Math.max(dataMonths[dataMonths.length > 0 ? dataMonths.length - 1 : 0] || fromMonth, fromMonth));
  else if (toMonth) displayMonths = generateMonthRange(Math.min(dataMonths[0] || toMonth, toMonth), toMonth);
  else displayMonths = dataMonths;

  let boxData = {}, withoutBoxData = {};

  window.allDonationsList.forEach(d => {
    if (d.status === "Rejected") return; 
    if (fromMonth && toMonth && !displayMonths.includes(d.monthYear)) return;

    let target = (d.donorType === "Box") ? boxData : withoutBoxData;
    if (!target[d.donorName]) target[d.donorName] = {};
    if (!target[d.donorName][d.monthYear]) target[d.donorName][d.monthYear] = { amount: 0, status: d.status || "Pending" };
    
    target[d.donorName][d.monthYear].amount += Number(d.amount); 
    target[d.donorName][d.monthYear].status = d.status || "Pending"; 
  });

  let headerHTML = `<tr><th style="text-align:center;">S.No.</th><th style="text-align:left;">Donor Name</th>`;
  if (displayMonths.length === 0) headerHTML += `<th>No Months Found</th></tr>`;
  else {
    displayMonths.forEach(m => { headerHTML += `<th style="text-align:center;">${formatShortMonthYear(m)}</th>`; });
    headerHTML += `<th style="text-align:center; color: #d32f2f; font-weight: bold; font-size: 15px;">Total</th></tr>`;
  }

  document.getElementById("boxSummaryHead").innerHTML = headerHTML;
  document.getElementById("withoutBoxSummaryHead").innerHTML = headerHTML;

  function buildTableRows(dataObj, monthArray, emptyMsg) {
    let bodyHTML = "", sIndex = 1;
    if (Object.keys(dataObj).length > 0) {
      for (const [donorName, monthsObj] of Object.entries(dataObj).sort()) {
        let rowTotal = 0;
        bodyHTML += `<tr><td style="text-align:center;">${sIndex++}</td><td style="text-align:left;"><strong style="color:#0056b3;">${donorName}</strong></td>`;
        monthArray.forEach(m => {
          if (monthsObj[m]) {
            if (monthsObj[m].status === "Accepted") {
              bodyHTML += `<td style="text-align:center;"><span style="color:#28a745; font-weight:bold;">₹${monthsObj[m].amount}</span></td>`;
              rowTotal += monthsObj[m].amount; 
            } else bodyHTML += `<td style="text-align:center;"><span style="color:#ff9800; font-weight:bold; font-size:13px;">Pending</span></td>`;
          } else bodyHTML += `<td style="text-align:center; color:#ccc;">-</td>`;
        });
        bodyHTML += `<td style="text-align:center; background:#fff3f3; border-left:2px solid #ffcdd2;"><strong style="color:#d32f2f; font-size:14px;">₹${rowTotal}</strong></td></tr>`;
      }
    } else bodyHTML = `<tr><td colspan="${monthArray.length + 3}" style="text-align:center;">${emptyMsg}</td></tr>`;
    return bodyHTML;
  }

  document.getElementById("boxSummaryBody").innerHTML = buildTableRows(boxData, displayMonths, "No Box Donations found in this range");
  document.getElementById("withoutBoxSummaryBody").innerHTML = buildTableRows(withoutBoxData, displayMonths, "No Without Box Donations found in this range");
}

// FILTERING LOGIC FOR MAIN TABLE
function renderTable() {
  const filterName = document.getElementById("filterName").value;
  const filterCoord = document.getElementById("filterCoord").value;
  const filterMonth = document.getElementById("filterMonth").value;
  const filterType = document.getElementById("filterType").value;
  const filterStatus = document.getElementById("filterStatus").value;

  tableBody.innerHTML = "";
  let index = 1, hasVisibleRows = false;

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
      let submitDate = "N/A";
      if (data.timestamp) {
        submitDate = data.timestamp.toDate().toLocaleString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      }

      let statusBadge = "";
      if (currentStatus === "Pending") statusBadge = `<span style="background:#fff3cd; color:#856404; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">⏳ Pending</span>`;
      else if (currentStatus === "Accepted") statusBadge = `<span style="background:#d4edda; color:#155724; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">✅ Accepted</span>`;
      else statusBadge = `<span style="background:#f8d7da; color:#721c24; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">❌ Rejected</span>`;

      // 🔥 ROLE LOGIC FOR TABLE BUTTONS
      let actionColumnsHTML = "";
      if (userRole === "admin") {
        const statusDropdown = `
          <select onchange="updateDonationStatus('${data.id}', this.value)" style="padding:4px; font-size:12px; border-radius:4px; border:1px solid #ccc; cursor:pointer; background:#f8f9fa;">
            <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="Accepted" ${currentStatus === 'Accepted' ? 'selected' : ''}>✅ Accept</option>
          </select>`;
        
        actionColumnsHTML = `
          <td>${statusDropdown}</td>
          <td><button onclick="deleteDonation('${data.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">🗑️ Delete</button></td>
        `;
      }

      tableBody.innerHTML += `
        <tr>
          <td>${index++}</td>
          <td><strong style="color: #0056b3;">${data.donorName}</strong></td>
          <td>${formatMonthYearString(data.monthYear)}</td>
          <td style="color: #28a745; font-weight: bold;">₹ ${data.amount}</td>
          <td><span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.donorType}</span></td>
          <td><strong style="color: #555;">${currentCoord}</strong></td>
          <td><button onclick="openSlipModal('${data.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight:bold;">View Slip</button></td>
          <td style="font-size: 13px; color: #555;">${submitDate}</td>
          <td>${statusBadge}</td>
          ${actionColumnsHTML} <!-- Yahan buttons show/hide honge -->
        </tr>`;
    }
  });

  if (!hasVisibleRows) tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px; font-weight:bold; color:#dc3545;">No matching records found.</td></tr>`;
}

document.getElementById("filterName").addEventListener("change", renderTable);
document.getElementById("filterCoord").addEventListener("change", renderTable); 
document.getElementById("filterMonth").addEventListener("change", renderTable);
document.getElementById("filterType").addEventListener("change", renderTable);
document.getElementById("filterStatus").addEventListener("change", renderTable);

window.clearFilters = function() {
  document.getElementById("filterName").value = "All";
  document.getElementById("filterCoord").value = "All"; 
  document.getElementById("filterMonth").value = "";
  document.getElementById("filterType").value = "All";
  document.getElementById("filterStatus").value = "All";
  renderTable(); 
};

window.updateDonationStatus = function(docId, newStatus) {
  if (userRole === "admin") {
    if(confirm(`Are you sure you want to mark this donation as ${newStatus}?`)) {
      db.collection("donations").doc(docId).update({ status: newStatus }).catch(error => alert("Error: " + error.message));
    } else renderTable();
  }
};

window.deleteDonation = function(docId) {
  if (userRole === "admin") {
    if(confirm("Are you sure you want to permanently delete this donation record?")) {
      db.collection("donations").doc(docId).delete().catch(error => alert("Error: " + error.message));
    }
  }
};

window.openSlipModal = function(docId) {
  const data = window.donationsData[docId];
  if(!data) return;
  document.getElementById("mName").innerText = data.donorName;
  document.getElementById("mMonth").innerText = formatMonthYearString(data.monthYear);
  document.getElementById("mAmount").innerText = data.amount;
  document.getElementById("mType").innerText = data.donorType;
  document.getElementById("mCoord").innerText = data.coordinatorName || "N/A"; 
  document.getElementById("mDate").innerText = data.timestamp ? data.timestamp.toDate().toLocaleDateString("en-IN") : "N/A";
  document.getElementById("slipModal").style.display = "flex";
};
window.closeSlipModal = function() { document.getElementById("slipModal").style.display = "none"; };
window.downloadSlipImage = async function() {
  const canvas = await html2canvas(document.getElementById("adminReceiptContent"), { scale: 2 }); 
  const link = document.createElement("a");
  link.download = "Donation_Receipt.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};
