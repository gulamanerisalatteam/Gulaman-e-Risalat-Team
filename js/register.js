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

// Form Submit Event
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const name = document.getElementById("regName").value;
  const mobile = document.getElementById("regMobile").value;
  const aadhar = document.getElementById("regAadhar").value; 
  const dob = document.getElementById("regDob").value;
  const password = document.getElementById("regPass").value;
  const msgBox = document.getElementById("regMsg");

  msgBox.style.color = "#0056b3";
  msgBox.innerText = "Saving data, please wait...";

  // Save to Firestore 'coordinators' collection
  db.collection("coordinators").add({
    fullName: name,
    mobile: mobile,
    aadhar: aadhar,
    dob: dob,
    password: password,
    status: "Pending",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgBox.style.color = "#28a745";
    msgBox.innerText = "Registration Successful! Waiting for Admin approval.";
    document.getElementById("registerForm").reset();
  }).catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});
