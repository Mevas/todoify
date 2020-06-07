const board = document.getElementById('tasksList');

let timerId;

const debounceFunction = (func, delay) => {
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
};

const getTasks = async (useCached = false) => {
  if (useCached) {
    let tasks = JSON.parse(window.localStorage.getItem('tasks'));

    if (tasks) {
      console.log('Used cached tasks');
      tasks.forEach((task) => {
        board.innerHTML += `
        <li class="task">
            <div class="checkbox">
                <input id="task${task.id}-checkbox" type="checkbox" ${task.done && 'checked'}>
            </div>
            <div class="task-content">
                <input id="task${task.id}-text" class="task-input ${task.done && 'crossed'}" type="text" value="${task.task}">
                <span class="button delete-button" onclick="deleteTask(${task.id})">✕</span>
            </div>
        </li>
      `;
      });
    }
  }

  const response = await fetch('http://localhost:3000/api/todos');
  tasks = await response.json();
  board.innerHTML = '';

  tasks.forEach((task) => {
    board.innerHTML += `
        <li class="task">
            <div class="checkbox">
                <input id="task${task.id}-checkbox" type="checkbox" ${task.done && 'checked'}>
            </div>
            <div class="task-content">
                <input id="task${task.id}-text" class="task-input ${task.done && 'crossed'}" type="text" value="${task.task}">
                <span class="button delete-button" onclick="deleteTask(${task.id})">✕</span>
            </div>
        </li>
      `;
  });

  tasks.forEach((task) => {
    document.getElementById(`task${task.id}-text`).addEventListener('input', (e) => {
      const newValue = document.getElementById(e.target.id).value;
      debounceFunction(async () => await editTask(task.id, newValue), 500);
    });
    document.getElementById(`task${task.id}-checkbox`).addEventListener('input', (e) => {
      const checked = document.getElementById(e.target.id).checked;

      if (checked) {
        document.getElementById(`task${task.id}-text`).classList.add('crossed');
      } else {
        document.getElementById(`task${task.id}-text`).classList.remove('crossed');
      }
      debounceFunction(async () => await editTask(task.id, undefined, checked), 500);
    });
  });

  window.localStorage.setItem('tasks', JSON.stringify(tasks));
};

const createTask = async () => {
  const task = document.getElementById('create-task-input').value;
  document.getElementById('create-task-input').value = '';

  await fetch('http://localhost:3000/api/todos', {
    method: 'POST',
    body: JSON.stringify({ task }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await getTasks();
};

const editTask = async (id, task = undefined, done = undefined) => {
  await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ task, done }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const deleteTask = async (id) => {
  await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'DELETE',
  });

  await getTasks();
};

window.onload = getTasks;

document.getElementById('create-task-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    console.log('aaa');
    document.getElementById('create-task-button').click();
  }
});
