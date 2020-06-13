const login = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    return;
  }

  const emailErrors = document.getElementById('email-errors');
  const passwodErrors = document.getElementById('password-errors');
  const globalErrors = document.getElementById('global-errors');

  let response = await fetch('http://188.26.250.90:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  response = await response.json();

  emailErrors.innerHTML = '';
  passwodErrors.innerHTML = '';
  globalErrors.innerHTML = '';

  if (response?.message) {
    switch (response.statusCode) {
      case 400: {
        passwodErrors.innerHTML = `<p class="error">${response.message}, attempts left: ${response.attemptsLeft}</p>`;
        break;
      }
      case 404: {
        emailErrors.innerHTML = `<p class="error">${response.message}</p>`;
        break;
      }
      case 429: {
        globalErrors.innerHTML = `<p class="error">Too many requests. Please slow down.</p>`;
        break;
      }
    }

    return;
  }

  window.localStorage.setItem('loggedIn', 'true');
  window.localStorage.setItem('user', JSON.stringify(response));
  window.location.replace('/to-do-app/public/tasks.html');
};
