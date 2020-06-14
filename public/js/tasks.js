const board = document.getElementById('tasksList');

let timerId;

const debounceFunction = (func, delay) => {
  clearTimeout(timerId);
  timerId = setTimeout(func, delay);
};

const onPageLoad = async () => {
  const user = JSON.parse(window.localStorage.getItem('user'));

  if (!user) {
    window.location.replace('login');
    return;
  }

  const datetime = new Date(parseInt(user.lastLogin));
  const datetimeString = `${datetime.toLocaleDateString('ro-RO', { hour: 'numeric', minute: 'numeric', second: 'numeric' })}`;
  if (user.logins <= 1) {
    document.getElementById('greeting').innerHTML += `
      <div>Hi there, this is the first time you've logged in!</div>
    `;
  } else {
    document.getElementById('greeting').innerHTML += `
      <div>Hi ${user.name}, your last login was from ${user.lastIp} on ${datetimeString}.</div>
      <div>You've visited your task list ${user.logins} times now!</div>
    `;
  }
  await getTasks();
};

const getTasks = async (useCached = false) => {
  if (!window.localStorage.getItem('loggedIn') || window.localStorage.getItem('loggedIn') === 'false') {
    window.location.replace('login');
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

  const response = await fetch('https://todoify-tw.netlify.app/api/tasks', { credentials: 'include' });
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

  await fetch('https://todoify-tw.netlify.app/api/tasks', {
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
  await fetch(`https://todoify-tw.netlify.app/api/tasks/${id}/body`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const editTaskStatus = async (id, done) => {
  await fetch(`https://todoify-tw.netlify.app/api/tasks/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: done }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const deleteTask = async (id) => {
  await fetch(`https://todoify-tw.netlify.app/api/tasks/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await getTasks();
};

const logout = async () => {
  await fetch(`https://todoify-tw.netlify.app/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  window.localStorage.setItem('tasks', '[]');
  window.localStorage.setItem('loggedIn', 'false');
  window.location.replace('login');
};

window.onload = onPageLoad;

document.getElementById('create-task-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('create-task-button').click();
  }
});
