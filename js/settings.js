/**
 * Settings Module
 * Handles user settings, data export/import, and account management
 */

// Check authentication
requireAuth();

/**
 * Initialize settings page
 */
function initSettings() {
    // Display username
    const session = getCurrentSession();
    if (session) {
        document.getElementById('userNameDisplay').textContent = session.username;
        document.getElementById('displayUsername').value = session.username;
    }
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            logoutUser();
            window.location.href = 'index.html';
        }
    });
    
    // Load account info
    loadAccountInfo();
    
    // Load statistics
    loadStatistics();
    
    // Setup buttons
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
}

/**
 * Load account information
 */
function loadAccountInfo() {
    const session = getCurrentSession();
    if (!session) return;
    
    // Get user info
    const users = JSON.parse(localStorage.getItem('financeTracker_users') || '[]');
    const user = users.find(u => u.id === session.userId);
    
    if (user) {
        const createdDate = new Date(user.createdAt);
        document.getElementById('accountCreated').value = createdDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Get expense count
    const expenses = getExpenses();
    document.getElementById('totalExpensesCount').value = expenses.length + ' expenses';
}

/**
 * Load statistics
 */
function loadStatistics() {
    const expenses = getExpenses();
    const stats = getStatistics(expenses);
    
    document.getElementById('statTotalSpent').textContent = formatCurrency(stats.total);
    document.getElementById('statTotalTransactions').textContent = stats.count;
    document.getElementById('statHighest').textContent = stats.highest > 0 ? formatCurrency(stats.highest) : '₹0.00';
    document.getElementById('statLowest').textContent = stats.lowest > 0 ? formatCurrency(stats.lowest) : '₹0.00';
}

/**
 * Export data as JSON
 */
function exportData() {
    const expenses = getExpenses();
    
    if (expenses.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const dataStr = exportExpensesJSON();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const session = getCurrentSession();
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `finance-tracker-${session.username}-${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

/**
 * Import data from JSON file
 */
function importData(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showNotification('Please select a valid JSON file', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const jsonString = e.target.result;
            const result = importExpensesJSON(jsonString);
            
            if (result.success) {
                showNotification(result.message, 'success');
                loadStatistics();
                loadAccountInfo();
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('Error reading file: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

/**
 * Clear all data
 */
function clearAllData() {
    const confirmation = confirm(
        'Are you sure you want to delete ALL your expenses?\n\n' +
        'This action cannot be undone!\n\n' +
        'Consider exporting your data first.'
    );
    
    if (!confirmation) return;
    
    // Double confirmation
    const doubleConfirm = confirm(
        'This is your last chance!\n\n' +
        'Click OK to permanently delete all expenses.'
    );
    
    if (!doubleConfirm) return;
    
    const result = clearAllExpenses();
    
    if (result.success) {
        showNotification(result.message, 'success');
        loadStatistics();
        loadAccountInfo();
    } else {
        showNotification(result.message, 'error');
    }
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
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSettings);
