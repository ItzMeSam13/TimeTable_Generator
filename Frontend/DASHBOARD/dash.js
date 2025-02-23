document.addEventListener("DOMContentLoaded", function () {
    const createTimeTableBtn = document.getElementById("createTimeTable");
    const logoutBtn = document.getElementById("logoutBtn");
    const profileBtn = document.getElementById("profileBtn");

    createTimeTableBtn.addEventListener("click", function () {
        alert("Time Table creation feature coming soon!");
    });

    logoutBtn.addEventListener("click", function () {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            alert("Logging out...");
            window.location.href = "login.html"; 
        }
    });

    profileBtn.addEventListener("click", function () {
        alert("Redirecting to Profile...");
        window.location.href = "../PROFILE/profile.html"; 
    });

    // Retrieve user details from localStorage
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));

    if (userDetails) {
        // Update the profile box with the user's details
        document.getElementById('user-name').textContent = userDetails.name;
        document.getElementById('profile-name').textContent = userDetails.name;
        document.getElementById('profile-email').textContent = userDetails.email;
        document.getElementById('profile-age').textContent = userDetails.age;
    } else {
        // Handle case where user details are not available
        console.error('User details not found in localStorage');
    }
});