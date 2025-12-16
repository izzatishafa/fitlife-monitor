// ==================== LOGIN PAGE FUNCTIONS ====================

// Show alert message
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    alertDiv.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg mb-3 flex items-center gap-3 animate-slide-in`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateX(100%)';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Toggle between Login and Register tabs
function showLoginTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.className = 'flex-1 pb-2 text-center font-semibold border-b-2 border-indigo-900 text-indigo-900 transition';
        registerTab.className = 'flex-1 pb-2 text-center font-semibold border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.className = 'flex-1 pb-2 text-center font-semibold border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition';
        registerTab.className = 'flex-1 pb-2 text-center font-semibold border-b-2 border-indigo-900 text-indigo-900 transition';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle Login
async function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validation
    if (!username || !password) {
        showAlert('Please enter username and password', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        // Call backend API
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Save user info
            if (rememberMe) {
                localStorage.setItem('fitlife_user', JSON.stringify(data.user));
                localStorage.setItem('fitlife_token', data.token);
            } else {
                sessionStorage.setItem('fitlife_user', JSON.stringify(data.user));
                sessionStorage.setItem('fitlife_token', data.token);
            }
            
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            const error = await response.json();
            showAlert(error.message || 'Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // FALLBACK: If backend not available, use demo mode
        if (username === 'demo' && password === 'demo123') {
            const demoUser = {
                id: 1,
                username: 'demo',
                name: 'Demo User',
                email: 'demo@fitlife.com'
            };
            
            if (rememberMe) {
                localStorage.setItem('fitlife_user', JSON.stringify(demoUser));
                localStorage.setItem('fitlife_token', 'demo-token-123');
            } else {
                sessionStorage.setItem('fitlife_user', JSON.stringify(demoUser));
                sessionStorage.setItem('fitlife_token', 'demo-token-123');
            }
            
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showAlert('Backend server not available. Use demo mode or try: demo/demo123', 'error');
        }
    }
}

// Handle Register
async function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validation
    if (!name || !email || !username || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Call backend API
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            showAlert('Registration successful! Please login.', 'success');
            
            // Switch to login tab
            setTimeout(() => {
                showLoginTab('login');
                document.getElementById('login-username').value = username;
            }, 1500);
        } else {
            const error = await response.json();
            showAlert(error.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // FALLBACK: If backend not available
        showAlert('Backend server not available. Registration requires server connection.', 'error');
    }
}

// Handle Demo Login (Skip authentication)
function handleDemoLogin() {
    const demoUser = {
        id: 0,
        username: 'guest',
        name: 'Guest User',
        email: 'guest@fitlife.com'
    };
    
    sessionStorage.setItem('fitlife_user', JSON.stringify(demoUser));
    sessionStorage.setItem('fitlife_token', 'demo-guest-token');
    
    showAlert('Entering Demo Mode...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('register-confirm-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
});