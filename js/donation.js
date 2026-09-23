// 1. Security Check: Redirect to login if user is not authenticated
const loggedInUser = JSON.parse(localStorage.getItem("loggedInCoordinator"));

if (!loggedInUser) {
  window.location.href = "index.html";
} else {
  // Show coordinator's name in the top bar
  document.getElementById("welcomeUser").innerText = "Welcome, " + loggedInUser.fullName;
}

// 2. Firebase configuration
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

// 3. Donation Form Submit Event
document.getElementById("donationForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const donorName = document.getElementById("donorName").value;
  const donorMobile = document.getElementById("donorMobile").value;
  const amount = document.getElementById("donationAmount").value;
  const mode = document.getElementById("paymentMode").value;
  const remarks = document.getElementById("donationRemarks").value;
  const msgBox = document.getElementById("donationMsg");

  msgBox.style.color = "#0056b3";
  msgBox.innerText = "Submitting payment entry...";

  // Save data to Firestore 'donations' collection
  db.collection("donations").add({
    donorName: donorName,
    donorMobile: donorMobile,
    amount: Number(amount), // Saved as number for easy dashboard calculations
    paymentMode: mode,
    remarks: remarks,
    coordinatorName: loggedInUser.fullName, 
    coordinatorMobile: loggedInUser.mobile, 
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgBox.style.color = "#28a745";
    msgBox.innerText = "Donation successfully recorded!";
    document.getElementById("donationForm").reset(); // Clear form fields
    
    // Remove success message after 3 seconds
    setTimeout(() => {
      msgBox.innerText = "";
    }, 3000);
    
  }).catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});

// 4. Logout Function
window.logoutCoordinator = function() {
  localStorage.removeItem("loggedInCoordinator"); // Clear saved session
  window.location.href = "index.html"; // Redirect to login
};
