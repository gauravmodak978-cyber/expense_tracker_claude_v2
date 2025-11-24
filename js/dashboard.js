/**
 * Dashboard Module
 * Handles dashboard display, filtering, and expense management
 */

// Check authentication
requireAuth();

let currentExpenses = [];
let deleteExpenseId = null;

/**
 * Initialize dashboard
 */
function initDashboard() {
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
    
    // Populate filter dropdowns
    populateFilters();
    
    // Load and display expenses
    loadExpenses();
    
    // Setup filter buttons
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Setup modals
    setupEditModal();
    setupDeleteModal();
}

/**
 * Populate filter dropdowns
 */
function populateFilters() {
    // Populate months
    const monthSelect = document.getElementById('filterMonth');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Populate years
    const yearSelect = document.getElementById('filterYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // Populate categories
    const categorySelect = document.getElementById('filterCategory');
    CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Populate payment methods
    const paymentSelect = document.getElementById('filterPayment');
    PAYMENT_METHODS.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        paymentSelect.appendChild(option);
    });
}

/**
 * Load and display expenses
 */
function loadExpenses() {
    currentExpenses = getExpenses();
    
    // Sort by date (newest first)
    currentExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayExpenses(currentExpenses);
    updateStatistics(currentExpenses);
}

/**
 * Display expenses in table
 */
function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = '';
    
    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <h3>No expenses found</h3>
                        <p>Try adjusting your filters or add a new expense</p>
                        <a href="add-expense.html" class="btn btn-primary mt-2">Add Expense</a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td><span class="badge badge-primary">${expense.category}</span></td>
            <td>${expense.description}</td>
            <td><strong>${formatCurrency(expense.amount)}</strong></td>
            <td>${expense.paymentMethod}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewExpense('${expense.id}')">View</button>
                    <button class="btn btn-sm btn-primary" onclick="editExpense('${expense.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteExpense('${expense.id}')">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update statistics display
 */
function updateStatistics(expenses) {
    const stats = getStatistics(expenses);
    
    document.getElementById('totalExpenses').textContent = formatCurrency(stats.total);
    document.getElementById('totalTransactions').textContent = stats.count;
    document.getElementById('averageExpense').textContent = formatCurrency(stats.average || 0);
    
    // Calculate current month expenses
    const now = new Date();
    const monthExpenses = filterExpensesByMonth(now.getMonth(), now.getFullYear());
    const monthTotal = getTotalExpenses(monthExpenses);
    document.getElementById('monthExpenses').textContent = formatCurrency(monthTotal);
}

/**
 * Apply filters
 */
function applyFilters() {
    let filtered = getExpenses();
    
    const month = document.getElementById('filterMonth').value;
    const year = document.getElementById('filterYear').value;
    const category = document.getElementById('filterCategory').value;
    const payment = document.getElementById('filterPayment').value;
    
    // Apply month and year filter
    if (month !== '' && year !== '') {
        filtered = filterExpensesByMonth(parseInt(month), parseInt(year));
    } else if (year !== '') {
        filtered = filterExpensesByYear(parseInt(year));
    }
    
    // Apply category filter
    if (category !== '') {
        filtered = filtered.filter(e => e.category === category);
    }
    
    // Apply payment method filter
    if (payment !== '') {
        filtered = filtered.filter(e => e.paymentMethod === payment);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayExpenses(filtered);
    updateStatistics(filtered);
}

/**
 * Clear all filters
 */
function clearFilters() {
    document.getElementById('filterMonth').value = '';
    document.getElementById('filterYear').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterPayment').value = '';
    
    loadExpenses();
}

/**
 * View expense details (opens edit modal in view-only mode)
 */
function viewExpense(id) {
    const expense = getExpenseById(id);
    if (!expense) return;
    
    alert(`
Date: ${formatDate(expense.date)}
Category: ${expense.category}
Description: ${expense.description}
Amount: ${formatCurrency(expense.amount)}
Payment Method: ${expense.paymentMethod}
Reference No: ${expense.referenceNo || 'N/A'}
Notes: ${expense.notes || 'N/A'}
    `.trim());
}

/**
 * Edit expense
 */
function editExpense(id) {
    const expense = getExpenseById(id);
    if (!expense) return;
    
    // Populate edit form
    document.getElementById('editExpenseId').value = expense.id;
    document.getElementById('editDate').value = formatDateForInput(expense.date);
    document.getElementById('editCategory').value = expense.category;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editPaymentMethod').value = expense.paymentMethod;
    document.getElementById('editReferenceNo').value = expense.referenceNo || '';
    document.getElementById('editNotes').value = expense.notes || '';
    
    // Show modal
    document.getElementById('editModal').classList.remove('hidden');
}

/**
 * Setup edit modal
 */
function setupEditModal() {
    // Populate category dropdown
    const categorySelect = document.getElementById('editCategory');
    CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Populate payment method dropdown
    const paymentSelect = document.getElementById('editPaymentMethod');
    PAYMENT_METHODS.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        paymentSelect.appendChild(option);
    });
    
    // Close modal handlers
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    
    // Save changes handler
    document.getElementById('saveEdit').addEventListener('click', saveExpenseChanges);
    
    // Close on overlay click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editForm').reset();
}

/**
 * Save expense changes
 */
function saveExpenseChanges() {
    const id = document.getElementById('editExpenseId').value;
    const updatedData = {
        date: document.getElementById('editDate').value,
        category: document.getElementById('editCategory').value,
        amount: document.getElementById('editAmount').value,
        description: document.getElementById('editDescription').value,
        paymentMethod: document.getElementById('editPaymentMethod').value,
        referenceNo: document.getElementById('editReferenceNo').value,
        notes: document.getElementById('editNotes').value
    };
    
    const result = updateExpense(id, updatedData);
    
    if (result.success) {
        closeEditModal();
        loadExpenses();
        showToast(result.message, 'success');
    } else {
        showToast(result.message, 'error');
    }
}

/**
 * Confirm delete expense
 */
function confirmDeleteExpense(id) {
    deleteExpenseId = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

/**
 * Setup delete modal
 */
function setupDeleteModal() {
    // Close modal handlers
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
    
    // Confirm delete handler
    document.getElementById('confirmDelete').addEventListener('click', performDelete);
    
    // Close on overlay click
    document.getElementById('deleteModal').addEventListener('click', (e) => {
        if (e.target.id === 'deleteModal') {
            closeDeleteModal();
        }
    });
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    deleteExpenseId = null;
}

/**
 * Perform delete
 */
function performDelete() {
    if (!deleteExpenseId) return;
    
    const result = deleteExpense(deleteExpenseId);
    
    if (result.success) {
        closeDeleteModal();
        loadExpenses();
        showToast(result.message, 'success');
    } else {
        showToast(result.message, 'error');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '10000';
    toast.style.minWidth = '300px';
    toast.textContent = message;
    toast.classList.add('toast');
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);

// Make functions globally available
window.viewExpense = viewExpense;
window.editExpense = editExpense;
window.confirmDeleteExpense = confirmDeleteExpense;
