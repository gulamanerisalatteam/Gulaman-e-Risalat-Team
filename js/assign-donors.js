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

// Load Coordinators (From employees collection)
db.collection("employees").onSnapshot((snapshot) => {
  const coordSelect = document.getElementById("coordSelect");
  coordSelect.innerHTML = `<option value="" disabled selected>Select Coordinator</option>`;
  snapshot.forEach((doc) => {
    const data = doc.data();
    coordSelect.innerHTML += `<option value="${data.fullName}">${data.fullName}</option>`;
  });
});

// Load Donors (For Dropdown & Table)
db.collection("monthly_donors_list").orderBy("donorName", "asc").onSnapshot((snapshot) => {
  const donorSelect = document.getElementById("donorSelect");
  const tableBody = document.getElementById("assignedTableBody");
  
  donorSelect.innerHTML = `<option value="" disabled selected>Select Donor</option>`;
  tableBody.innerHTML = "";
  
  let index = 1;
  let hasData = false;

  snapshot.forEach((doc) => {
    hasData = true;
    const data = doc.data();
    const docId = doc.id;
    const assignedTo = data.assignedCoordinator || "Unassigned";

    // Add to dropdown (Sirf unhe dikhayein jo unassigned hain, ya sabhi ko overwrite karne ke liye dikhayein)
    donorSelect.innerHTML += `<option value="${docId}">${data.donorName} (${assignedTo})</option>`;

    // Add to Table
    const badgeColor = assignedTo === "Unassigned" ? "#dc3545" : "#28a745";
    const row = `
      <tr>
        <td>${index++}</td>
        <td><strong style="color: #333;">${data.donorName}</strong></td>
        <td>${data.mobile}</td>
        <td><span style="background: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${assignedTo}</span></td>
        <td>
          <button onclick="unassignDonor('${docId}')" style="background: #ffc107; color: black; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">Remove Assignment</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });

  if(!hasData) tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No donors found.</td></tr>`;
});

// Assign Donor to Coordinator
document.getElementById("assignForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const coordName = document.getElementById("coordSelect").value;
  const donorId = document.getElementById("donorSelect").value;
  const msgBox = document.getElementById("statusMsg");

  db.collection("monthly_donors_list").doc(donorId).update({
    assignedCoordinator: coordName
  }).then(() => {
    msgBox.style.color = "#28a745";
    msgBox.innerText = "✅ Donor assigned successfully!";
    setTimeout(() => { msgBox.innerText = ""; }, 3000);
  }).catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});

// Remove Assignment (Unassign)
window.unassignDonor = function(docId) {
  if(confirm("Remove this coordinator assignment?")) {
    db.collection("monthly_donors_list").doc(docId).update({
      assignedCoordinator: firebase.firestore.FieldValue.delete()
    });
  }
};
