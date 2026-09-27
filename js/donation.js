// 1. Security Check: Redirect to login if user is not authenticated
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

// 3. Donation Form Submit Event
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
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msgBox.innerText = "";
    
    // Receipt me data bharna
    document.getElementById("rName").innerText = donorName;
    document.getElementById("rMonth").innerText = monthYear;
    document.getElementById("rAmount").innerText = amount;
    document.getElementById("rType").innerText = donorType;
    
    // Aaj ki Date nikalna
    const today = new Date();
    document.getElementById("rDate").innerText = today.toLocaleDateString("en-IN");

    // Form hide karna aur Receipt show karna
    document.getElementById("formCard").style.display = "none";
    document.getElementById("receiptCard").style.display = "block";
    
    // Agli entry ke liye form clear kar dena
    document.getElementById("donationForm").reset();

  }).catch((error) => {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  });
});

// 4. Share Receipt Image Function
window.shareReceipt = async function() {
  const receiptElement = document.getElementById("receiptContent");
  
  try {
    // HTML ko Image Canvas me convert karna
    const canvas = await html2canvas(receiptElement, { scale: 2 }); // Scale 2 for HD quality
    
    // Canvas ko image file (blob) me badalna
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "Donation_Receipt.png", { type: "image/png" });
      
      // Mobile ka share menu open karna (WhatsApp, etc.)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Donation Receipt",
          text: "Jazakallah for your donation! Here is your receipt."
        });
      } else {
        // Agar laptop me hain ya share option nahi hai, to automatically Download ho jayega
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

// 5. Naya Form Kholna
window.showFormAgain = function() {
  document.getElementById("receiptCard").style.display = "none";
  document.getElementById("formCard").style.display = "block";
};

// 6. Logout Function
window.logoutCoordinator = function() {
  localStorage.removeItem("loggedInCoordinator");
  window.location.href = "index.html"; 
};
