// Firebase Config
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

// Global object to store data for editing
window.donorsData = {};

// 1. Box No. Show/Hide Logic (For Add Form)
const donorTypeSelect = document.getElementById("dType");
const boxNoContainer = document.getElementById("boxNoContainer");
const boxNoInput = document.getElementById("dBoxNo");

donorTypeSelect.addEventListener("change", function() {
  if (this.value === "Box") {
    boxNoContainer.style.display = "block";
    boxNoInput.setAttribute("required", "true");
  } else {
    boxNoContainer.style.display = "none";
    boxNoInput.removeAttribute("required");
    boxNoInput.value = ""; 
  }
});

// 2. Form Submit Logic (Add Donor)
document.getElementById("addDonorForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const msgBox = document.getElementById("statusMsg");
  msgBox.style.color = "#0056b3";
  msgBox.innerText = "Saving Donor, please wait...";

  const donorType = document.getElementById("dType").value;
  const boxNo = document.getElementById("dBoxNo").value;
  const donorName = document.getElementById("dName").value.trim();
  const mobile = document.getElementById("dMobile").value.trim();
  const address = document.getElementById("dAddress").value.trim();

  db.collection("monthly_donors_list").add({
    donorType: donorType,
    boxNo: donorType === "Box" ? boxNo : "N/A",
    donorName: donorName,
    mobile: mobile,
    address: address,
    addedOn: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgBox.style.color = "#28a745";
    msgBox.innerText = "✅ Donor Added Successfully!";
    
    document.getElementById("addDonorForm").reset();
    boxNoContainer.style.display = "none";
    
    setTimeout(() => { msgBox.innerText = ""; }, 3000);
  }).catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});

// 3. Fetch and Display Donors in Table (Live Update)
const tableBody = document.getElementById("donorListBody");

db.collection("monthly_donors_list").orderBy("addedOn", "desc").onSnapshot((snapshot) => {
  tableBody.innerHTML = ""; 
  window.donorsData = {}; // Clear global data
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 15px;">No donors added yet.</td></tr>`;
    return;
  }

  let index = 1;
  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id;
    
    // Save data globally for Edit Modal
    window.donorsData[docId] = data;
    
    // Type Styling
    let typeBadge = data.donorType === "Box" 
      ? `<span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Box</span>`
      : `<span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Without Box</span>`;

    let boxDisplay = data.boxNo !== "N/A" ? `<strong style="color:#0056b3;">${data.boxNo}</strong>` : `<span style="color:#999;">N/A</span>`;

    const row = `
      <tr>
        <td>${index++}</td>
        <td><strong style="color: #333;">${data.donorName}</strong></td>
        <td>${data.mobile}</td>
        <td>${typeBadge}</td>
        <td>${boxDisplay}</td>
        <td style="font-size: 13px; color: #555;">${data.address || "N/A"}</td>
        <td style="display: flex; gap: 5px;">
          <button onclick="openEditModal('${docId}')" style="background: #ffc107; color: black; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">✏️ Edit</button>
          <button onclick="deleteDonor('${docId}')" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">🗑️ Delete</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});

// 4. DELETE LOGIC
window.deleteDonor = function(docId) {
  if (confirm("Are you sure you want to delete this donor?")) {
    db.collection("monthly_donors_list").doc(docId).delete().then(() => {
      // Firebase onSnapshot apne aap table ko refresh kar dega
    }).catch((error) => {
      alert("Error deleting donor: " + error.message);
    });
  }
};

// 5. EDIT LOGIC (Modal Open/Close & Form Submit)
const editModal = document.getElementById("editModal");
const eType = document.getElementById("eType");
const eBoxNoContainer = document.getElementById("eBoxNoContainer");
const eBoxNo = document.getElementById("eBoxNo");

window.openEditModal = function(docId) {
  const data = window.donorsData[docId];
  if(!data) return;

  document.getElementById("eDocId").value = docId;
  document.getElementById("eType").value = data.donorType;
  document.getElementById("eName").value = data.donorName;
  document.getElementById("eMobile").value = data.mobile;
  document.getElementById("eAddress").value = data.address || "";

  if (data.donorType === "Box") {
    eBoxNoContainer.style.display = "block";
    eBoxNo.value = data.boxNo !== "N/A" ? data.boxNo : "";
    eBoxNo.setAttribute("required", "true");
  } else {
    eBoxNoContainer.style.display = "none";
    eBoxNo.value = "";
    eBoxNo.removeAttribute("required");
  }

  editModal.style.display = "flex";
};

window.closeEditModal = function() {
  editModal.style.display = "none";
};

// Edit Box Change Logic
eType.addEventListener("change", function() {
  if (this.value === "Box") {
    eBoxNoContainer.style.display = "block";
    eBoxNo.setAttribute("required", "true");
  } else {
    eBoxNoContainer.style.display = "none";
    eBoxNo.removeAttribute("required");
    eBoxNo.value = "";
  }
});

// Submit Edited Data
document.getElementById("editDonorForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const docId = document.getElementById("eDocId").value;
  const type = eType.value;
  const boxNo = type === "Box" ? eBoxNo.value : "N/A";
  const name = document.getElementById("eName").value.trim();
  const mobile = document.getElementById("eMobile").value.trim();
  const address = document.getElementById("eAddress").value.trim();

  db.collection("monthly_donors_list").doc(docId).update({
    donorType: type,
    boxNo: boxNo,
    donorName: name,
    mobile: mobile,
    address: address
  }).then(() => {
    closeEditModal();
    // Alert lagane ki zarurat nahi, table automatically update ho jayegi onSnapshot ki wajah se
  }).catch((error) => {
    alert("Error updating donor: " + error.message);
  });
});
