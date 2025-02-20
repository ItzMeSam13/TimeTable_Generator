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

// Form Validation
document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    nameError.innerText = "";
    emailError.innerText = "";
    passwordError.innerText = "";
    confirmPasswordError.innerText = "";

    if (name.trim() === "") {
        nameError.innerText = "Full Name is required!";
        isValid = false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        emailError.innerText = "Enter a valid email!";
        isValid = false;
    }

    if (password.length < 6) {
        passwordError.innerText = "Password must be at least 6 characters!";
        isValid = false;
    }

    if (password !== confirmPassword) {
        confirmPasswordError.innerText = "Passwords do not match!";
        isValid = false;
    }

    if (isValid) {
        const user = { name, email, password };
        localStorage.setItem("user", JSON.stringify(user));
        alert("Registration Successful!");
        window.location.href = "index.html"; // Redirect to Sign In page
    }
});