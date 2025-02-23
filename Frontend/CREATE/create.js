// Create Task List Function
async function createTaskBox() {
    const taskListNameInput = document.getElementById("taskListName");
    const taskContainer = document.getElementById("taskContainer");
    const taskListName = taskListNameInput.value.trim();
    if (!taskListName) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8001/tasklists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: taskListName }),
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (!data.taskListId) {
            throw new Error("Task list ID is missing in the API response");
        }

        const taskListId = data.taskListId;

        taskContainer.innerHTML = `
            <div class="task-box">
                <h3>${taskListName}</h3>
                <div id="taskInputsContainer">
                    <div class="task-input">
                        <input type="text" placeholder="Task name" class="taskName">
                        <input type="date" class="taskDeadline">
                        <input type="number" placeholder="Duration (hours)" class="taskDuration">
                        <select class="taskPriority">
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
                <br>
                <button id="addTaskBtn">Add Task</button>
                <br>
                <button id="saveTasksBtn">Save Tasks</button> <!-- Save all tasks at once -->
                <ul id="taskList"></ul>
            </div>
            <button id="generateTimetable">Generate Timetable</button> 
        `;

   
        taskListNameInput.disabled = true;
        document.getElementById("addTaskListBtn").textContent = "Delete";
        document.getElementById("addTaskListBtn").removeEventListener("click", createTaskBox);
        document.getElementById("addTaskListBtn").addEventListener("click", deleteTaskBox);


        document.getElementById("addTaskBtn").addEventListener("click", function () {
            addTaskToUI();
        });

        document.getElementById("saveTasksBtn").addEventListener("click", function () {
            saveAllTasks(taskListId);
        });

        document.getElementById("generateTimetable").addEventListener("click", function () {
            generateTimetable(taskListId);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}


function addTaskToUI() {
    const taskInputsContainer = document.getElementById("taskInputsContainer");

    const taskInputDiv = document.createElement("div");
    taskInputDiv.classList.add("task-input");
    taskInputDiv.innerHTML = `
        <input type="text" placeholder="Task name" class="taskName">
        <input type="date" class="taskDeadline">
        <input type="number" placeholder="Duration (hours)" class="taskDuration">
        <select class="taskPriority">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
        </select>
    `;

    taskInputsContainer.appendChild(taskInputDiv);
}


async function saveAllTasks(taskListId) {
    const taskInputs = document.querySelectorAll("#taskInputsContainer .task-input");
    if (taskInputs.length === 0) {
        alert("No tasks added to save.");
        return;
    }

    const tasks = [];
    let allFieldsFilled = true;


taskInputs.forEach((inputDiv) => {
    const taskName = inputDiv.querySelector(".taskName").value.trim();
    const taskDeadline = inputDiv.querySelector(".taskDeadline").value;
    const taskDuration = inputDiv.querySelector(".taskDuration").value;
    const taskPriority = inputDiv.querySelector(".taskPriority").value;

    if (!taskName || !taskDeadline || !taskDuration || !taskPriority) {
        allFieldsFilled = false; 
    } else {
        tasks.push({
            TaskName: taskName,
            Deadline: taskDeadline,
            Duration: Number(taskDuration),
            Priority: taskPriority.toLowerCase(),
        });
    }
});


if (!allFieldsFilled) {
    alert("Please fill all fields before saving tasks.");
    return;
}

const token = localStorage.getItem("token");

try {
    const response = await fetch(`http://localhost:8001/tasklists/${taskListId}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tasks })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to save tasks");
    }

    console.log("Tasks saved:", data);
    alert("All tasks saved successfully!");

} catch (error) {
    console.error("Error:", error.message);
    alert("Error saving tasks: " + error.message);
}

}

async function generateTimetable(taskListId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8001/tasklists/${taskListId}/generate-timetable`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to generate timetable");
        }

        console.log("Generated Timetable:", data);
        alert("Timetable generated successfully!");

    
        let viewTimetableBtn = document.getElementById("viewTimetableBtn");
        if (!viewTimetableBtn) {
            viewTimetableBtn = document.createElement("button");
            viewTimetableBtn.textContent = "View Timetable";
            viewTimetableBtn.id = "viewTimetableBtn";
            viewTimetableBtn.style.marginTop = "10px"; // Add spacing
            document.getElementById("taskContainer").appendChild(viewTimetableBtn);
        }

        viewTimetableBtn.addEventListener("click", function () {
            window.location.href = `timetable.html?taskListId=${taskListId}`;
        });

    } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to generate timetable: " + error.message);
    }
}
async function deleteTaskBox() {
    const taskListNameInput = document.getElementById("taskListName");
    const taskContainer = document.getElementById("taskContainer");
    const taskListName = taskListNameInput.value.trim();
    if (!taskListName) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8001/tasklists", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: taskListName }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete task list");
        }

        alert("Task list deleted!");
        taskContainer.innerHTML = "";
        taskListNameInput.disabled = false;
        document.getElementById("addTaskListBtn").textContent = "Create";
        document.getElementById("addTaskListBtn").addEventListener("click", createTaskBox);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

document.getElementById("addTaskListBtn").addEventListener("click", createTaskBox);
