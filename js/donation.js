// 1. Check Login & Get Name safely
let loggedInUser = null;
let loggedInCoordName = "";

try {
  loggedInUser = JSON.parse(localStorage.getItem("loggedInCoordinator"));
  loggedInCoordName = loggedInUser.fullName || loggedInUser.name;
} catch(e) {
  window.location.href = "index.html";
}

if (!loggedInUser || !loggedInCoordName) {
  window.location.href = "index.html";
}

// 2. Firebase Init
const firebaseConfig = {
  apiKey: "AIzaSyAXXMSZOOd1Cb_Tuwp8ZnjT6Iwd0jMrh6U",
  authDomain: "gulaman-e-risalat-team.firebaseapp.com",
  projectId: "gulaman-e-risalat-team",
  storageBucket: "gulaman-e-risalat-team.firebasestorage.app",
  messagingSenderId: "284287467697",
  appId: "1:284287467697:web:e57714c6b594b0a9be6290"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. Welcome Text
document.getElementById("welcomeUser").innerText = `Welcome, ${loggedInCoordName}`;

// 4. LOAD ONLY ASSIGNED DONORS IN DROPDOWN
db.collection("monthly_donors_list").orderBy("donorName", "asc").onSnapshot(snapshot => {
  const select = document.getElementById("donorName");
  select.innerHTML = '<option value="" disabled selected>Select Donor</option>';
  
  let hasDonors = false;

  snapshot.forEach(doc => {
    const data = doc.data();
    // EXACT MATCH: Seedha assignment logic check ho raha hai
    if (data.assignedCoordinator === loggedInCoordName) {
      select.innerHTML += `<option value="${data.donorName}">${data.donorName}</option>`;
      hasDonors = true;
    }
  });

  if (!hasDonors) {
    select.innerHTML = '<option value="" disabled selected>No Donors Assigned to You</option>';
  }
});

// 5. Submit Form & Generate Receipt
document.getElementById("donationForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const dName = document.getElementById("donorName").value;
  const mYear = document.getElementById("monthYear").value;
  const amount = document.getElementById("donationAmount").value;
  const dType = document.getElementById("donorType").value;
  const msgBox = document.getElementById("donationMsg");
  
  if (!dName) {
    alert("Please select a valid donor.");
    return;
  }

  msgBox.style.color = "#0056b3";
  msgBox.innerText = "Generating slip, please wait...";

  try {
    await db.collection("donations").add({
      donorName: dName,
      monthYear: mYear,
      amount: Number(amount),
      donorType: dType,
      coordinatorName: loggedInCoordName,
      coordinatorMobile: loggedInUser.mobile || "N/A",
      status: "Pending", 
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("rName").innerText = dName;
    document.getElementById("rMonth").innerText = mYear; 
    document.getElementById("rAmount").innerText = amount;
    document.getElementById("rType").innerText = dType;
    document.getElementById("rCoord").innerText = loggedInCoordName;
    document.getElementById("rDate").innerText = new Date().toLocaleDateString("en-IN");

    msgBox.innerText = "";
    document.getElementById("formCard").style.display = "none";
    document.getElementById("receiptCard").style.display = "block";
    
  } catch (error) {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error saving donation: " + error.message;
  }
});

// 6. Form Reset
window.showFormAgain = function() {
  document.getElementById("donationForm").reset();
  document.getElementById("receiptCard").style.display = "none";
  document.getElementById("formCard").style.display = "block";
};

// 7. Download/Share Slip
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
          text: "Jazakallah for your generous donation! Here is your receipt."
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
