// Firebase Config
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

// Global Variables
window.unassignedDonors = [];
window.assignedDonors = [];

// 1. Load Coordinators 
// Note: Agar aapke Firebase me coordinators ki list kisi aur naam (jaise 'users') se save hoti hai, 
// toh niche "coordinators" ki jagah wo naam likh dein.
db.collection("coordinators").onSnapshot((snapshot) => {
  const coordSelect = document.getElementById("coordSelect");
  const filterCoord = document.getElementById("filterCoord");
  
  coordSelect.innerHTML = `<option value="" disabled selected>Select Coordinator</option>`;
  filterCoord.innerHTML = `<option value="All">All Coordinators</option>`;
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    // Assuming field name is fullName
    const coordName = data.fullName || data.name || doc.id; 
    coordSelect.innerHTML += `<option value="${coordName}">${coordName}</option>`;
    filterCoord.innerHTML += `<option value="${coordName}">${coordName}</option>`;
  });
}, (error) => {
  console.log("Error loading coordinators. Please check database collection name.");
});

// 2. Load All Donors & Split into 'Unassigned' and 'Assigned'
db.collection("monthly_donors_list").orderBy("donorName", "asc").onSnapshot((snapshot) => {
  window.unassignedDonors = [];
  window.assignedDonors = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    
    if (data.assignedCoordinator && data.assignedCoordinator !== "Unassigned") {
      window.assignedDonors.push(data);
    } else {
      window.unassignedDonors.push(data);
    }
  });

  renderUnassignedList();
  renderAssignedTable();
});

// 3. Render Checkbox List for Unassigned Donors (Only Name)
function renderUnassignedList() {
  const listContainer = document.getElementById("unassignedList");
  listContainer.innerHTML = "";
  
  let hasData = false;

  window.unassignedDonors.forEach(donor => {
    hasData = true;
    listContainer.innerHTML += `
      <div class="checkbox-item">
        <input type="checkbox" id="chk_${donor.id}" value="${donor.id}" class="donor-checkbox">
        <label for="chk_${donor.id}">${donor.donorName}</label>
      </div>
    `;
  });

  if (!hasData) {
    listContainer.innerHTML = `<p style="color:#28a745; font-size:14px; text-align:center; padding:10px;">All donors have been assigned! 🎉</p>`;
  }
}

// 4. Render Table for Assigned Donors (with Filter Logic)
function renderAssignedTable() {
  const fCoord = document.getElementById("filterCoord").value;
  const fName = document.getElementById("filterDonorName").value.toLowerCase();
  const tableBody = document.getElementById("assignedTableBody");
  
  tableBody.innerHTML = "";
  let index = 1;
  let hasVisibleRows = false;

  window.assignedDonors.forEach(donor => {
    const matchCoord = fCoord === "All" || donor.assignedCoordinator === fCoord;
    const matchName = donor.donorName.toLowerCase().includes(fName);

    if (matchCoord && matchName) {
      hasVisibleRows = true;
      const row = `
        <tr>
          <td>${index++}</td>
          <td><strong style="color: #0056b3;">${donor.assignedCoordinator}</strong></td>
          <td><strong style="color: #333;">${donor.donorName}</strong></td>
          <td>${donor.mobile}</td>
          <td>
            <button onclick="unassignDonor('${donor.id}')" style="background: #ffc107; color: black; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight:bold;">❌ Unassign</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    }
  });

  if (!hasVisibleRows) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; font-weight:bold; color:#dc3545;">No matching assigned donors found.</td></tr>`;
  }
}

// 5. EVENT LISTENERS FOR FILTERS
document.getElementById("filterCoord").addEventListener("change", renderAssignedTable);
document.getElementById("filterDonorName").addEventListener("input", renderAssignedTable);

// 6. SUBMIT ASSIGNMENT (Multiple Checkbox Saving)
document.getElementById("assignForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const coordName = document.getElementById("coordSelect").value;
  const selectedCheckboxes = document.querySelectorAll(".donor-checkbox:checked");
  const msgBox = document.getElementById("statusMsg");

  if (selectedCheckboxes.length === 0) {
    alert("Please select at least one donor from the list!");
    return;
  }

  msgBox.style.color = "#0056b3";
  msgBox.innerText = `Assigning ${selectedCheckboxes.length} donors, please wait...`;

  const updatePromises = [];
  selectedCheckboxes.forEach(checkbox => {
    const donorId = checkbox.value;
    const p = db.collection("monthly_donors_list").doc(donorId).update({
      assignedCoordinator: coordName
    });
    updatePromises.push(p);
  });

  try {
    await Promise.all(updatePromises);
    msgBox.style.color = "#28a745";
    msgBox.innerText = `✅ Successfully assigned ${selectedCheckboxes.length} donors to ${coordName}!`;
    
    document.getElementById("assignForm").reset();
    
    setTimeout(() => { msgBox.innerText = ""; }, 4000);
  } catch (error) {
    msgBox.style.color = "#dc3545";
    msgBox.innerText = "Error assigning donors: " + error.message;
  }
});

// 7. REMOVE ASSIGNMENT
window.unassignDonor = function(docId) {
  if(confirm("Are you sure you want to remove this coordinator assignment? The donor will move back to the unassigned list.")) {
    db.collection("monthly_donors_list").doc(docId).update({
      assignedCoordinator: firebase.firestore.FieldValue.delete()
    }).catch(error => {
      alert("Error removing assignment: " + error.message);
    });
  }
};
