
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

// 3. कर्मचारियों की लिस्ट (ID, Password, Name)
const EMPLOYEES = [
  { id: "emp101", pass: "12345", name: "Ramesh" },
  { id: "emp102", pass: "12345", name: "Suresh" },
  { id: "emp103", pass: "12345", name: "Amit" },
  { id: "emp104", pass: "12345", name: "Rahul" },
  { id: "emp105", pass: "12345", name: "Pooja" }
];

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

// 4. लॉगिन लॉजिक
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const idInput = document.getElementById("userId").value.trim();
  const passInput = document.getElementById("userPass").value.trim();

  const matchedUser = EMPLOYEES.find(emp => emp.id === idInput && emp.pass === passInput);

  if (matchedUser) {
    loggedInUser = matchedUser;
    loginMsg.innerText = "";
    loginCard.classList.add("hidden");
    collectionCard.classList.remove("hidden");
    currentEmpLabel.innerText = matchedUser.name;
    loginForm.reset();
  } else {
    loginMsg.innerText = "गलत User ID या Password!";
  }
});

// 5. लॉगआउट लॉजिक
logoutBtn.addEventListener("click", function() {
  loggedInUser = null;
  collectionCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
});

// 6. डेटा Firebase में सेव करने का लॉजिक
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
    createdAt: firebase.firestore.FieldValue.serverTimestamp() // ऑटोमैटिक डेट और टाइम
  };

  // Firestore के "payments" कलेक्शन में डेटा जोड़ना
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
