document.getElementById("profileForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get values from inputs
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let mobile = document.getElementById("mobile").value;
    let password = document.getElementById("password").value;

    // Check if inputs are filled
    if (name && email && mobile && password) {
        document.getElementById("outputName").textContent = name;
        document.getElementById("outputEmail").textContent = email;
        document.getElementById("outputMobile").textContent = mobile;
        document.getElementById("outputPassword").textContent = "*".repeat(password.length); // Mask password

        document.getElementById("profileOutput").classList.remove("hidden");
    } else {
        alert("Please fill in all fields.");
    }
});