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

const tableBody = document.getElementById("donorsTableBody");

// Fetch live Donations Data
db.collection("donations").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
  tableBody.innerHTML = ""; // Clear table
  
  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 15px;">No donations recorded yet.</td></tr>`;
    return;
  }

  let index = 1;
  snapshot.forEach((doc) => {
    const data = doc.data();

    // Timestamp ko Date aur Time me convert karna
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
        <td>${data.monthYear}</td>
        <td style="color: #28a745; font-weight: bold;">₹ ${data.amount}</td>
        <td><span style="background: #e6f6ea; color: #28a745; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${data.donorType}</span></td>
        <td style="font-size: 13px; color: #555;">${submitDate}</td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}, (error) => {
  tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #dc3545; padding: 15px;">Failed to load data: ${error.message}</td></tr>`;
});
