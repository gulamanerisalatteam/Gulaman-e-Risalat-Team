// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXXMSZOOd1Cb_Tuwp8ZnjT6Iwd0jMrh6U",
  authDomain: "gulaman-e-risalat-team.firebaseapp.com",
  projectId: "gulaman-e-risalat-team",
  storageBucket: "gulaman-e-risalat-team.firebasestorage.app",
  messagingSenderId: "284287467697",
  appId: "1:284287467697:web:e57714c6b594b0a9be6290"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const tableBody = document.getElementById("coordinatorTableBody");

// Fetch live coordinator registrations
db.collection("coordinators").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  tableBody.innerHTML = "";
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 15px;">No coordinators registered yet.</td></tr>`;
    return;
  }

  let index = 1;
  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id;

    let statusClass = "status-pending";
    if (data.status === "Approved") statusClass = "status-approved";
    if (data.status === "Rejected") statusClass = "status-rejected";

    const row = `
      <tr>
        <td>${index++}</td>
        <td><strong style="color: #0056b3;">${data.fullName}</strong></td>
        <td>${data.mobile}</td>
        <td>${data.aadhar}</td>
        <td>${data.dob}</td>
        <td><span class="${statusClass}">${data.status}</span></td>
        <td style="white-space: nowrap;">
          <button class="btn-approve" onclick="updateStatus('${docId}', 'Approved')">Approve</button>
          <button class="btn-pending" onclick="updateStatus('${docId}', 'Pending')">Pending</button>
          <button class="btn-delete" onclick="deleteRecord('${docId}')">Delete</button>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});

// Update Status (Approve / Pending)
window.updateStatus = function(docId, newStatus) {
  db.collection("coordinators").doc(docId).update({
    status: newStatus
  }).catch((error) => {
    alert("Error updating status: " + error.message);
  });
};

// Delete Registration
window.deleteRecord = function(docId) {
  if (confirm("Are you sure you want to permanently delete this registration?")) {
    db.collection("coordinators").doc(docId).delete().catch((error) => {
      alert("Error deleting record: " + error.message);
    });
  }
};
