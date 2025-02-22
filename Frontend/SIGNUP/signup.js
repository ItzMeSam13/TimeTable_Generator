function togglePassword(inputId, eyeId) {
    const passwordField = document.getElementById(inputId);
    const eyeIcon = document.getElementById(eyeId);

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.setAttribute("name", "eye-off");
    } else {
        passwordField.type = "password";
        eyeIcon.setAttribute("name", "eye");
    }
}

// Form Validation and Signup API Call
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    let isValid = true;

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const nameError = document.getElementById("nameError");
    const phoneError = document.getElementById("phoneError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    nameError.innerText = "";
    phoneError.innerText = "";
    emailError.innerText = "";
    passwordError.innerText = "";
    confirmPasswordError.innerText = "";

    // Name validation
    if (name.trim() === "") {
        nameError.innerText = "Full Name is required!";
        isValid = false;
    }

    // Phone validation: Should be at least 10 digits and contain only numbers
    if (!/^\d{10,}$/.test(phone)) {
        phoneError.innerText = "Enter a valid phone number (at least 10 digits)!";
        isValid = false;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        emailError.innerText = "Enter a valid email!";
        isValid = false;
    }

    // Password validation
    if (password.length < 6) {
        passwordError.innerText = "Password must be at least 6 characters!";
        isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        confirmPasswordError.innerText = "Passwords do not match!";
        isValid = false;
    }

    if (isValid) {
        try {
            const response = await fetch("http://localhost:8001/auth", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, phone, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Registration Successful! Redirecting to dashboard...");
               window.location.href = "../DASHBOARD/dash.html";
            } else {
                alert(`❌ Error: ${data.message}`);
            }
        } catch (error) {
            console.error("❌ Signup Error:", error);
            alert("❌ Something went wrong. Try again!");
        }
    }
});
