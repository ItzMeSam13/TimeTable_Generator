// Create Task List Function
async function createTaskBox() {
    const taskListNameInput = document.getElementById("taskListName");
    const taskContainer = document.getElementById("taskContainer");
    const taskListName = taskListNameInput.value.trim();
    if (!taskListName) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:8001/tasklists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: taskListName }),
        });

        const data = await response.json();
        console.log("API Response:", data);  // Log response to check structure

        if (!data.taskListId) {
            throw new Error('Task list ID is missing in the API response');
        }

        const taskListId = data.taskListId;  // ✅ Correctly extracting `taskListId`

        // Update UI
        taskContainer.innerHTML = `
            <div class="task-box">
                <h3>${taskListName}</h3>
                <div class="task-input">
                    <input type="text" placeholder="Task name" id="taskName">
                    <input type="date" id="taskDeadline">
                    <input type="number" placeholder="Duration (hours)" id="taskDuration">
                    <select id="taskPriority">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <button id="addTaskBtn">Add Task</button>
                </div>
                <ul id="taskList"></ul>
            </div>
            <button id="generatetimetable">Generate Timetable</button>
        `;

        // Disable input and update button
        taskListNameInput.disabled = true;
        document.getElementById("addTaskListBtn").textContent = 'Delete';
        document.getElementById("addTaskListBtn").removeEventListener('click', createTaskBox);
        document.getElementById("addTaskListBtn").addEventListener('click', deleteTaskBox);

        // ✅ Add Task Functionality Here
        document.getElementById('addTaskBtn').addEventListener('click', function () {
            addTask(taskListId); // ✅ Pass correct `taskListId`
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Add Task Function
async function addTask(taskListId) {
    const taskName = document.getElementById("taskName").value.trim();
    const taskDeadline = document.getElementById("taskDeadline").value;
    const taskDuration = document.getElementById("taskDuration").value;
    const taskPriority = document.getElementById("taskPriority").value;

    if (!taskName || !taskDeadline || !taskDuration || !taskPriority) {
        alert("Please fill all fields before adding a task.");
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8001/tasklists/${taskListId}/tasks`, { // ✅ Correct URL format
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                tasks: [{
                    TaskName: taskName,
                    Deadline: taskDeadline,
                    Duration: Number(taskDuration),
                    Priority: taskPriority
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to add task");
        }

        console.log("Task added:", data);
        alert("Task added successfully!");

    } catch (error) {
        console.error("Error:", error.message);
        alert("Error adding task: " + error.message);
    }
}

// Delete Task List Function (Optional)
async function deleteTaskBox() {
    const taskListNameInput = document.getElementById("taskListName");
    const taskContainer = document.getElementById("taskContainer");
    const taskListName = taskListNameInput.value.trim();
    if (!taskListName) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:8001/tasklists', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: taskListName }),
        });

        if (!response.ok) {
            throw new Error("Failed to delete task list");
        }

        alert("Task list deleted!");
        taskContainer.innerHTML = "";
        taskListNameInput.disabled = false;
        document.getElementById("addTaskListBtn").textContent = 'Create';
        document.getElementById("addTaskListBtn").addEventListener('click', createTaskBox);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Attach event listener to the "Create" button
document.getElementById("addTaskListBtn").addEventListener("click", createTaskBox);
