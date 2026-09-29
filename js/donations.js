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
const tableBody = document.getElementById("donationsTableBody");

window.donationsData = []; 
window.donorDetails = {}; // Store Mobile and Address for permanent donors

// 1. Fetch Permanent Donors List to get their Mobile and Address
db.collection("monthly_donors_list").onSnapshot((snapshot) => {
  window.donorDetails = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    window.donorDetails[data.donorName] = {
      mobile: data.mobile || "N/A",
      address: data.address || "N/A"
    };
  });
  renderTable(); 
});

// Populate Dropdowns Dynamically
function populateDropdowns() {
  const nameSet = new Set();
  const coordSet = new Set();

  window.donationsData.forEach((data) => {
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

// 2. Fetch live Donations Data (Both Monthly and One-Time)
db.collection("donations").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  window.donationsData = [];
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id; 
    window.donationsData.push(data);
  });

  populateDropdowns(); 
  renderTable(); 
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});


// 3. FILTERING & RENDER TABLE LOGIC
function renderTable() {
  const filterName = document.getElementById("filterName").value;
  const filterMobile = document.getElementById("filterMobile").value.trim();
  const filterCoord = document.getElementById("filterCoord").value;
  const filterDate = document.getElementById("filterDate").value; 
  const filterStatus = document.getElementById("filterStatus").value;

  tableBody.innerHTML = "";
  let index = 1;
  let hasVisibleRows = false;

  window.donationsData.forEach((data) => {
    const currentStatus = data.status || "Pending";
    const currentCoord = data.coordinatorName || "N/A";
    
    // SMART LOGIC: Agar One-Time donor hai toh data.mobile uthaega, warna monthly list se
    const dDetails = window.donorDetails[data.donorName] || {};
    const finalMobile = data.mobile || dDetails.mobile || "N/A";
    const finalAddress = data.address || dDetails.address || "N/A";
    
    let submitDateObj = null;
    let submitDateFormatted = "N/A";
    let submitDateForFilter = "";

    if (data.timestamp) {
      submitDateObj = data.timestamp.toDate();
      submitDateFormatted = submitDateObj.toLocaleString("en-IN", { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: true 
      });
      submitDateForFilter = submitDateObj.toISOString().split('T')[0];
    }

    // Filter Conditions Check
    const matchName = filterName === "All" || data.donorName === filterName;
    const matchMobile = filterMobile === "" || finalMobile.includes(filterMobile);
    const matchCoord = filterCoord === "All" || currentCoord === filterCoord;
    const matchStatus = filterStatus === "All" || currentStatus === filterStatus;
    const matchDate = filterDate === "" || submitDateForFilter === filterDate;

    if (matchName && matchMobile && matchCoord && matchStatus && matchDate) {
      hasVisibleRows = true;

      let statusBadge = "";
      if (currentStatus === "Pending") {
        statusBadge = `<span style="background:#fff3cd; color:#856404; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">⏳ Pending</span>`;
      } else if (currentStatus === "Accepted") {
        statusBadge = `<span style="background:#d4edda; color:#155724; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">✅ Accepted</span>`;
      } else { 
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
          <td>${finalMobile}</td>
          <td style="font-size: 12px; max-width: 200px;">${finalAddress}</td>
          <td style="color: #28a745; font-weight: bold;">₹ ${data.amount}</td>
          <td><strong style="color: #555;">${currentCoord}</strong></td>
          <td>
            <button onclick="openSlipModal('${data.id}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight:bold;">View Slip</button>
          </td>
          <td style="font-size: 13px; color: #555;">${submitDateFormatted}</td>
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
document.getElementById("filterMobile").addEventListener("input", renderTable); 
document.getElementById("filterCoord").addEventListener("change", renderTable); 
document.getElementById("filterDate").addEventListener("change", renderTable);
document.getElementById("filterStatus").addEventListener("change", renderTable);

// CLEAR FILTERS
window.clearFilters = function() {
  document.getElementById("filterName").value = "All";
  document.getElementById("filterMobile").value = ""; 
  document.getElementById("filterCoord").value = "All"; 
  document.getElementById("filterDate").value = "";
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
  }
};

// DELETE DONATION RECORD
window.deleteDonation = function(docId) {
  if(confirm("Are you sure you want to permanently delete this donation record? This action cannot be undone.")) {
    db.collection("donations").doc(docId).delete().catch((error) => {
      alert("Error deleting record: " + error.message);
    });
  }
};

// SLIP MODAL FUNCTIONS
window.openSlipModal = function(docId) {
  const data = window.donationsData.find(d => d.id === docId);
  if(!data) return;

  const dDetails = window.donorDetails[data.donorName] || {};
  const finalMobile = data.mobile || dDetails.mobile || "N/A";

  document.getElementById("mName").innerText = data.donorName;
  document.getElementById("mMobile").innerText = finalMobile;
  document.getElementById("mAmount").innerText = data.amount;
  document.getElementById("mType").innerText = data.donorType || "N/A";
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
