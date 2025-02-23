document.addEventListener("DOMContentLoaded", async function () {
    const profileForm = document.getElementById("profileForm");

    try {
        // Fetch user profile from backend
        const response = await fetch("http://localhost:8001/auth/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is stored in localStorage after login
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        const user = data.user;

        if (user) {
            document.getElementById("name").textContent = user.name;
            document.getElementById("email").textContent = user.email;
            document.getElementById("mobile").textContent = user.phone;
            document.getElementById("createdAt").textContent = new Date(user.createdAt).toLocaleString();
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Error loading profile. Please try again.");
    }

    // Edit profile button (optional functionality)
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Edit profile functionality will be implemented here.");
    });
});
