// 1. Security Check - Only Logged in Coordinators can access
const loggedInUser = JSON.parse(localStorage.getItem("loggedInCoordinator"));
if (!loggedInUser) {
  window.location.href = "index.html";
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

// 3. Form Submit Logic
document.getElementById("newDonorForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("ndName").value.trim();
  const mobile = document.getElementById("ndMobile").value.trim();
  const address = document.getElementById("ndAddress").value.trim();
  const amount = document.getElementById("ndAmount").value.trim();
  const msgBox = document.getElementById("msgBox");

  msgBox.style.color = "#0056b3";
  msgBox.innerText = "Generating slip, please wait...";

  try {
    const today = new Date();
    const currentMonthYear = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;

    // NAYA COLLECTION: ab data "new_donations" me save hoga
    await db.collection("new_donations").add({
      donorName: name,
      mobile: mobile,       
      address: address,     
      monthYear: currentMonthYear,
      amount: Number(amount),
      donorType: "New Donor", 
      coordinatorName: loggedInUser.fullName,
      coordinatorMobile: loggedInUser.mobile,
      status: "Pending", 
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update Receipt UI
    document.getElementById("rName").innerText = name;
    document.getElementById("rMobile").innerText = mobile;
    document.getElementById("rAmount").innerText = amount;
    document.getElementById("rCoord").innerText = loggedInUser.fullName;
    document.getElementById("rDate").innerText = today.toLocaleDateString("en-IN");

    // Switch Views
    msgBox.innerText = "";
    document.getElementById("formCard").style.display = "none";
    document.getElementById("receiptCard").style.display = "block";

  } catch (error) {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error: " + error.message;
  }
});

// 4. Share Receipt Image Function
window.shareReceipt = async function() {
  const receiptElement = document.getElementById("receiptContent");
  try {
    const canvas = await html2canvas(receiptElement, { scale: 2 }); 
    canvas.toBlob(async (blob) => {
      const file = new File([blob], "New_Donor_Receipt.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Donation Receipt",
          text: "Jazakallah for your generous donation! Here is your receipt."
        });
      } else {
        const link = document.createElement("a");
        link.download = "New_Donor_Receipt.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    });
  } catch (error) {
    alert("Error sharing image: " + error.message);
  }
};
