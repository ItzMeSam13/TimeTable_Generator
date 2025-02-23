const upcomingevent = document.getElementById("upcoming-event");

document.addEventListener("DOMContentLoaded", function () {
	const logoutBtn = document.getElementById("logoutBtn");
	const profileBtn = document.getElementById("profileBtn");

	logoutBtn.addEventListener("click", function () {
		const confirmLogout = confirm("Are you sure you want to log out?");
		if (confirmLogout) {
			alert("Logging out...");
			localStorage.removeItem("token"); // Clear token on logout
			localStorage.removeItem("user"); 
			window.location.href = "../LOGIN/Login.html";
		}
	});

	profileBtn.addEventListener("click", function () {
		alert("Redirecting to Profile...");
		window.location.href = "../PROFILE/profile.html";
	});

	// Retrieve token from localStorage
	const token = localStorage.getItem("token");
	if (!token) {
		alert("Session expired. Please log in again.");
		window.location.href = "../LOGIN/Login.html"; 
		return;
	}

	console.log("User Token:", token);

	// Decode token and check expiration
	try {
		const tokenPayload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
		const tokenExpiry = tokenPayload.exp * 1000; // Convert to milliseconds
		const currentTime = Date.now();

		if (currentTime >= tokenExpiry) {
			alert("Session expired. Please log in again.");
			localStorage.removeItem("token"); // Remove expired token
			localStorage.removeItem("user");
			window.location.href = "../LOGIN/Login.html";
		}
	} catch (error) {
		console.error("Error decoding token:", error);
		alert("Session error. Please log in again.");
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "../LOGIN/Login.html";
	}
});

document.addEventListener("DOMContentLoaded", function () {
	const createTimeTableBtn = document.getElementById("createTimeTable");

	createTimeTableBtn.addEventListener("click", function () {
		window.location.href = "../CREATE/create.html";
	});
});



upcomingevent.addEventListener("click", async () => {
    const upcomingBox = document.querySelector(".upcoming");
    upcomingBox.innerHTML = "<h1>Loading...</h1>";

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "../LOGIN/Login.html";
        return;
    }

    try {
        // 🔹 Fetch Google OAuth Token from Backend
        const googleTokenResponse = await fetch("http://localhost:8001/auth/google-token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!googleTokenResponse.ok) throw new Error("Failed to fetch Google token");

        const googleData = await googleTokenResponse.json();
        const googleToken = googleData.token;

        if (!googleToken) {
            alert("Google session expired. Please log in again.");
            window.location.href = "http://localhost:8001/auth/google";
            return;
        }

        // 🔹 Fetch upcoming event using the Google token
        const response = await fetch("http://localhost:8001/tasklists/upcoming-event", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  
                "Google-Authorization": `Bearer ${googleToken}` 
            }
        });

        const text = await response.text(); 

        try {
            const data = JSON.parse(text); 
            if (!data.task) throw new Error("No task data found");
        
            upcomingBox.innerHTML = `
                <div class="event-card">
                    <h2>📅 Upcoming Event</h2>
                    <div class="event-details">
                        <p><strong>📌 Task:</strong> ${data.task.title}</p>
                        <p><strong>⏰ Start:</strong> ${new Date(data.task.startTime).toLocaleString()}</p>
                        <p><strong>⏳ End:</strong> ${new Date(data.task.endTime).toLocaleString()}</p>
                        <p><strong>📝 Description:</strong> ${data.task.description}</p>
                    </div>
                </div>
            `;
        } catch (jsonError) {
            throw new Error("Invalid JSON response from server. Response was: " + text);
        }
        
    } catch (error) {
        upcomingBox.innerHTML = `<h1>Error</h1><p>${error.message}</p>`;
    }
});

async function fetchUserTaskLists() {
    const createTimeTableSection = document.querySelector(".create-time-table");

    if (!createTimeTableSection) {
        console.error("❌ Error: Section '.create-time-table' not found!");
        return;
    }

    const taskListContainer = document.createElement("div");
    taskListContainer.classList.add("tasklist-container");
    taskListContainer.innerHTML = "<h1>Loading task lists...</h1>";

    createTimeTableSection.prepend(taskListContainer);

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8001/tasklists", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch task lists");

        const data = await response.json();
        if (!data.taskLists || data.taskLists.length === 0) {
            taskListContainer.innerHTML = "<p>No task lists found.</p>";
            return;
        }

        taskListContainer.innerHTML = `
            <h2>📌 Your Task Lists</h2>
            <ul class="tasklist-items">
                ${data.taskLists.map(taskList => `
                    <li class="tasklist-item">
                        <span>${taskList.name}</span>
                        <button class="view-btn" data-tasklist-id="${taskList.id}">View</button>
                    </li>
                `).join("")}
            </ul>
        `;

        // Add event listener to each "View" button
            document.querySelectorAll(".view-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    // Get the taskListId dynamically from the button's data attribute
                    const taskListId = event.target.getAttribute("data-tasklist-id");
            
                    if (!taskListId) {
                        alert("Task List ID not found!");
                        return;
                    }
            
                    // Redirect to the timetable page with the correct taskListId
                    window.location.href = `${window.location.origin}/Frontend/CREATE/timetable.html?taskListId=${taskListId}`;
                });
            });
            

    } catch (error) {
        taskListContainer.innerHTML = `<h1>Error</h1><p>${error.message}</p>`;
    }
}

// Invoke function when dashboard loads
document.addEventListener("DOMContentLoaded", fetchUserTaskLists);
