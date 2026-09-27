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

// 1. Box No. Show/Hide Logic
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
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 15px;">No donors added yet.</td></tr>`;
    return;
  }

  let index = 1;
  snapshot.forEach((doc) => {
    const data = doc.data();
    
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
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});
