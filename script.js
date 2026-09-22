// 1. कर्मचारी लिस्ट (User ID और Password)
const EMPLOYEES = [
  { id: "emp101", pass: "pass123", name: "Ramesh Sharma" },
  { id: "emp102", pass: "pass123", name: "Suresh Kumar" },
  { id: "emp103", pass: "pass123", name: "Amit Verma" },
  { id: "emp104", pass: "pass123", name: "Rahul Singh" },
  { id: "emp105", pass: "pass123", name: "Pooja Gupta" }
];

let loggedInUser = null;

// Google Sheet Apps Script URL (नीचे दिए गए स्टेप्स से मिलेगा)
const GOOGLE_SHEET_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE";

// HTML Elements
const loginCard = document.getElementById("loginCard");
const collectionCard = document.getElementById("collectionCard");
const loginForm = document.getElementById("loginForm");
const collectionForm = document.getElementById("collectionForm");
const currentEmpLabel = document.getElementById("currentEmp");
const loginMsg = document.getElementById("loginMsg");
const statusMsg = document.getElementById("statusMsg");
const logoutBtn = document.getElementById("logoutBtn");

// Login Logic
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const idInput = document.getElementById("userId").value.trim();
  const passInput = document.getElementById("userPass").value.trim();

  // कर्मचारी चेक करें
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

// Logout Logic
logoutBtn.addEventListener("click", function() {
  loggedInUser = null;
  collectionCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
});

// Collection Form Submit Logic
collectionForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "Saving Data...";
  statusMsg.style.color = "blue";
  statusMsg.innerText = "कृपया प्रतीक्षा करें...";

  // तैयार डेटा
  const data = {
    dateTime: new Date().toLocaleString("en-IN"),
    employeeId: loggedInUser.id,
    employeeName: loggedInUser.name,
    customerName: document.getElementById("custName").value,
    customerMobile: document.getElementById("custMobile").value || "N/A",
    amount: document.getElementById("amount").value,
    payMode: document.getElementById("payMode").value,
    remarks: document.getElementById("remarks").value || "-"
  };

  // Google Sheet में भेजना
  fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    statusMsg.style.color = "green";
    statusMsg.innerText = "✅ एंट्री सफलतापूर्वक दर्ज हो गई!";
    collectionForm.reset();
  })
  .catch(err => {
    statusMsg.style.color = "red";
    statusMsg.innerText = "❌ एरर: डेटा सेव नहीं हो पाया!";
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerText = "Save Entry";
    setTimeout(() => { statusMsg.innerText = ""; }, 4000);
  });
});
