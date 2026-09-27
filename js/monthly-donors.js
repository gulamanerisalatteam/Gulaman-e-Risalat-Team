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

// Global object to store data temporarily for the slip modal
window.donationsData = {};

// Helper Function: Convert '2026-09' to 'September-2026'
function formatMonthYearString(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return `${months[monthIndex]}-${parts[0]}`;
}

// Fetch live Donations Data
db.collection("donations").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  tableBody.innerHTML = ""; 
  window.donationsData = {}; // Clear old data
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    return;
  }

  let index = 1;
  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id;
    
    // Store data so the View Slip button can access it
    window.donationsData[docId] = data;

    // Convert Month Year (e.g., '2026-09' -> 'September-2026')
    const displayMonthYear = formatMonthYearString(data.monthYear);

    // Submission Date formatting
    let submitDate = "N/A";
    if (data.timestamp) {
      const dateObj = data.timestamp.toDate();
      submitDate = dateObj.toLocaleString("en-IN", { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: true 
      });
    }

    const row = `
      <tr>
        <td>${index++}</td>
        <td><strong style="color: #0056b3;">${data.donorName}</strong></td>
        <td>${displayMonthYear}</td>
        <td style="color: #28a745; font-weight: bold;">₹ ${data.amount}</td>
        <td><span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.donorType}</span></td>
        
        <!-- Naya Slip Column Button -->
        <td>
          <button onclick="openSlipModal('${docId}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight:bold;">View Slip</button>
        </td>

        <td style="font-size: 13px; color: #555;">${submitDate}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});

// --- SLIP MODAL FUNCTIONS ---

// Open Modal
window.openSlipModal = function(docId) {
  const data = window.donationsData[docId];
  if(!data) return;

  document.getElementById("mName").innerText = data.donorName;
  document.getElementById("mMonth").innerText = formatMonthYearString(data.monthYear);
  document.getElementById("mAmount").innerText = data.amount;
  document.getElementById("mType").innerText = data.donorType;
  document.getElementById("mCoord").innerText = data.coordinatorName || "N/A"; // Shows which coordinator took it

  document.getElementById("slipModal").style.display = "flex";
};

// Close Modal
window.closeSlipModal = function() {
  document.getElementById("slipModal").style.display = "none";
};

// Download Image function for Admin
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
