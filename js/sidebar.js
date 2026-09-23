// यह कोड आपके साइडबार को सभी पेजों पर लोड करेगा
const sidebarHTML = `
  <div class="sidebar">
    <div class="sidebar-logo-box">
      <img src="images/logo.png" alt="Team Logo">
    </div>
    <h2 style="margin-top: 0;">Admin Panel</h2>
    
    <a href="dashboard.html" id="nav-dashboard">Dashboard</a>
    <a href="coordinator-details.html" id="nav-coordinator">Coordinator Details</a>
    
    <button class="logout-btn" onclick="localStorage.removeItem('adminUser'); window.location.href='index.html';">Logout</button>
  </div>
`;

// जिस पेज पर 'sidebar-container' होगा, वहाँ यह HTML डाल दो
document.getElementById("sidebar-container").innerHTML = sidebarHTML;

// आप जिस पेज पर हैं, उस लिंक को अपने आप 'active' (डार्क ब्लू) करने का लॉजिक
const currentPage = window.location.pathname;

if (currentPage.includes("coordinator-details.html")) {
  document.getElementById("nav-coordinator").classList.add("active");
} else {
  // अगर कोई और पेज है, तो बाय डिफ़ॉल्ट Dashboard को एक्टिव रखो
  document.getElementById("nav-dashboard").classList.add("active");
}
