 function togglePassword() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.querySelector("span.input-group-text ion-icon[name='eye']");
    
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.setAttribute("name", "eye-off");
    } else {
        passwordField.type = "password";
        eyeIcon.setAttribute("name", "eye");
    }
}
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    emailError.innerText = "";
    passwordError.innerText = "";

    if (!email) {
        emailError.innerText = "Email is required!";
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        emailError.innerText = "Enter a valid email!";
        isValid = false;
    }

    if (!password) {
        passwordError.innerText = "Password is required!";
        isValid = false;
    } else if (password.length < 6) {
        passwordError.innerText = "Password must be at least 6 characters!";
        isValid = false;
    }

    if (isValid) {
        if (document.getElementById("rememberMe").checked) {
            localStorage.setItem("rememberedEmail", email);
        } else {
            localStorage.removeItem("rememberedEmail");
        }

        alert("Login Successful!");
    }
});
window.onload = function () {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        document.getElementById("email").value = rememberedEmail;
        document.getElementById("rememberMe").checked = true;
    }
};