const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const messageForm = document.getElementById('messageForm');

const signupMessage = document.getElementById('signupMessage');
const loginMessage = document.getElementById('loginMessage');
const showMessage = document.getElementById('showMessage');

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
            const message = data.storedMessage;
            const messageDiv = document.createElement('div');
            const userDetails = message.map(detail => ({
                userName: detail.userInfo.userName,
                message: detail.message
            }));

            userDetails.forEach(detail => {
                const p = document.createElement('p');
                p.textContent = `${detail.userName} - ${detail.message}`;
                messageDiv.appendChild(p);
            });
            showMessage.innerHTML = '';
            showMessage.appendChild(messageDiv);
        } catch (err) {
            console.error('Message Error:', err);
        }
        messageForm.reset();
    });
}
