const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

if (signupForm) {
    signupForm.addEventListener('submit', async (event)=> {
        event.preventDefault();
        const userDetails = {
            userName: document.getElementById('userName').value.trim(),
            email: document.getElementById('email').value.trim(),
            mobileNumber: document.getElementById('mobileNumber').value,
            password: document.getElementById('password').value.trim()
        }
        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userDetails)
            });
            const data = await response.json();
            if (data.success) {
                signupMessage.innerHTML = `<p>User Details added successfully</p>`;
                signupMessage.style.color = 'green';
            } else {
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
            email: document.getElementById('email'),
            password: document.getElementById('password')
        }
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(loginDetails)
            });
            const data = response.json();
            if (data.success) {
                console.log('User Login Successfully')
            } else {
                loginMessage.innerHTML = `<p>${data.message}</p>`
            }
        } catch (err) {
            console.err('Login Error:', err);
        }
        loginForm.reset();
    });
}
