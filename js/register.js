// 1. अपनी Firebase Config यहाँ डालें (Firebase Console से कॉपी करके)
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

// Form Submit Event
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault(); // पेज को रीफ्रेश होने से रोकना
  
  // इनपुट बॉक्स से वैल्यू निकालना
  const name = document.getElementById("regName").value;
  const mobile = document.getElementById("regMobile").value;
  const aadhar = document.getElementById("regAadhar").value; 
  const dob = document.getElementById("regDob").value;
  const password = document.getElementById("regPass").value;
  const msgBox = document.getElementById("regMsg");

  msgBox.style.color = "blue";
  msgBox.innerText = "Saving data, please wait...";

  // Firebase 'coordinators' कलेक्शन में डेटा सेव करना
  db.collection("coordinators").add({
    fullName: name,
    mobile: mobile,
    aadhar: aadhar,
    dob: dob,
    password: password,
    status: "Pending", // डिफ़ॉल्ट स्टेटस पेंडिंग रहेगा
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgBox.style.color = "green";
    msgBox.innerText = "Registration Successful! Please wait for Admin approval.";
    document.getElementById("registerForm").reset(); // फॉर्म खाली करना
  }).catch((error) => {
    msgBox.style.color = "red";
    msgBox.innerText = "Error: " + error.message;
  });
});
