// 1. आपकी Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXXMSZOOd1Cb_Tuwp8ZnjT6Iwd0jMrh6U",
  authDomain: "gulaman-e-risalat-team.firebaseapp.com",
  projectId: "gulaman-e-risalat-team",
  storageBucket: "gulaman-e-risalat-team.firebasestorage.app",
  messagingSenderId: "284287467697",
  appId: "1:284287467697:web:e57714c6b594b0a9be6290"
};

// 2. Firebase और Firestore शुरू करें
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let loggedInUser = null;

// HTML Elements
const loginCard = document.getElementById("loginCard");
const collectionCard = document.getElementById("collectionCard");
const loginForm = document.getElementById("loginForm");
const collectionForm = document.getElementById("collectionForm");
const currentEmpLabel = document.getElementById("currentEmp");
const loginMsg = document.getElementById("loginMsg");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

// 3. लॉगिन लॉजिक (अब एडमिन और कर्मचारी दोनों के लिए)
loginForm.addEventListener("submit", async function(e) {
  e.preventDefault(); 
  
  const idInput = document.getElementById("userId").value.trim();
  const passInput = document.getElementById("userPass").value.trim();
  const loginBtn = loginForm.querySelector("button[type='submit']");

  loginBtn.disabled = true;
  loginBtn.innerText = "Checking...";
  loginMsg.style.color = "blue";
  loginMsg.innerText = "डेटाबेस से चेक किया जा रहा है...";

  try {
    const docRef = db.collection("employees").doc(idInput);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const userData = docSnap.data();
      
      if (userData.password === passInput) {
        loggedInUser = { id: idInput, name: userData.name };
        
        // --- नया लॉजिक: चेक करें कि क्या लॉगिन करने वाला एडमिन है ---
        if (idInput === "gulamanerisalatteam@gmail.com") {
          // एडमिन है: डेटा को ब्राउज़र में सेव करें और डैशबोर्ड पर भेजें
          localStorage.setItem("adminUser", JSON.stringify(loggedInUser));
          window.location.href = "dashboard.html";
        } else {
          // नॉर्मल कर्मचारी है: पेमेंट कलेक्शन फॉर्म दिखाएं
          loginMsg.innerText = "";
          loginCard.classList.add("hidden");
          collectionCard.classList.remove("hidden");
          currentEmpLabel.innerText = userData.name;
          loginForm.reset();
        }
      } else {
        loginMsg.style.color = "red";
        loginMsg.innerText = "पासवर्ड गलत है!";
      }
    } else {
      loginMsg.style.color = "red";
      loginMsg.innerText = "यह User ID नहीं मिली!";
    }
  } catch (error) {
    loginMsg.style.color = "red";
    loginMsg.innerText = "एरर: " + error.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerText = "Login";
  }
});

// 4. लॉगआउट लॉजिक (कर्मचारियों के लिए)
logoutBtn.addEventListener("click", function() {
  loggedInUser = null;
  collectionCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
});

// 5. डेटा Firebase में सेव करने का लॉजिक (कर्मचारियों के लिए)
collectionForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "डेटा सेव हो रहा है...";
  statusMsg.style.color = "blue";
  statusMsg.innerText = "कृपया प्रतीक्षा करें...";

  const collectionData = {
    employeeId: loggedInUser.id,
    employeeName: loggedInUser.name,
    customerName: document.getElementById("custName").value.trim(),
    customerMobile: document.getElementById("custMobile").value.trim() || "N/A",
    amount: Number(document.getElementById("amount").value),
    paymentMode: document.getElementById("payMode").value,
    remarks: document.getElementById("remarks").value.trim() || "-",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("payments").add(collectionData)
    .then(() => {
      statusMsg.style.color = "green";
      statusMsg.innerText = "✅ डेटा सफलतापूर्वक Firebase में सेव हो गया!";
      collectionForm.reset();
    })
    .catch((error) => {
      statusMsg.style.color = "red";
      statusMsg.innerText = "❌ एरर: " + error.message;
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = "Save Entry";
      setTimeout(() => { statusMsg.innerText = ""; }, 4000);
    });
});
