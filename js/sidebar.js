// Sidebar aur Mobile Menu ka HTML
const sidebarHTML = `
  <div class="mobile-header">
    <h3 style="color: #0056b3; margin: 0; font-size: 18px; font-weight: bold;">Admin Panel</h3>
    <button class="menu-toggle" id="menuToggleBtn">☰ Menu</button>
  </div>
  
  <div class="sidebar-overlay" id="sidebarOverlay"></div>
  
  <div class="sidebar" id="mainSidebar">
    <div class="sidebar-logo-box">
      <img src="images/logo.png" alt="Team Logo">
    </div>
    <h2 style="margin-top: 0;">Admin Panel</h2>
    
    <a href="dashboard.html" id="nav-dashboard">Dashboard</a>
    <a href="coordinator-details.html" id="nav-coordinator">Coordinator Details</a>
    <a href="monthly-donors.html" id="nav-monthly-donors">Monthly Donors</a>
    <a href="monthly-donors-collection.html" id="nav-collection">Monthly Donors Collection</a> 
    <a href="assign-donors.html" id="nav-assign">Assign Donors</a>
    
    <button class="logout-btn" onclick="localStorage.removeItem('adminUser'); window.location.href='index.html';">Logout</button>
  </div>
`;

// HTML ko page me inject karna
document.getElementById("sidebar-container").innerHTML = sidebarHTML;

// Active page ko highlight karne ka logic
const currentPage = window.location.pathname;
if (currentPage.includes("coordinator-details.html")) {
  document.getElementById("nav-coordinator").classList.add("active");
} else if (currentPage.includes("monthly-donors-collection.html")) { 
  document.getElementById("nav-collection").classList.add("active");
} else if (currentPage.includes("monthly-donors.html")) { 
  document.getElementById("nav-monthly-donors").classList.add("active");
} else if (currentPage.includes("assign-donors.html")) { 
  document.getElementById("nav-assign").classList.add("active");
} else {
  // Default active tab dashboard rahega
  document.getElementById("nav-dashboard").classList.add("active");
}

// Sidebar Open / Close Logic (For Mobile)
const menuBtn = document.getElementById("menuToggleBtn");
const sidebar = document.getElementById("mainSidebar");
const overlay = document.getElementById("sidebarOverlay");

if (menuBtn && sidebar && overlay) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.add("active-sidebar");
    overlay.classList.add("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active-sidebar");
    overlay.classList.remove("active");
  });
}
