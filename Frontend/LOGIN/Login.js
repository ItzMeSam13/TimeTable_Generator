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

// Select login form properly
const loginForm = document.querySelector("form");

if (!loginForm) {
    console.error("Error: loginForm element not found!");
} else {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        let isValid = true;

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");

        if (emailError) emailError.innerText = "";
        if (passwordError) passwordError.innerText = "";

        if (!email) {
            if (emailError) emailError.innerText = "Email is required!";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            if (emailError) emailError.innerText = "Enter a valid email!";
            isValid = false;
        }

        if (!password) {
            if (passwordError) passwordError.innerText = "Password is required!";
            isValid = false;
        } else if (password.length < 6) {
            if (passwordError) passwordError.innerText = "Password must be at least 6 characters!";
            isValid = false;
        }

        if (!isValid) {
            console.log("Form validation failed.");
            return;
        }

        console.log("Form validation passed. Sending API request...");

        try {
            const response = await fetch("http://localhost:8001/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            console.log("API response received.");

            const result = await response.json();

            if (response.ok) {
                console.log("Login successful:", result);

        
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", JSON.stringify(result.user));

           
                if (document.getElementById("rememberMe")?.checked) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }

                alert("Login Successful!");
                window.location.href = "../DASHBOARD/dash.html"; 
            } else {
                console.error("Login failed:", result.message);
                alert(result.message || "Login failed! Please check your credentials.");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Error connecting to server. Please try again later.");
        }
    });

    console.log("Login form event listener attached.");
}


window.onload = function () {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        document.getElementById("email").value = rememberedEmail;
        document.getElementById("rememberMe").checked = true;
    }
};
