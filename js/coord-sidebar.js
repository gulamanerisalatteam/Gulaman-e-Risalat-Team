// js/coord-sidebar.js

const coordSidebarHTML = `
  <style>
    /* --- ADMIN-LIKE STYLES FOR COORDINATOR SIDEBAR --- */
    body {
        font-family: Arial, sans-serif;
    }
    
    /* Mobile Header */
    .mobile-header {
        background: #fff;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        position: sticky;
        top: 0;
        z-index: 1001;
    }
    .mobile-header h3 { 
        color: #0056b3; 
        margin: 0; 
        font-size: 18px; 
        font-weight: bold; 
    }
    .menu-toggle {
        background: #0056b3;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
    }
    
    /* Sidebar Base */
    .sidebar {
        position: fixed;
        top: 0;
        left: -260px; /* Default hidden on mobile */
        width: 250px;
        height: 100%;
        background: #fff;
        box-shadow: 2px 0 15px rgba(0,0,0,0.1);
        transition: left 0.3s ease-in-out;
        z-index: 1002;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }
    .sidebar.active-sidebar { left: 0; }
    
    /* Logo Box */
    .sidebar-logo-box {
        text-align: center;
        padding: 30px 20px 10px;
    }
    .sidebar-logo-box img {
        width: 90px; /* Admin Logo Size */
        margin-bottom: 15px;
    }
    .sidebar h2 {
        text-align: center;
        color: #0056b3;
        margin-top: 0;
        font-size: 20px;
        margin-bottom: 20px;
    }

    /* Links */
    .sidebar a {
        display: block;
        padding: 12px 25px;
        color: #333;
        text-decoration: none;
        font-size: 16px; /* Admin Font Size */
        font-weight: bold;
        transition: 0.2s;
        margin-bottom: 5px;
    }
    .sidebar a:hover {
        background: #f4f8fb;
        color: #0056b3;
    }
    
    /* Admin Style Active Tab (Blue with rounded right corners) */
    .sidebar a.active {
        background: #0056b3;
        color: white;
        border-radius: 0 25px 25px 0;
        margin-right: 15px;
    }
    
    /* Logout Button */
    .logout-btn {
        margin: auto 20px 20px;
        background: #dc3545;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        text-align: center;
    }
    .logout-btn:hover { background: #c82333; }
    
    /* Overlay */
    .sidebar-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        z-index: 1000;
    }
    .sidebar-overlay.active { display: block; }
    
    /* Close Button (Mobile Only) */
    .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 28px;
        background: none;
        border: none;
        color: #777;
        cursor: pointer;
    }

    /* Desktop View */
    @media (min-width: 769px) {
        .mobile-header { display: none; }
        .sidebar { left: 0; border-right: 1px solid #eee; box-shadow: none; }
        .sidebar-overlay { display: none !important; }
        .close-btn { display: none; }
        body { padding-left: 250px; } /* Content shifts right */
    }
  </style>

  <!-- Mobile Header -->
  <div class="mobile-header">
    <h3 style="color: #0056b3; margin: 0; font-size: 18px; font-weight: bold;">Coordinator App</h3>
    <!-- ☰ Menu Button -->
    <button class="menu-toggle" id="menuToggleBtn">☰ Menu</button>
  </div>

  <!-- Background Dark Overlay -->
  <div class="sidebar-overlay" id="sidebarOverlay"></div>

  <!-- Sidebar Menu -->
  <div class="sidebar" id="mainSidebar">
    <!-- Close Button (✖) -->
    <button class="close-btn" id="closeMenuBtn">×</button>
    
    <div class="sidebar-logo-box">
      <img src="images/logo.png" alt="Logo" onerror="this.style.display='none'">
    </div>
    <h2>Coordinator App</h2>
    
    <a href="donation-slip.html" id="nav-monthly-slip">Monthly Donors Slip</a>
    <a href="new-donors-form.html" id="nav-new-donor">New Donors Form</a>
    
    <button class="logout-btn" onclick="logoutCoordinator()">Logout</button>
  </div>
`;

// Container me inject karna
const sidebarContainer = document.getElementById("coord-sidebar-container");
if (sidebarContainer) {
  sidebarContainer.innerHTML = coordSidebarHTML;

  // Active Tab logic
  const currentPage = window.location.pathname;
  if (currentPage.includes("new-donors-form.html")) {
    document.getElementById("nav-new-donor").classList.add("active");
  } else {
    document.getElementById("nav-monthly-slip").classList.add("active");
  }

  // DOM Elements
  const menuBtn = document.getElementById("menuToggleBtn");
  const sidebar = document.getElementById("mainSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const closeBtn = document.getElementById("closeMenuBtn");

  // 1. Mobile par ☰ Menu click karne par khulega aur band hoga (Toggle)
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active-sidebar");
    overlay.classList.toggle("active");
  });

  // 2. Cross (×) button par click karke band karna
  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active-sidebar");
    overlay.classList.remove("active");
  });

  // 3. Kaale background (Overlay) par click karne par band karna
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active-sidebar");
    overlay.classList.remove("active");
  });
}

// Logout Function
window.logoutCoordinator = function() {
  localStorage.removeItem("loggedInCoordinator");
  window.location.href = "index.html"; 
};
