// 1. अपनी Firebase Config यहाँ डालें (वही सेम वाली)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const tableBody = document.getElementById("coordinatorTableBody");

// रियल-टाइम डेटा टेबल में लाना
db.collection("coordinators").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  tableBody.innerHTML = ""; // टेबल खाली करना
  let index = 1;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const docId = doc.id; // Firebase Document ID

    // स्टेटस के हिसाब से रंग (CSS Class) तय करना
    let statusClass = "status-pending";
    if (data.status === "Approved") statusClass = "status-approved";
    if (data.status === "Rejected") statusClass = "status-rejected";

    // टेबल की रो (Row) बनाना
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
});

// 3. Status Update (Approve / Pending) फंक्शन
window.updateStatus = function(docId, newStatus) {
  db.collection("coordinators").doc(docId).update({
    status: newStatus
  }).catch((error) => {
    alert("Error updating status: " + error.message);
  });
};

// 4. Delete Record फंक्शन
window.deleteRecord = function(docId) {
  if (confirm("Are you sure you want to permanently delete this registration?")) {
    db.collection("coordinators").doc(docId).delete().catch((error) => {
      alert("Error deleting record: " + error.message);
    });
  }
};
