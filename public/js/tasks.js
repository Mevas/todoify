const board = document.getElementById('tasksList');

let timerId;

const debounceFunction = (func, delay) => {
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
};

const getTasks = async (useCached = false) => {
  if (window.localStorage.getItem('loggedIn') === 'false') {
    window.location.replace('/to-do-app/public/login.html');
    return;
  }

  const name = JSON.parse(window.localStorage.getItem('user'))?.name;
  document.getElementById('list-title').innerText = name ? `${name}'s task list` : 'My task list';

  if (useCached) {
    const tasks = JSON.parse(window.localStorage.getItem('tasks'));

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

  const response = await fetch('http://localhost:3000/api/tasks', { credentials: 'include' });
  const tasks = await response.json();
  tasks.sort((t1, t2) => t1.id - t2.id);

  board.innerHTML = '';

  tasks.forEach((task) => {
    board.innerHTML += `
        <li class="task">
            <div class="checkbox">
                <input id="task${task.id}-checkbox" type="checkbox" ${task.done && 'checked'}>
            </div>
            <div class="task-content">
                <input id="task${task.id}-text" class="task-input ${task.done && 'crossed'}" type="text" value="${task.body}">
                <span class="button delete-button" onclick="deleteTask(${task.id})">✕</span>
            </div>
        </li>
      `;
  });

  tasks.forEach((task) => {
    document.getElementById(`task${task.id}-text`).addEventListener('input', (e) => {
      const newValue = document.getElementById(e.target.id).value;
      debounceFunction(async () => await editTaskBody(task.id, newValue), 500);
    });
    document.getElementById(`task${task.id}-checkbox`).addEventListener('input', (e) => {
      const checked = document.getElementById(e.target.id).checked;

      if (checked) {
        document.getElementById(`task${task.id}-text`).classList.add('crossed');
      } else {
        document.getElementById(`task${task.id}-text`).classList.remove('crossed');
      }
      debounceFunction(async () => await editTaskStatus(task.id, checked), 500);
    });
  });

  window.localStorage.setItem('tasks', JSON.stringify(tasks));
};

const createTask = async () => {
  const body = document.getElementById('create-task-input').value;
  document.getElementById('create-task-input').value = '';

  await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ body }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await getTasks();
};

const editTaskBody = async (id, body) => {
  await fetch(`http://localhost:3000/api/tasks/${id}/body`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const editTaskStatus = async (id, done) => {
  await fetch(`http://localhost:3000/api/tasks/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: done }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const deleteTask = async (id) => {
  await fetch(`http://localhost:3000/api/tasks/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await getTasks();
};

const logout = async () => {
  await fetch(`http://localhost:3000/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  window.localStorage.setItem('tasks', '[]');
  window.localStorage.setItem('loggedIn', 'false');
  window.location.replace('/to-do-app/public/login.html');
};

window.onload = getTasks;

document.getElementById('create-task-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('create-task-button').click();
  }
});
