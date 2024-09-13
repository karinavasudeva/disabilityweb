const energyLevelInput = document.getElementById('energyLevel');
const energyValue = document.getElementById('energyValue');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskMatrix = document.getElementById('taskMatrix');

let tasks = [];

energyLevelInput.addEventListener('input', () => {
    energyValue.textContent = energyLevelInput.value;
    updateTaskPriorities();
});

addTaskBtn.addEventListener('click', addTask);

function addTask() {
    const taskTitle = taskInput.value.trim();
    console.log('Adding task:', taskTitle);
    if (taskTitle) {
        fetch('/breakdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task: taskTitle, energyLevel: parseInt(energyLevelInput.value) })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Received data from server:', data);
            if (data.breakdown && Array.isArray(data.breakdown)) {
                tasks = data.breakdown;
                console.log('Updated tasks:', tasks);
                renderTaskMatrix();
                taskInput.value = '';
            } else {
                console.error('Invalid response format:', data);
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });
    }
}

function renderTaskMatrix() {
    console.log('Rendering task matrix with tasks:', tasks);
    const quadrants = {
        do: [], decide: [], delegate: [], delete: []
    };

    tasks.forEach(task => {
        const quadrant = getQuadrant(task.importance, task.urgency);
        quadrants[quadrant].push(task);
    });

    console.log('Quadrants:', quadrants);

    taskMatrix.innerHTML = `
        <div class="grid grid-cols-2 gap-4">
            <div class="bg-red-100 p-4 rounded">
                <h2 class="font-bold">Do (Important & Urgent)</h2>
                ${renderQuadrantTasks(quadrants.do)}
            </div>
            <div class="bg-yellow-100 p-4 rounded">
                <h2 class="font-bold">Decide (Important & Not Urgent)</h2>
                ${renderQuadrantTasks(quadrants.decide)}
            </div>
            <div class="bg-blue-100 p-4 rounded">
                <h2 class="font-bold">Delegate (Not Important & Urgent)</h2>
                ${renderQuadrantTasks(quadrants.delegate)}
            </div>
            <div class="bg-green-100 p-4 rounded">
                <h2 class="font-bold">Delete (Not Important & Not Urgent)</h2>
                ${renderQuadrantTasks(quadrants.delete)}
            </div>
        </div>
    `;
    console.log('Task matrix rendered');
}

function renderQuadrantTasks(tasks) {
    return tasks.map(task => `
        <div class="bg-white p-2 mb-2 rounded shadow">
            <div class="font-semibold">${task.mainTask || 'No main task'}</div>
            <div>${task.description || 'No description'}</div>
            <div class="text-sm text-gray-500">Est. Time: ${task.estimated_time || 'Not specified'}</div>
            <div class="text-xs text-gray-400">Importance: ${task.importance || 'Not specified'}, Urgency: ${task.urgency || 'Not specified'}</div>
        </div>
    `).join('');
}

function getQuadrant(importance, urgency) {
  // Standardize importance and urgency values in case of parsing issues
  const importanceValue = importance.toLowerCase();
  const urgencyValue = urgency.toLowerCase();

  if (importanceValue === 'high' && urgencyValue === 'high') {
      return 'do';
  } 
  if (importanceValue === 'high' && urgencyValue === 'low') {
      return 'decide';
  } 
  if (importanceValue === 'low' && urgencyValue === 'high') {
      return 'delegate';
  } 
  return 'delete';
}

function updateTaskPriorities() {
    fetch('/breakdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task: 'Update priorities', energyLevel: parseInt(energyLevelInput.value) })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received updated priorities:', data);
        if (data.breakdown && Array.isArray(data.breakdown)) {
            tasks = data.breakdown;
            renderTaskMatrix();
        } else {
            console.error('Invalid response format:', data);
        }
    })
    .catch(error => {
        console.error('Error updating task priorities:', error);
    });
}

// Initial render
renderTaskMatrix();
console.log('Initial render complete');

function addTask() {
  const taskTitle = taskInput.value.trim();
  if (taskTitle) {
      fetch('/breakdown', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ task: taskTitle, energyLevel: parseInt(energyLevelInput.value) })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Server error: ' + response.statusText);
          }
          return response.json();
      })
      .then(data => {
          if (data.breakdown && Array.isArray(data.breakdown)) {
              tasks = data.breakdown;
              renderTaskMatrix();
              taskInput.value = '';
          } else {
              throw new Error('Invalid data format from server');
          }
      })
      .catch(error => {
          console.error('An error occurred:', error);
          alert('Failed to add task: ' + error.message); // Inform the user
      });
  }
}
