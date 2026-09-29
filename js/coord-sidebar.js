// js/coord-sidebar.js

const coordSidebarHTML = `
  <style>
    /* Coordinator Mobile Sidebar Styles */
    .coord-header {
        background: #0056b3;
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 900;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .coord-header h3 { margin: 0; font-size: 18px; }
    .menu-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
    }
    .coord-sidebar {
        position: fixed;
        top: 0;
        left: -260px;
        width: 250px;
        height: 100%;
        background: #fff;
        box-shadow: 2px 0 15px rgba(0,0,0,0.2);
        transition: 0.3s ease-in-out;
        z-index: 1000;
        display: flex;
        flex-direction: column;
    }
    .coord-sidebar.active { left: 0; }
    
    .sidebar-top {
        background: #f4f8fb;
        padding: 20px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }
    .sidebar-top img { width: 60px; margin-bottom: 10px; }
    .sidebar-top h4 { margin: 0; color: #0056b3; font-size: 16px; }

    .coord-sidebar a {
        display: block;
        padding: 15px 20px;
        color: #333;
        text-decoration: none;
        font-weight: bold;
        border-bottom: 1px solid #eee;
        font-size: 15px;
    }
    .coord-sidebar a:hover, .coord-sidebar a.active {
        background: #e9f2fa;
        color: #0056b3;
        border-left: 4px solid #0056b3;
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        z-index: 999;
    }
    .overlay.active { display: block; }
    
    .logout-btn-side {
        margin: 20px;
        text-align: center;
        background: #dc3545;
        color: white !important;
        border-radius: 5px;
        border: none !important;
    }
    .logout-btn-side:hover { background: #c82333 !important; color: white !important; }
    
    .close-btn {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 20px;
        cursor: pointer;
        color: #555;
        background: none;
        border: none;
    }
  </style>

  <!-- Mobile Header -->
  <div class="coord-header">
    <h3>Gulaman-e-Risalat</h3>
    <button class="menu-btn" id="openMenuBtn">☰</button>
  </div>

  <!-- Background Dark Overlay -->
  <div class="overlay" id="sidebarOverlay"></div>

  <!-- Sidebar Menu -->
  <div class="coord-sidebar" id="coordSidebar">
    <button class="close-btn" id="closeMenuBtn">✖</button>
    
    <div class="sidebar-top">
      <img src="images/logo.png" alt="Logo" onerror="this.style.display='none'">
      <h4>Coordinator App</h4>
    </div>
    
    <a href="donation-slip.html" id="nav-monthly-slip">🧾 Monthly Donors Slip</a>
    <a href="new-donors-form.html" id="nav-new-donor">➕ New Donors Form</a>
    
    <a href="#" class="logout-btn-side" onclick="logoutCoordinator()">🚪 Logout</a>
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

  // Sidebar Open/Close Logic
  document.getElementById("openMenuBtn").addEventListener("click", () => {
    document.getElementById("coordSidebar").classList.add("active");
    document.getElementById("sidebarOverlay").classList.add("active");
  });

  document.getElementById("closeMenuBtn").addEventListener("click", () => {
    document.getElementById("coordSidebar").classList.remove("active");
    document.getElementById("sidebarOverlay").classList.remove("active");
  });

  document.getElementById("sidebarOverlay").addEventListener("click", () => {
    document.getElementById("coordSidebar").classList.remove("active");
    document.getElementById("sidebarOverlay").classList.remove("active");
  });
}

// Logout Function
window.logoutCoordinator = function() {
  localStorage.removeItem("loggedInCoordinator");
  window.location.href = "index.html"; 
};
