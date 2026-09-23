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

// Login Form Submit Event
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const loginId = document.getElementById("loginId").value.trim(); // Email ya Mobile
  const password = document.getElementById("loginPass").value;
  const msgBox = document.getElementById("loginMsg");

  msgBox.style.color = "#0056b3"; 
  msgBox.innerText = "Checking details, please wait...";

  // ==========================================
  // ADMIN LOGIN LOGIC (Agar input me '@' hai)
  // ==========================================
  if (loginId.includes("@")) {
    
    // Yahan aapke banaye hue 'employees' collection aur Document ID ka use kiya gaya hai
    db.collection("employees").doc(loginId).get()
    .then((doc) => {
      
      // Agar email (Document ID) nahi mila
      if (!doc.exists) {
        msgBox.style.color = "#dc3545"; 
        msgBox.innerText = "Admin Email not found!";
        return;
      }

      const adminData = doc.data();
      
      // Password match karna
      if (adminData.password === password) {
        msgBox.style.color = "#28a745"; 
        msgBox.innerText = "Admin Login Successful! Redirecting...";
        
        localStorage.setItem("adminUser", JSON.stringify(adminData));
        setTimeout(() => {
          window.location.href = "dashboard.html"; // Admin Dashboard
        }, 1500);
      } else {
        msgBox.style.color = "#dc3545"; 
        msgBox.innerText = "Incorrect Admin Password!";
      }
    })
    .catch((error) => {
      msgBox.style.color = "#dc3545";
      msgBox.innerText = "Error: " + error.message;
    });
  } 
  
  // ==========================================
  // COORDINATOR LOGIN LOGIC (Agar input Number hai)
  // ==========================================
  else {
    db.collection("coordinators").where("mobile", "==", loginId).get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        msgBox.style.color = "#dc3545"; 
        msgBox.innerText = "Mobile number not registered!";
        return;
      }

      let userFound = false;
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        
        if (userData.password === password) {
          userFound = true;
          
          if (userData.status === "Approved") {
            msgBox.style.color = "#28a745"; 
            msgBox.innerText = "Login Successful! Redirecting...";
            
            localStorage.setItem("loggedInCoordinator", JSON.stringify(userData));
            setTimeout(() => {
              window.location.href = "donation-slip.html"; // Coordinator Page
            }, 1500);

          } else if (userData.status === "Pending") {
            msgBox.style.color = "#f39c12"; 
            msgBox.innerText = "Your account is Pending. Please wait for Admin approval.";
          } else {
            msgBox.style.color = "#dc3545"; 
            msgBox.innerText = "Your account has been Rejected by Admin.";
          }
        }
      });

      if (!userFound) {
        msgBox.style.color = "#dc3545"; 
        msgBox.innerText = "Incorrect Password (PIN)!";
      }
    })
    .catch((error) => {
      msgBox.style.color = "#dc3545";
      msgBox.innerText = "Error: " + error.message;
    });
  }
});
