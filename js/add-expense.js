/**
 * Add Expense Module
 * Handles adding new expenses with form validation
 */

// Check authentication
requireAuth();

/**
 * Initialize add expense page
 */
function initAddExpense() {
    // Display username
    const session = getCurrentSession();
    if (session) {
        document.getElementById('userNameDisplay').textContent = session.username;
    }
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            logoutUser();
            window.location.href = 'index.html';
        }
    });
    
    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // Populate dropdowns
    populateCategories();
    populatePaymentMethods();
    
    // Setup form submission
    document.getElementById('addExpenseForm').addEventListener('submit', handleFormSubmit);
    
    // Setup quick templates
    setupQuickTemplates();
    
    // Display recent categories
    displayRecentCategories();
}

/**
 * Populate category dropdown
 */
function populateCategories() {
    const select = document.getElementById('expenseCategory');
    CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

/**
 * Populate payment method dropdown
 */
function populatePaymentMethods() {
    const select = document.getElementById('expensePaymentMethod');
    PAYMENT_METHODS.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        select.appendChild(option);
    });
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const expenseData = {
        date: document.getElementById('expenseDate').value,
        category: document.getElementById('expenseCategory').value,
        amount: document.getElementById('expenseAmount').value,
        description: document.getElementById('expenseDescription').value,
        paymentMethod: document.getElementById('expensePaymentMethod').value,
        referenceNo: document.getElementById('expenseReferenceNo').value.trim(),
        notes: document.getElementById('expenseNotes').value.trim()
    };
    
    const result = addExpense(expenseData);
    
    if (result.success) {
        showNotification(result.message, 'success');
        
        // Reset form
        document.getElementById('addExpenseForm').reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        
        // Update recent categories
        displayRecentCategories();
        
        // Ask if user wants to add another or go to dashboard
        setTimeout(() => {
            if (confirm('Expense added successfully! Would you like to add another expense?')) {
                document.getElementById('expenseDescription').focus();
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 500);
    } else {
        showNotification(result.message, 'error');
    }
}

/**
 * Setup quick templates
 */
function setupQuickTemplates() {
    const templateBtns = document.querySelectorAll('.template-btn');
    
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            const description = btn.getAttribute('data-description');
            
            document.getElementById('expenseCategory').value = category;
            document.getElementById('expenseDescription').value = description;
            
            // Focus on amount field
            document.getElementById('expenseAmount').focus();
            
            showNotification('Template applied! Enter amount and payment method.', 'info');
        });
    });
}

/**
 * Display recent categories
 */
function displayRecentCategories() {
    const container = document.getElementById('recentCategories');
    const expenses = getExpenses();
    
    if (expenses.length === 0) {
        container.innerHTML = '<p class="text-secondary">No recent expenses</p>';
        return;
    }
    
    // Get unique categories from last 10 expenses
    const recentExpenses = expenses.slice(-10);
    const uniqueCategories = [...new Set(recentExpenses.map(e => e.category))];
    
    container.innerHTML = '';
    uniqueCategories.forEach(category => {
        const chip = document.createElement('span');
        chip.className = 'category-chip';
        chip.textContent = category;
        chip.addEventListener('click', () => {
            document.getElementById('expenseCategory').value = category;
            document.getElementById('expenseAmount').focus();
            showNotification(`Category "${category}" selected`, 'info');
        });
        container.appendChild(chip);
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '10000';
    notification.style.minWidth = '300px';
    notification.style.maxWidth = '500px';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAddExpense);
