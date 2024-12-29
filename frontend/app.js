const signupForm = document.getElementById('signupForm');
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
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userDetails)
            });
            const data = await response.json();
            if (data.success) {
                message.innerHTML = `<p>User Details added successfully</p>`;
                message.style.color = 'green';
            } else {
                message.innerHTML = `<p>${data.message}</p>`;
                message.style.color = 'red';
            }
        } catch (err) {
            console.error('Signup Error:', err);
        }
        signupForm.reset();
    });
}
