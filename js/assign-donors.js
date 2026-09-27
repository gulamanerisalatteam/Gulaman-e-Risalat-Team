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

// 1. Load Coordinators (For Assigning and Filtering)
db.collection("employees").onSnapshot((snapshot) => {
  const coordSelect = document.getElementById("coordSelect");
  const filterCoord = document.getElementById("filterCoord");
  
  coordSelect.innerHTML = `<option value="" disabled selected>Select Coordinator</option>`;
  filterCoord.innerHTML = `<option value="All">All Coordinators</option>`;
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    coordSelect.innerHTML += `<option value="${data.fullName}">${data.fullName}</option>`;
    filterCoord.innerHTML += `<option value="${data.fullName}">${data.fullName}</option>`;
  });
});

// 2. Load All Donors & Split into 'Unassigned' and 'Assigned'
db.collection("monthly_donors_list").orderBy("donorName", "asc").onSnapshot((snapshot) => {
  window.unassignedDonors = [];
  window.assignedDonors = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    
    // Agar coordinator ka naam nahi hai, toh unassigned manein
    if (data.assignedCoordinator && data.assignedCoordinator !== "Unassigned") {
      window.assignedDonors.push(data);
    } else {
      window.unassignedDonors.push(data);
    }
  });

  renderUnassignedList();
  renderAssignedTable();
});

// 3. Render Checkbox List for Unassigned Donors (with Search Logic)
function renderUnassignedList() {
  const searchQuery = document.getElementById("searchUnassigned").value.toLowerCase();
  const listContainer = document.getElementById("unassignedList");
  listContainer.innerHTML = "";
  
  let hasData = false;

  window.unassignedDonors.forEach(donor => {
    if (donor.donorName.toLowerCase().includes(searchQuery)) {
      hasData = true;
      listContainer.innerHTML += `
        <div class="checkbox-item">
          <input type="checkbox" id="chk_${donor.id}" value="${donor.id}" class="donor-checkbox">
          <label for="chk_${donor.id}">${donor.donorName} <span style="color:#777; font-size:13px;">(${donor.mobile})</span></label>
        </div>
      `;
    }
  });

  if (!hasData) {
    listContainer.innerHTML = `<p style="color:#dc3545; font-size:14px; text-align:center; padding:10px;">No unassigned donors match your search.</p>`;
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

// 5. EVENT LISTENERS FOR SEARCH AND FILTERS
document.getElementById("searchUnassigned").addEventListener("input", renderUnassignedList);
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

  // Create an array of update promises
  const updatePromises = [];
  selectedCheckboxes.forEach(checkbox => {
    const donorId = checkbox.value;
    const p = db.collection("monthly_donors_list").doc(donorId).update({
      assignedCoordinator: coordName
    });
    updatePromises.push(p);
  });

  try {
    // Wait for all updates to finish
    await Promise.all(updatePromises);
    msgBox.style.color = "#28a745";
    msgBox.innerText = `✅ Successfully assigned ${selectedCheckboxes.length} donors to ${coordName}!`;
    
    // Form and search box reset
    document.getElementById("assignForm").reset();
    document.getElementById("searchUnassigned").value = "";
    
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
      assignedCoordinator: firebase.firestore.FieldValue.delete() // Field ko database se delete kar dega
    }).catch(error => {
      alert("Error removing assignment: " + error.message);
    });
  }
};
