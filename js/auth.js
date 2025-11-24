/**
 * Authentication Module
 * Handles user login, registration, and session management
 * Uses localStorage to simulate backend authentication
 */

// Maximum number of allowed user accounts
const MAX_USERS = 10;

// Initialize users storage if it doesn't exist
if (!localStorage.getItem('financeTracker_users')) {
    localStorage.setItem('financeTracker_users', JSON.stringify([]));
}

/**
 * Get all registered users
 * @returns {Array} Array of user objects
 */
function getUsers() {
    return JSON.parse(localStorage.getItem('financeTracker_users') || '[]');
}

/**
 * Save users to localStorage
 * @param {Array} users - Array of user objects
 */
function saveUsers(users) {
    localStorage.setItem('financeTracker_users', JSON.stringify(users));
}

/**
 * Hash password (simple implementation for client-side)
 * In production, this should be handled server-side
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
    // Simple hash for demonstration - NOT SECURE for production
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

/**
 * Validate username
 * @param {string} username
 * @returns {Object} {valid: boolean, message: string}
 */
function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return { valid: false, message: 'Username is required' };
    }
    if (username.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
        return { valid: false, message: 'Username must be less than 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true, message: '' };
}

/**
 * Validate password
 * @param {string} password
 * @returns {Object} {valid: boolean, message: string}
 */
function validatePassword(password) {
    if (!password || password.length === 0) {
        return { valid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: '' };
}

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 * @returns {Object} {success: boolean, message: string}
 */
function registerUser(username, password) {
    const users = getUsers();
    
    // Check if maximum users reached
    if (users.length >= MAX_USERS) {
        return { success: false, message: `Maximum of ${MAX_USERS} users reached` };
    }
    
    // Validate inputs
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
        return { success: false, message: usernameValidation.message };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message };
    }
    
    // Check if username already exists
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Account created successfully!' };
}

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {Object} {success: boolean, message: string, user: Object}
 */
function loginUser(username, password) {
    const users = getUsers();
    
    // Validate inputs
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
        return { success: false, message: usernameValidation.message };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message };
    }
    
    // Find user
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === hashPassword(password)
    );
    
    if (!user) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    // Set session
    const session = {
        userId: user.id,
        username: user.username,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('financeTracker_session', JSON.stringify(session));
    
    return { success: true, message: 'Login successful!', user: session };
}

/**
 * Logout current user
 */
function logoutUser() {
    localStorage.removeItem('financeTracker_session');
}

/**
 * Get current session
 * @returns {Object|null} Session object or null if not logged in
 */
function getCurrentSession() {
    const session = localStorage.getItem('financeTracker_session');
    return session ? JSON.parse(session) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    return getCurrentSession() !== null;
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

/**
 * Show alert message
 * @param {string} message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the top of the form's parent
    const form = document.querySelector('form');
    if (form) {
        form.parentElement.insertBefore(alert, form);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            const result = loginUser(username, password);
            
            if (result.success) {
                showAlert(result.message, 'success');
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showAlert(result.message, 'error');
            }
        });
    }
    
    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // Check if passwords match
            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }
            
            const result = registerUser(username, password);
            
            if (result.success) {
                showAlert(result.message, 'success');
                // Switch to login form after short delay
                setTimeout(() => {
                    document.getElementById('showLogin').click();
                }, 1000);
            } else {
                showAlert(result.message, 'error');
            }
        });
    }
    
    // Toggle between login and register forms
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginCard = document.querySelector('.login-card:not(#registerCard)');
    const registerCard = document.getElementById('registerCard');
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
        });
    }
    
    // If already logged in, redirect to dashboard
    if (isAuthenticated() && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
});
