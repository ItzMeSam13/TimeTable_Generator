const upcomingevent = document.getElementById("upcoming-event");

document.addEventListener("DOMContentLoaded", function () {
	const logoutBtn = document.getElementById("logoutBtn");
	const profileBtn = document.getElementById("profileBtn");

	logoutBtn.addEventListener("click", function () {
		const confirmLogout = confirm("Are you sure you want to log out?");
		if (confirmLogout) {
			alert("Logging out...");
			localStorage.removeItem("token"); 
			localStorage.removeItem("user"); 
			window.location.href = "../LOGIN/Login.html";
		}
	});

	profileBtn.addEventListener("click", function () {
		alert("Redirecting to Profile...");
		window.location.href = "../PROFILE/profile.html";
	});


	const token = localStorage.getItem("token");
	if (!token) {
		alert("Session expired. Please log in again.");
		window.location.href = "../LOGIN/Login.html"; 
		return;
	}

	console.log("User Token:", token);

	try {
		const tokenPayload = JSON.parse(atob(token.split(".")[1])); 
		const tokenExpiry = tokenPayload.exp * 1000; 
		const currentTime = Date.now();

		if (currentTime >= tokenExpiry) {
			alert("Session expired. Please log in again.");
			localStorage.removeItem("token"); 
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

        const response = await fetch("http://localhost:8001/tasklists/upcoming-event", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.status === 404) {
            upcomingBox.innerHTML = `<h2>${data.error}</h2>`;
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch upcoming tasks");
        }


        upcomingBox.innerHTML = `
            <div class="event-card">
                <h2>📅 Nearest Upcoming Task</h2>
                <div class="event-details">
                    <p><strong>📌 Task:</strong> ${data.task.title}</p>
                    <p><strong>⏰ Start:</strong> ${new Date(data.task.startTime).toLocaleString()}</p>
                    <p><strong>⏳ End:</strong> ${new Date(data.task.endTime).toLocaleString()}</p>
                    <p><strong>📝 Description:</strong> ${data.task.description}</p>
                </div>
            </div>
        `;

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


            document.querySelectorAll(".view-btn").forEach(button => {
                button.addEventListener("click", (event) => {
              
                    const taskListId = event.target.getAttribute("data-tasklist-id");
            
                    if (!taskListId) {
                        alert("Task List ID not found!");
                        return;
                    }
            
           
                    window.location.href = `${window.location.origin}/Frontend/CREATE/timetable.html?taskListId=${taskListId}`;
                });
            });
            

    } catch (error) {
        taskListContainer.innerHTML = `<h1>Error</h1><p>${error.message}</p>`;
    }
}


document.addEventListener("DOMContentLoaded", fetchUserTaskLists);
