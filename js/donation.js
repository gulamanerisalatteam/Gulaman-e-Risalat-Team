// 1. Security Check
const loggedInUser = JSON.parse(localStorage.getItem("loggedInCoordinator"));

if (!loggedInUser) {
  window.location.href = "index.html";
} else {
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 3. Date format helper
function formatMonthYearString(yyyyMm) {
  if (!yyyyMm || !yyyyMm.includes("-")) return yyyyMm;
  const parts = yyyyMm.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = parseInt(parts[1], 10) - 1;
  return `${months[monthIndex]}-${parts[0]}`;
}

// 4. FETCH DONORS FROM FIREBASE (Filtered by Assigned Coordinator)
const donorNameSelect = document.getElementById("donorName");
const donorTypeSelect = document.getElementById("donorType");

db.collection("monthly_donors_list").orderBy("donorName", "asc").onSnapshot((snapshot) => {
  donorNameSelect.innerHTML = `<option value="" disabled selected>Select Donor</option>`;
  
  let matchFound = false;

  snapshot.forEach((doc) => {
    const data = doc.data();
    
    // Sirf wahi donor dikhega jo logged-in user ko assign hai
    if (data.assignedCoordinator === loggedInUser.fullName) {
      matchFound = true;
      const option = document.createElement("option");
      option.value = data.donorName; 
      option.dataset.type = data.donorType; 
      option.innerText = data.donorName; // Mobile number remove kiya gaya
      donorNameSelect.appendChild(option);
    }
  });

  if (!matchFound) {
    donorNameSelect.innerHTML = `<option value="" disabled selected>No Donors Assigned to You</option>`;
  }
}, (error) => {
  donorNameSelect.innerHTML = `<option value="" disabled selected>Error loading donors</option>`;
});

// SMART AUTO-FILL: Jaise hi naam select hoga, Type apne aap fill ho jayega
donorNameSelect.addEventListener("change", function() {
  const selectedOption = this.options[this.selectedIndex];
  const type = selectedOption.dataset.type;
  if (type) {
    donorTypeSelect.value = type;
  }
});

// 5. Donation Form Submit Event
document.getElementById("donationForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const donorName = document.getElementById("donorName").value;
  const monthYear = document.getElementById("monthYear").value;
  const amount = document.getElementById("donationAmount").value;
  const donorType = document.getElementById("donorType").value;
  const msgBox = document.getElementById("donationMsg");

  msgBox.style.color = "#0056b3";
  msgBox.innerText = "Submitting donation slip...";

  // Save to Firebase
  db.collection("donations").add({
    donorName: donorName,
    monthYear: monthYear,
    amount: Number(amount), 
    donorType: donorType,
    coordinatorName: loggedInUser.fullName, 
    coordinatorMobile: loggedInUser.mobile, 
    status: "Pending", // Default status Pending save hoga
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgBox.innerText = "";
    
    document.getElementById("rName").innerText = donorName;
    document.getElementById("rMonth").innerText = formatMonthYearString(monthYear); 
    document.getElementById("rAmount").innerText = amount;
    document.getElementById("rType").innerText = donorType;
    document.getElementById("rCoord").innerText = loggedInUser.fullName;
    
    const today = new Date();
    document.getElementById("rDate").innerText = today.toLocaleDateString("en-IN");

    document.getElementById("formCard").style.display = "none";
    document.getElementById("receiptCard").style.display = "block";
    
    document.getElementById("donationForm").reset();

  }).catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});

// 6. Share Receipt Image Function
window.shareReceipt = async function() {
  const receiptElement = document.getElementById("receiptContent");
  try {
    const canvas = await html2canvas(receiptElement, { scale: 2 }); 
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "Donation_Receipt.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Donation Receipt",
          text: "Jazakallah for your donation! Here is your receipt."
        });
      } else {
        const link = document.createElement("a");
        link.download = "Donation_Receipt.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    });
  } catch (error) {
    alert("Error sharing image: " + error.message);
  }
};

// 7. Show Form Again
window.showFormAgain = function() {
  document.getElementById("receiptCard").style.display = "none";
  document.getElementById("formCard").style.display = "block";
};

// 8. Logout Function
window.logoutCoordinator = function() {
  localStorage.removeItem("loggedInCoordinator");
  window.location.href = "index.html"; 
};
