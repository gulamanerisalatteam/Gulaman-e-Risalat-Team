// Firebase configuration (आपकी सेव की हुई कॉन्फ़िग)
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

// Login Form Submit Event
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const mobile = document.getElementById("loginMobile").value;
  const password = document.getElementById("loginPass").value;
  const msgBox = document.getElementById("loginMsg");

  msgBox.style.color = "#0056b3"; // Blue color while checking
  msgBox.innerText = "Checking details, please wait...";

  // Firestore Database में मोबाइल नंबर ढूँढना
  db.collection("coordinators").where("mobile", "==", mobile).get()
  .then((querySnapshot) => {
    
    // अगर मोबाइल नंबर डेटाबेस में नहीं मिला
    if (querySnapshot.empty) {
      msgBox.style.color = "#dc3545"; // Red color
      msgBox.innerText = "Mobile number not registered!";
      return;
    }

    let userFound = false;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();

      // पासवर्ड (PIN) मैच करना
      if (userData.password === password) {
        userFound = true;
        
        // Admin Approval स्टेटस चेक करना
        if (userData.status === "Approved") {
          msgBox.style.color = "#28a745"; // Green color
          msgBox.innerText = "Login Successful! Redirecting...";
          
          // यूज़र का डेटा लोकल स्टोरेज में सेव करना (ताकि डैशबोर्ड पर नाम दिख सके)
          localStorage.setItem("loggedInCoordinator", JSON.stringify(userData));
          
          // थोड़ी देर बाद कोऑर्डिनेटर के डैशबोर्ड पर भेज देना
          setTimeout(() => {
            window.location.href = "coordinator-home.html"; // यह पेज हम आगे बनाएंगे
          }, 1500);

        } else if (userData.status === "Pending") {
          msgBox.style.color = "#f39c12"; // Orange color
          msgBox.innerText = "Your account is Pending. Please wait for Admin approval.";
        } else {
          msgBox.style.color = "#dc3545"; // Red color
          msgBox.innerText = "Your account has been Rejected by Admin.";
        }
      }
    });

    // अगर नंबर मिल गया लेकिन पासवर्ड गलत है
    if (!userFound) {
      msgBox.style.color = "#dc3545"; // Red color
      msgBox.innerText = "Incorrect Password (PIN)!";
    }
  })
  .catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});
