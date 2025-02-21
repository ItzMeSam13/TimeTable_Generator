document.addEventListener('DOMContentLoaded', function() {
    const addTaskListBtn = document.getElementById('addTaskListBtn');
    const taskListNameInput = document.getElementById('taskListName');
    const taskContainer = document.getElementById('taskContainer');

    function createTaskBox() {
        const taskListName = taskListNameInput.value;
        if (taskListName) {
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
            `;

            taskListNameInput.disabled = true;
            addTaskListBtn.textContent = 'Delete';
            addTaskListBtn.removeEventListener('click', createTaskBox);
            addTaskListBtn.addEventListener('click', deleteTaskBox);

            const addTaskBtn = document.getElementById('addTaskBtn');
            addTaskBtn.addEventListener('click', function() {
                console.log('Add Task button clicked');
                const taskName = document.getElementById('taskName').value;
                const taskDeadline = document.getElementById('taskDeadline').value;
                const taskDuration = document.getElementById('taskDuration').value;
                const taskPriority = document.getElementById('taskPriority').value;

                if (taskName && taskDeadline && taskDuration && taskPriority) {
                    const taskList = document.getElementById('taskList');
                    const taskItem = document.createElement('li');
                    taskItem.innerHTML = `
                        ${taskName} - ${taskDeadline} - ${taskDuration} hours - ${taskPriority}
                        <button class="deleteTaskBtn">Delete</button>
                    `;
                    taskList.appendChild(taskItem);

                    taskItem.querySelector('.deleteTaskBtn').addEventListener('click', function() {
                        taskList.removeChild(taskItem);
                    });
                }
            });
        }
    }

    function deleteTaskBox() {
        taskContainer.innerHTML = '';
        taskListNameInput.disabled = false;
        taskListNameInput.value = '';
        addTaskListBtn.textContent = 'Create';
        addTaskListBtn.removeEventListener('click', deleteTaskBox);
        addTaskListBtn.addEventListener('click', createTaskBox);
    }

    addTaskListBtn.addEventListener('click', createTaskBox);
});