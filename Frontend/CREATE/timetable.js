document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const taskListId = urlParams.get("taskListId");

    if (!taskListId) {
        alert("Invalid Task List ID!");
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8001/tasklists/${taskListId}/timetable`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch timetable");
        }

        console.log("Fetched Timetable:", data);
        displayTimetable(data.timetable);

    } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to load timetable: " + error.message);
    }
});

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function displayTimetable(timetable) {
    const tableBody = document.querySelector("#timetable tbody");
    tableBody.innerHTML = ""; 

    timetable.forEach(task => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${task.TaskName}</td>
            <td>${task.Date}</td>
            <td>${formatTime(task.StartTime)}</td>
            <td>${formatTime(task.EndTime)}</td>
            <td>${task.Duration} hrs</td>
            <td>${task.Priority.charAt(0).toUpperCase() + task.Priority.slice(1)}</td>
        `;

        tableBody.appendChild(row);
    });
}
