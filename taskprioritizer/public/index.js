const spoonCountInput = document.getElementById('spoonCount');
const spoonSlider = document.getElementById('spoonSlider');
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDate');
const recurrenceSelect = document.getElementById('recurrence');
const addTaskBtn = document.getElementById('addTaskBtn');
const imageUpload = document.getElementById('imageUpload');
const processImageBtn = document.getElementById('processImageBtn');
const taskList = document.getElementById('taskList');
const availableSpoons = document.getElementById('availableSpoons');
const usedSpoons = document.getElementById('usedSpoons');
const remainingSpoons = document.getElementById('remainingSpoons');
const recommendedTasks = document.getElementById('recommendedTasks');

let tasks = [];

spoonCountInput.addEventListener('input', updateSpoonCount);
spoonSlider.addEventListener('input', updateSpoonCount);

function updateSpoonCount() {
    const value = this.value;
    spoonCountInput.value = value;
    spoonSlider.value = value;
    availableSpoons.textContent = value;
    remainingSpoons.textContent = Math.max(0, value - parseInt(usedSpoons.textContent));
    updateTaskPriorities();
    renderSpoonPieChart();
}

addTaskBtn.addEventListener('click', addTask);
processImageBtn.addEventListener('click', processImage);

function addTask() {
    const taskTitle = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const recurrence = recurrenceSelect.value;
    if (taskTitle && dueDate) {
        fetch('/breakdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                task: taskTitle, 
                spoons: parseInt(spoonCountInput.value),
                dueDate: dueDate,
                recurrence: recurrence
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.breakdown && data.breakdown.mainTask && data.breakdown.subtasks) {
                tasks.push({
                    ...data.breakdown,
                    nextDueDate: new Date(dueDate),
                    completed: false
                });
                updateTaskPriorities();
                taskInput.value = '';
                dueDateInput.value = '';
                recurrenceSelect.value = '';
            } else {
                console.error('Invalid response format:', data);
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });
    }
}

function processImage() {
    const file = imageUpload.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('spoons', spoonCountInput.value);

        fetch('/process-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.tasks)) {
                tasks = [...tasks, ...data.tasks.map(task => ({
                    ...task,
                    nextDueDate: new Date(),
                    completed: false
                }))];
                updateTaskPriorities();
                imageUpload.value = '';
            } else {
                console.error('Invalid response format:', data);
            }
        })
        .catch(error => {
            console.error('An error occurred while processing the image:', error);
        });
    } else {
        alert('Please select an image to upload');
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        if (new Date(task.nextDueDate) > new Date()) {
            return; // Skip tasks that are not due yet
        }
        const taskElement = document.createElement('div');
        taskElement.className = 'bg-white p-4 mb-4 rounded shadow';
        taskElement.innerHTML = `
            <h2 class="text-xl font-bold">${task.mainTask.title}</h2>
            <p class="text-sm text-gray-600">Estimated time: ${task.mainTask.estimatedTime}</p>
            <p class="text-sm text-gray-600">Spoon cost: ${task.mainTask.spoonCost}</p>
            <p class="text-sm text-gray-600">Due date: ${new Date(task.nextDueDate).toLocaleDateString()}</p>
            <p class="text-sm text-gray-600">Recurrence: ${task.mainTask.recurrence || 'None'}</p>
            <ul class="mt-2">
                ${task.subtasks.map((subtask, subtaskIndex) => `
                    <li class="flex items-center mt-2">
                        <input type="checkbox" class="mr-2" 
                               onchange="updateSpoonUsage(${index}, ${subtaskIndex})" 
                               ${subtask.completed ? 'checked' : ''}>
                        <span>${subtask.title} (${subtask.estimatedTime}, ${subtask.spoonCost} spoons)</span>
                    </li>
                `).join('')}
            </ul>
            <button class="mt-4 bg-green-500 text-white p-2 rounded mr-2" onclick="completeTask(${index})">Complete Task</button>
            <button class="mt-4 bg-red-500 text-white p-2 rounded" onclick="removeTask(${index})">Remove Task</button>
        `;
        taskList.appendChild(taskElement);
    });
    updateSpoonUsage();
    recommendTasks();
}

function completeTask(index) {
    const task = tasks[index];
    task.completed = true;

    if (task.mainTask.recurrence) {
        const nextDueDate = new Date(task.nextDueDate);
        switch (task.mainTask.recurrence) {
            case 'daily':
                nextDueDate.setDate(nextDueDate.getDate() + 1);
                break;
            case 'weekly':
                nextDueDate.setDate(nextDueDate.getDate() + 7);
                break;
            case 'monthly':
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                break;
        }
        tasks.push({
            ...task,
            nextDueDate,
            completed: false,
            subtasks: task.subtasks.map(subtask => ({ ...subtask, completed: false }))
        });
    }

    tasks.splice(index, 1);
    updateTaskPriorities();
}

function removeTask(index) {
    tasks.splice(index, 1);
    updateTaskPriorities();
}

function updateTaskPriorities() {
    const spoons = parseInt(spoonCountInput.value);
    fetch('/prioritize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tasks, spoons })
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data.prioritizedTasks)) {
            tasks = data.prioritizedTasks;
            renderTasks();
        } else {
            console.error('Invalid response format:', data);
        }
    })
    .catch(error => {
        console.error('Error updating task priorities:', error);
    });
}

function updateSpoonUsage(taskIndex, subtaskIndex) {
    const totalSpoons = parseInt(spoonCountInput.value);
    let usedSpoonCount = 0;

    if (taskIndex !== undefined && subtaskIndex !== undefined) {
        tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
    }

    tasks.forEach(task => {
        task.subtasks.forEach(subtask => {
            if (subtask.completed) {
                usedSpoonCount += subtask.spoonCost;
            }
        });
    });

    availableSpoons.textContent = totalSpoons;
    usedSpoons.textContent = usedSpoonCount;
    remainingSpoons.textContent = Math.max(0, totalSpoons - usedSpoonCount);

    renderSpoonPieChart();
    recommendTasks();
}

function renderSpoonPieChart() {
    const totalSpoons = parseInt(availableSpoons.textContent);
    const usedSpoonCount = parseInt(usedSpoons.textContent);
    const remainingSpoonCount = parseInt(remainingSpoons.textContent);

    const usedAngle = (usedSpoonCount / totalSpoons) * 360;
    const remainingAngle = (remainingSpoonCount / totalSpoons) * 360;

    const pieChartContainer = document.getElementById('spoonPieChart');
    pieChartContainer.innerHTML = `
        <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="75" fill="#e0e0e0" />
            ${usedAngle > 0 ? `
                <path d="M75,75 L75,0 A75,75 0 ${usedAngle > 180 ? 1 : 0},1 ${75 + 75 * Math.sin(usedAngle * Math.PI / 180)},${75 - 75 * Math.cos(usedAngle * Math.PI / 180)} Z" fill="#ff6b6b" />
            ` : ''}
            ${remainingAngle > 0 ? `
                <path d="M75,75 L${75 + 75 * Math.sin(usedAngle * Math.PI / 180)},${75 - 75 * Math.cos(usedAngle * Math.PI / 180)} A75,75 0 ${remainingAngle > 180 ? 1 : 0},1 75,0 Z" fill="#4ecdc4" />
            ` : ''}
        </svg>
        <div class="text-center mt-2">
            <span class="inline-block w-3 h-3 bg-[#ff6b6b] mr-1"></span>Used
            <span class="inline-block w-3 h-3 bg-[#4ecdc4] mr-1 ml-2"></span>Remaining
        </div>
    `;
}

function recommendTasks() {
    const availableSpoons = parseInt(remainingSpoons.textContent);
    let recommendations = [];

    tasks.forEach(task => {
        let taskSpoonCost = 0;
        let incompleteSubtasks = task.subtasks.filter(subtask => !subtask.completed);
        
        incompleteSubtasks.forEach(subtask => {
            taskSpoonCost += subtask.spoonCost;
        });

        if (taskSpoonCost <= availableSpoons) {
            recommendations.push({
                title: task.mainTask.title,
                spoonCost: taskSpoonCost,
                subtasks: incompleteSubtasks
            });
        }
    });

    recommendations.sort((a, b) => b.spoonCost - a.spoonCost);

    recommendedTasks.innerHTML = '<h3 class="text-lg font-semibold mb-2">Recommended Tasks:</h3>';
    if (recommendations.length > 0) {
        recommendations.forEach(rec => {
            recommendedTasks.innerHTML += `
                <div class="mb-2 p-2 bg-green-100 rounded">
                    <p class="font-medium">${rec.title} (${rec.spoonCost} spoons)</p>
                    <ul class="ml-4 list-disc">
                        ${rec.subtasks.map(subtask => `<li>${subtask.title} (${subtask.spoonCost} spoons)</li>`).join('')}
                    </ul>
                </div>
            `;
        });
    } else {
        recommendedTasks.innerHTML += '<p>No tasks fit your current spoon count. Consider resting or doing a low-energy activity.</p>';
    }
}

function handleRecurringTasks() {
    const today = new Date();
    tasks.forEach(task => {
        if (task.mainTask.recurrence && new Date(task.nextDueDate) <= today && !task.completed) {
            task.completed = false;
            task.subtasks.forEach(subtask => subtask.completed = false);
            task.nextDueDate = calculateNextDueDate(task.nextDueDate, task.mainTask.recurrence);
        }
    });
    updateTaskPriorities();
}

function calculateNextDueDate(currentDueDate, recurrence) {
    const nextDueDate = new Date(currentDueDate);
    switch (recurrence) {
        case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + 1);
            break;
        case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + 7);
            break;
        case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            break;
    }
    return nextDueDate;
}

// Call this function periodically to update recurring tasks
setInterval(handleRecurringTasks, 60000); // Check every minute

// Initial render
renderTasks();
renderSpoonPieChart();