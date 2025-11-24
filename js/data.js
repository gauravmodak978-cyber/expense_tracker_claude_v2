/**
 * Data Management Module
 * Handles all expense data operations using localStorage
 * Structure based on expense_tracker_enhanced.xlsx
 */

// Categories from spreadsheet
const CATEGORIES = [
    'Grocery',
    'Travel',
    'Ordered Food',
    'Family Transfer',
    'Savings',
    'Subscriptions',
    'Rent',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Transportation',
    'Personal Care',
    'Insurance',
    'Dining Out',
    'Gifts',
    'Investments',
    'Bills',
    'Fitness',
    'Hobbies',
    'Donations',
    'Home Maintenance',
    'Other'
];

// Payment Methods from spreadsheet
const PAYMENT_METHODS = [
    'Credit Card - HDFC',
    'Credit Card - ICICI',
    'Credit Card - SBI',
    'Credit Card - Axis',
    'Debit Card - HDFC',
    'Debit Card - ICICI',
    'Debit Card - SBI',
    'Debit Card - Axis',
    'UPI - Google Pay',
    'UPI - PhonePe',
    'UPI - Paytm',
    'UPI - BHIM',
    'Cash',
    'Bank Transfer',
    'Net Banking',
    'Wallet - Paytm',
    'Wallet - Amazon Pay',
    'Other'
];

/**
 * Get storage key for current user's expenses
 * @returns {string}
 */
function getExpensesKey() {
    const session = getCurrentSession();
    if (!session) return null;
    return `financeTracker_expenses_${session.userId}`;
}

/**
 * Get all expenses for current user
 * @returns {Array} Array of expense objects
 */
function getExpenses() {
    const key = getExpensesKey();
    if (!key) return [];
    
    const expenses = localStorage.getItem(key);
    return expenses ? JSON.parse(expenses) : [];
}

/**
 * Save expenses for current user
 * @param {Array} expenses - Array of expense objects
 */
function saveExpenses(expenses) {
    const key = getExpensesKey();
    if (!key) return;
    
    localStorage.setItem(key, JSON.stringify(expenses));
}

/**
 * Generate unique ID for expense
 * @returns {string}
 */
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Validate expense data
 * @param {Object} expense
 * @returns {Object} {valid: boolean, message: string}
 */
function validateExpense(expense) {
    if (!expense.date) {
        return { valid: false, message: 'Date is required' };
    }
    
    if (!expense.category) {
        return { valid: false, message: 'Category is required' };
    }
    
    if (!CATEGORIES.includes(expense.category)) {
        return { valid: false, message: 'Invalid category' };
    }
    
    if (!expense.description || expense.description.trim().length === 0) {
        return { valid: false, message: 'Description is required' };
    }
    
    if (!expense.amount || isNaN(expense.amount) || expense.amount <= 0) {
        return { valid: false, message: 'Amount must be a positive number' };
    }
    
    if (!expense.paymentMethod) {
        return { valid: false, message: 'Payment method is required' };
    }
    
    if (!PAYMENT_METHODS.includes(expense.paymentMethod)) {
        return { valid: false, message: 'Invalid payment method' };
    }
    
    return { valid: true, message: '' };
}

/**
 * Add new expense
 * @param {Object} expenseData - Expense data object
 * @returns {Object} {success: boolean, message: string, expense: Object}
 */
function addExpense(expenseData) {
    const expense = {
        id: generateId(),
        date: expenseData.date,
        category: expenseData.category,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        paymentMethod: expenseData.paymentMethod,
        referenceNo: expenseData.referenceNo || '',
        notes: expenseData.notes || '',
        createdAt: new Date().toISOString()
    };
    
    const validation = validateExpense(expense);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }
    
    const expenses = getExpenses();
    expenses.push(expense);
    saveExpenses(expenses);
    
    return { success: true, message: 'Expense added successfully!', expense };
}

/**
 * Update existing expense
 * @param {string} id - Expense ID
 * @param {Object} updatedData - Updated expense data
 * @returns {Object} {success: boolean, message: string}
 */
function updateExpense(id, updatedData) {
    const expenses = getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Expense not found' };
    }
    
    const updatedExpense = {
        ...expenses[index],
        ...updatedData,
        amount: parseFloat(updatedData.amount),
        updatedAt: new Date().toISOString()
    };
    
    const validation = validateExpense(updatedExpense);
    if (!validation.valid) {
        return { success: false, message: validation.message };
    }
    
    expenses[index] = updatedExpense;
    saveExpenses(expenses);
    
    return { success: true, message: 'Expense updated successfully!', expense: updatedExpense };
}

/**
 * Delete expense
 * @param {string} id - Expense ID
 * @returns {Object} {success: boolean, message: string}
 */
function deleteExpense(id) {
    const expenses = getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    
    if (index === -1) {
        return { success: false, message: 'Expense not found' };
    }
    
    expenses.splice(index, 1);
    saveExpenses(expenses);
    
    return { success: true, message: 'Expense deleted successfully!' };
}

/**
 * Get expense by ID
 * @param {string} id
 * @returns {Object|null}
 */
function getExpenseById(id) {
    const expenses = getExpenses();
    return expenses.find(e => e.id === id) || null;
}

/**
 * Filter expenses by date range
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array}
 */
function filterExpensesByDateRange(startDate, endDate) {
    const expenses = getExpenses();
    return expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
}

/**
 * Filter expenses by month and year
 * @param {number} month - 0-11 (January is 0)
 * @param {number} year
 * @returns {Array}
 */
function filterExpensesByMonth(month, year) {
    const expenses = getExpenses();
    return expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });
}

/**
 * Filter expenses by year
 * @param {number} year
 * @returns {Array}
 */
function filterExpensesByYear(year) {
    const expenses = getExpenses();
    return expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getFullYear() === year;
    });
}

/**
 * Filter expenses by category
 * @param {string} category
 * @returns {Array}
 */
function filterExpensesByCategory(category) {
    const expenses = getExpenses();
    return expenses.filter(e => e.category === category);
}

/**
 * Filter expenses by payment method
 * @param {string} paymentMethod
 * @returns {Array}
 */
function filterExpensesByPaymentMethod(paymentMethod) {
    const expenses = getExpenses();
    return expenses.filter(e => e.paymentMethod === paymentMethod);
}

/**
 * Get total expenses
 * @param {Array} expenses - Optional filtered expenses array
 * @returns {number}
 */
function getTotalExpenses(expenses = null) {
    const expenseList = expenses || getExpenses();
    return expenseList.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Get expenses grouped by category
 * @param {Array} expenses - Optional filtered expenses array
 * @returns {Object}
 */
function getExpensesByCategory(expenses = null) {
    const expenseList = expenses || getExpenses();
    const grouped = {};
    
    CATEGORIES.forEach(category => {
        grouped[category] = {
            total: 0,
            count: 0,
            expenses: []
        };
    });
    
    expenseList.forEach(expense => {
        if (grouped[expense.category]) {
            grouped[expense.category].total += expense.amount;
            grouped[expense.category].count += 1;
            grouped[expense.category].expenses.push(expense);
        }
    });
    
    return grouped;
}

/**
 * Get expenses grouped by payment method
 * @param {Array} expenses - Optional filtered expenses array
 * @returns {Object}
 */
function getExpensesByPaymentMethod(expenses = null) {
    const expenseList = expenses || getExpenses();
    const grouped = {};
    
    PAYMENT_METHODS.forEach(method => {
        grouped[method] = {
            total: 0,
            count: 0,
            expenses: []
        };
    });
    
    expenseList.forEach(expense => {
        if (grouped[expense.paymentMethod]) {
            grouped[expense.paymentMethod].total += expense.amount;
            grouped[expense.paymentMethod].count += 1;
            grouped[expense.paymentMethod].expenses.push(expense);
        }
    });
    
    return grouped;
}

/**
 * Get monthly summary for a specific year
 * @param {number} year
 * @returns {Array} Array of 12 monthly summaries
 */
function getYearlySummary(year) {
    const summary = [];
    
    for (let month = 0; month < 12; month++) {
        const monthExpenses = filterExpensesByMonth(month, year);
        const total = getTotalExpenses(monthExpenses);
        const byCategory = getExpensesByCategory(monthExpenses);
        
        summary.push({
            month: month,
            monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
            total: total,
            count: monthExpenses.length,
            byCategory: byCategory
        });
    }
    
    return summary;
}

/**
 * Get statistics for expenses
 * @param {Array} expenses - Optional filtered expenses array
 * @returns {Object}
 */
function getStatistics(expenses = null) {
    const expenseList = expenses || getExpenses();
    
    if (expenseList.length === 0) {
        return {
            total: 0,
            count: 0,
            average: 0,
            highest: 0,
            lowest: 0,
            categories: 0,
            paymentMethods: 0
        };
    }
    
    const amounts = expenseList.map(e => e.amount);
    const uniqueCategories = [...new Set(expenseList.map(e => e.category))];
    const uniquePaymentMethods = [...new Set(expenseList.map(e => e.paymentMethod))];
    
    return {
        total: getTotalExpenses(expenseList),
        count: expenseList.length,
        average: getTotalExpenses(expenseList) / expenseList.length,
        highest: Math.max(...amounts),
        lowest: Math.min(...amounts),
        categories: uniqueCategories.length,
        paymentMethods: uniquePaymentMethods.length
    };
}

/**
 * Clear all expenses for current user
 * @returns {Object} {success: boolean, message: string}
 */
function clearAllExpenses() {
    const key = getExpensesKey();
    if (!key) {
        return { success: false, message: 'No user session found' };
    }
    
    localStorage.removeItem(key);
    return { success: true, message: 'All expenses cleared successfully!' };
}

/**
 * Export expenses as JSON
 * @returns {string} JSON string of expenses
 */
function exportExpensesJSON() {
    const expenses = getExpenses();
    return JSON.stringify(expenses, null, 2);
}

/**
 * Import expenses from JSON
 * @param {string} jsonString - JSON string of expenses
 * @returns {Object} {success: boolean, message: string, count: number}
 */
function importExpensesJSON(jsonString) {
    try {
        const importedExpenses = JSON.parse(jsonString);
        
        if (!Array.isArray(importedExpenses)) {
            return { success: false, message: 'Invalid data format' };
        }
        
        const currentExpenses = getExpenses();
        let importedCount = 0;
        
        importedExpenses.forEach(expense => {
            // Validate and add each expense
            if (validateExpense(expense).valid) {
                expense.id = generateId(); // Generate new ID
                currentExpenses.push(expense);
                importedCount++;
            }
        });
        
        saveExpenses(currentExpenses);
        
        return { 
            success: true, 
            message: `${importedCount} expenses imported successfully!`,
            count: importedCount
        };
    } catch (error) {
        return { success: false, message: 'Error parsing JSON: ' + error.message };
    }
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Format date for display
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Format date for input field
 * @param {string} dateString
 * @returns {string}
 */
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}
