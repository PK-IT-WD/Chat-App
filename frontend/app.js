document.addEventListener('DOMContentLoaded', async () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const messageForm = document.getElementById('messageForm');

    const signupMessage = document.getElementById('signupMessage');
    const loginMessage = document.getElementById('loginMessage');
    const showMessage = document.getElementById('showMessage');

    let fetchStatus = false;
    setInterval(async () => {
        if (!fetchStatus) {
            fetchStatus = true;
            await fetchMessage();
            fetchStatus = false;
        }
    }, 5000);

    if (signupForm) {
        signupForm.addEventListener('submit', async (event)=> {
            event.preventDefault();

            const signupDetails = {
                userName: document.getElementById('userName').value.trim(),
                email: document.getElementById('email').value.trim(),
                mobileNumber: document.getElementById('mobileNumber').value,
                password: document.getElementById('password').value.trim()
            }

            try {
                const response = await fetch('http://localhost:3000/signup', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(signupDetails)
                });

                const data = await response.json();
                if (data.success) {
                    signupMessage.innerHTML = '';
                    signupMessage.innerHTML = `<p>User Details added successfully</p>`;
                    signupMessage.style.color = 'green';
                } else {
                    signupMessage.innerHTML = '';
                    signupMessage.innerHTML = `<p>${data.message}</p>`;
                    signupMessage.style.color = 'red';
                }
            } catch (err) {
                console.error('Signup Error:', err);
            }
            signupForm.reset();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async(event) => {
            event.preventDefault();

            const loginDetails = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim()
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(loginDetails)
                });

                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/message.html';
                } else {
                    loginMessage.innerHTML = '';
                    loginMessage.innerHTML = `<p>${data.message}</p>`;
                    loginMessage.style.color = 'red';
                }
            } catch (err) {
                console.error('Login Error:', err);
            }
            loginForm.reset();
        });
    }

    if (messageForm) {
        messageForm.addEventListener('submit', async(event) => {
            event.preventDefault();

            const userMessage = {
                message: document.getElementById('message').value.trim()
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token provided in the storage');
                    return;
                }
                const response = await fetch('/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userMessage)
                });

                const data = await response.json();
                if (data.success) {
                    await fetchMessage();
                    messageForm.reset();
                } else {
                    showMessage.innerHTML = '';
                    showMessage.innerHTML = `<p>${data.message}</p>`
                }
            } catch (err) {
                console.error('Message Error:', err);
            }
        });
    }

    async function fetchMessage() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token provided in the storage');
                return;
            }
            const response = await fetch('/allMessage', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                const message = data.storedMessage;
                const messageDiv = document.createElement('div');
                message.forEach(detail => {
                    const p = document.createElement('p');
                    p.textContent = `${detail.userName} - ${detail.message}`;
                    messageDiv.appendChild(p);
                });
                showMessage.innerHTML = '';
                showMessage.appendChild(messageDiv);
            } else {
                showMessage.innerHTML = '';
                showMessage.innerHTML = `<p>${data.message}</p>`
                showMessage.style.color = 'red';
            }
        } catch (err) {
            console.error('Fetch Message Error:', err);
        }
    }
});

