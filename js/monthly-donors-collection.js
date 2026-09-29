// 1. Check User Role (Admin or Coordinator)
let userRole = "";
let loggedInUser = null;

if (localStorage.getItem("adminUser")) {
  userRole = "admin";
} else if (localStorage.getItem("loggedInCoordinator")) {
  userRole = "coordinator";
  try {
    loggedInUser = JSON.parse(localStorage.getItem("loggedInCoordinator"));
  } catch(e) {
    loggedInUser = null;
  }
} else {
  window.location.href = "index.html";
}

// 2. Hide Buttons for Coordinator
if (userRole === "coordinator") {
  const thUpdate = document.getElementById("th-update");
  const thAction = document.getElementById("th-action");
  const coordFilter = document.getElementById("filterCoordContainer");
  if (thUpdate) thUpdate.style.display = "none";
  if (thAction) thAction.style.display = "none";
  if (coordFilter) coordFilter.style.display = "none";
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
  if (!yyyyMm || typeof yyyyMm !== "string" || !yyyyMm.includes("-")) return yyyyMm || "";
  const parts = yyyyMm.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mIndex = parseInt(parts[1], 10) - 1;
  return `${months[mIndex] || parts[1]}-${parts[0]}`;
}

function formatShortMonthYear(yyyyMm) {
  if (!yyyyMm || typeof yyyyMm !== "string" || !yyyyMm.includes("-")) return yyyyMm || "";
  const parts = yyyyMm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mIndex = parseInt(parts[1], 10) - 1;
  return `${months[mIndex] || parts[1]}-${parts[0].slice(-2)}`;
}

// Safe Month Generator
function generateMonthRange(start, end) {
  if (!start || !end || !start.includes("-") || !end.includes("-")) return [];
  if (start > end) {
    let tmp = start; start = end; end = tmp;
  }
  let [sY, sM] = start.split('-').map(Number);
  let [eY, eM] = end.split('-').map(Number);
  
  let months = [];
  let curY = sY;
  let curM = sM;

  while (curY < eY || (curY === eY && curM <= eM)) {
    let mStr = curM < 10 ? '0' + curM : '' + curM;
    months.push(`${curY}-${mStr}`);
    curM++;
    if (curM > 12) {
      curM = 1;
      curY++;
    }
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
  
  if (filterName) {
    const currentName = filterName.value;
    filterName.innerHTML = `<option value="All">All Donors</option>`;
    Array.from(nameSet).sort().forEach(name => { filterName.innerHTML += `<option value="${name}">${name}</option>`; });
    if (nameSet.has(currentName)) filterName.value = currentName;
  }
  
  if (filterCoord) {
    const currentCoord = filterCoord.value;
    filterCoord.innerHTML = `<option value="All">All Coordinators</option>`;
    Array.from(coordSet).sort().forEach(coord => { filterCoord.innerHTML += `<option value="${coord}">${coord}</option>`; });
    if (coordSet.has(currentCoord)) filterCoord.value = currentCoord;
  }
}

function loadSavedSummaryDates() {
  const savedFrom = localStorage.getItem("summaryFromMonth");
  const savedTo = localStorage.getItem("summaryToMonth");
  if (savedFrom && document.getElementById("summaryFromMonth")) document.getElementById("summaryFromMonth").value = savedFrom;
  if (savedTo && document.getElementById("summaryToMonth")) document.getElementById("summaryToMonth").value = savedTo;
}
loadSavedSummaryDates();

// Real-time Firestore Fetch
db.collection("donations").onSnapshot((snapshot) => {
  window.donationsData = {}; 
  window.allDonationsList = [];
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id; 
    
    // Coordinator Role Check
    if (userRole === "coordinator" && loggedInUser && data.coordinatorName !== loggedInUser.fullName) {
      return; 
    }
    
    window.donationsData[doc.id] = data;
    window.allDonationsList.push(data);
  });

  // Sort locally by timestamp
  window.allDonationsList.sort((a, b) => {
    let tA = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : 0;
    let tB = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : 0;
    return tB - tA;
  });

  if (window.allDonationsList.length === 0) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    document.getElementById("boxSummaryBody").innerHTML = `<tr><td style="text-align:center; padding: 15px;">No data found</td></tr>`;
    document.getElementById("withoutBoxSummaryBody").innerHTML = `<tr><td style="text-align:center; padding: 15px;">No data found</td></tr>`;
    return;
  }

  try {
    renderSummaries(); 
    populateDropdowns(); 
    renderTable(); 
  } catch (err) {
    console.error("Rendering error: ", err);
  }
}, (error) => {
  console.error("Firestore Error:", error);
  if (tableBody) tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});

// Event Listeners for Summary Dates
const fromMonthInput = document.getElementById("summaryFromMonth");
const toMonthInput = document.getElementById("summaryToMonth");

if (fromMonthInput) {
  fromMonthInput.addEventListener("change", function() {
    localStorage.setItem("summaryFromMonth", this.value);
    renderSummaries();
  });
}

if (toMonthInput) {
  toMonthInput.addEventListener("change", function() {
    localStorage.setItem("summaryToMonth", this.value);
    renderSummaries();
  });
}

window.clearSummaryFilters = function() {
  if (fromMonthInput) fromMonthInput.value = "";
  if (toMonthInput) toMonthInput.value = "";
  localStorage.removeItem("summaryFromMonth");
  localStorage.removeItem("summaryToMonth");
  renderSummaries();
};

function renderSummaries() {
  const fromMonth = fromMonthInput ? fromMonthInput.value : "";
  const toMonth = toMonthInput ? toMonthInput.value : "";

  let displayMonths = [];
  let dataMonths = [...new Set(window.allDonationsList.map(d => d.monthYear))].filter(Boolean).sort();

  if (fromMonth && toMonth) {
    displayMonths = generateMonthRange(fromMonth, toMonth);
  } else if (fromMonth) {
    let maxM = dataMonths.length > 0 ? dataMonths[dataMonths.length - 1] : fromMonth;
    if (maxM < fromMonth) maxM = fromMonth;
    displayMonths = generateMonthRange(fromMonth, maxM);
  } else if (toMonth) {
    let minM = dataMonths.length > 0 ? dataMonths[0] : toMonth;
    if (minM > toMonth) minM = toMonth;
    displayMonths = generateMonthRange(minM, toMonth);
  } else {
    displayMonths = dataMonths;
  }

  let boxData = {};
  let withoutBoxData = {};

  window.allDonationsList.forEach(d => {
    if (d.status === "Rejected") return; 
    let mYear = d.monthYear || "Unknown";
    
    if (fromMonth && toMonth && !displayMonths.includes(mYear)) return;

    let target = (d.donorType === "Box") ? boxData : withoutBoxData;
    if (!d.donorName) return;

    if (!target[d.donorName]) target[d.donorName] = {};
    if (!target[d.donorName][mYear]) {
      target[d.donorName][mYear] = { amount: 0, status: d.status || "Pending" };
    }
    
    target[d.donorName][mYear].amount += Number(d.amount || 0); 
    target[d.donorName][mYear].status = d.status || "Pending"; 
  });

  // Table Headers
  let headerHTML = `<tr><th style="text-align:center;">S.No.</th><th style="text-align:left;">Donor Name</th>`;
  if (displayMonths.length === 0) {
    headerHTML += `<th>No Months Selected/Found</th></tr>`;
  } else {
    displayMonths.forEach(m => {
      headerHTML += `<th style="text-align:center;">${formatShortMonthYear(m)}</th>`;
    });
    headerHTML += `<th style="text-align:center; color: #d32f2f; font-weight: bold;">Total</th></tr>`;
  }

  document.getElementById("boxSummaryHead").innerHTML = headerHTML;
  document.getElementById("withoutBoxSummaryHead").innerHTML = headerHTML;

  function buildTableRows(dataObj, monthArray, emptyMsg) {
    let bodyHTML = "";
    let sIndex = 1;
    const names = Object.keys(dataObj).sort();

    if (names.length > 0) {
      names.forEach(donorName => {
        let monthsObj = dataObj[donorName];
        let rowTotal = 0;
        bodyHTML += `<tr><td style="text-align:center;">${sIndex++}</td><td style="text-align:left;"><strong style="color:#0056b3;">${donorName}</strong></td>`;
        
        monthArray.forEach(m => {
          if (monthsObj && monthsObj[m]) {
            if (monthsObj[m].status === "Accepted") {
              bodyHTML += `<td style="text-align:center;"><span style="color:#28a745; font-weight:bold;">₹${monthsObj[m].amount}</span></td>`;
              rowTotal += monthsObj[m].amount; 
            } else {
              bodyHTML += `<td style="text-align:center;"><span style="color:#ff9800; font-weight:bold; font-size:12px;">Pending</span></td>`;
            }
          } else {
            bodyHTML += `<td style="text-align:center; color:#ccc;">-</td>`;
          }
        });
        bodyHTML += `<td style="text-align:center; background:#fff3f3; border-left:2px solid #ffcdd2;"><strong style="color:#d32f2f;">₹${rowTotal}</strong></td></tr>`;
      });
    } else {
      bodyHTML = `<tr><td colspan="${monthArray.length + 3}" style="text-align:center; padding:15px;">${emptyMsg}</td></tr>`;
    }
    return bodyHTML;
  }

  document.getElementById("boxSummaryBody").innerHTML = buildTableRows(boxData, displayMonths, "No Box Donations found in this range");
  document.getElementById("withoutBoxSummaryBody").innerHTML = buildTableRows(withoutBoxData, displayMonths, "No Without Box Donations found in this range");
}

function renderTable() {
  if (!tableBody) return;
  const filterName = document.getElementById("filterName") ? document.getElementById("filterName").value : "All";
  const filterCoord = document.getElementById("filterCoord") ? document.getElementById("filterCoord").value : "All";
  const filterMonth = document.getElementById("filterMonth") ? document.getElementById("filterMonth").value : "";
  const filterType = document.getElementById("filterType") ? document.getElementById("filterType").value : "All";
  const filterStatus = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "All";

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
      let submitDate = "N/A";
      if (data.timestamp && data.timestamp.toDate) {
        submitDate = data.timestamp.toDate().toLocaleString("en-IN", { 
          day: '2-digit', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit', hour12: true 
        });
      }

      let statusBadge = "";
      if (currentStatus === "Pending") statusBadge = `<span style="background:#fff3cd; color:#856404; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">⏳ Pending</span>`;
      else if (currentStatus === "Accepted") statusBadge = `<span style="background:#d4edda; color:#155724; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">✅ Accepted</span>`;
      else statusBadge = `<span style="background:#f8d7da; color:#721c24; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">❌ Rejected</span>`;

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
          <td><strong style="color: #0056b3;">${data.donorName || "N/A"}</strong></td>
          <td>${formatMonthYearString(data.monthYear)}</td>
          <td style="color: #28a745; font-weight: bold;">₹ ${data.amount || 0}</td>
          <td><span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.donorType || "N/A"}</span></td>
          <td><strong style="color: #555;">${currentCoord}</strong></td>
          <td><button onclick="openSlipModal('${data.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight:bold;">View Slip</button></td>
          <td style="font-size: 13px; color: #555;">${submitDate}</td>
          <td>${statusBadge}</td>
          ${actionColumnsHTML}
        </tr>`;
    }
  });

  if (!hasVisibleRows) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px; font-weight:bold; color:#dc3545;">No matching records found.</td></tr>`;
  }
}

["filterName", "filterCoord", "filterMonth", "filterType", "filterStatus"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", renderTable);
});

window.clearFilters = function() {
  if (document.getElementById("filterName")) document.getElementById("filterName").value = "All";
  if (document.getElementById("filterCoord")) document.getElementById("filterCoord").value = "All"; 
  if (document.getElementById("filterMonth")) document.getElementById("filterMonth").value = "";
  if (document.getElementById("filterType")) document.getElementById("filterType").value = "All";
  if (document.getElementById("filterStatus")) document.getElementById("filterStatus").value = "All";
  renderTable(); 
};

window.updateDonationStatus = function(docId, newStatus) {
  if (userRole === "admin") {
    if(confirm(`Are you sure you want to mark this donation as ${newStatus}?`)) {
      db.collection("donations").doc(docId).update({ status: newStatus }).catch(error => alert("Error: " + error.message));
    } else {
      renderTable();
    }
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
  document.getElementById("mName").innerText = data.donorName || "";
  document.getElementById("mMonth").innerText = formatMonthYearString(data.monthYear);
  document.getElementById("mAmount").innerText = data.amount || 0;
  document.getElementById("mType").innerText = data.donorType || "";
  document.getElementById("mCoord").innerText = data.coordinatorName || "N/A"; 
  document.getElementById("mDate").innerText = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate().toLocaleDateString("en-IN") : "N/A";
  document.getElementById("slipModal").style.display = "flex";
};

window.closeSlipModal = function() { 
  document.getElementById("slipModal").style.display = "none"; 
};

window.downloadSlipImage = async function() {
  const canvas = await html2canvas(document.getElementById("adminReceiptContent"), { scale: 2 }); 
  const link = document.createElement("a");
  link.download = "Donation_Receipt.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};
