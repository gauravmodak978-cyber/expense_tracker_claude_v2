/**
 * Analytics Module
 * Handles data visualization with Chart.js
 */

// Check authentication
requireAuth();

let categoryChart, paymentChart, trendChart;

/**
 * Initialize analytics page
 */
function initAnalytics() {
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
    
    // Populate year selector
    populateYearSelector();
    
    // Setup year change handler
    document.getElementById('analyticsYear').addEventListener('change', loadAnalytics);
    
    // Load analytics
    loadAnalytics();
}

/**
 * Populate year selector
 */
function populateYearSelector() {
    const select = document.getElementById('analyticsYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
}

/**
 * Load and display analytics
 */
function loadAnalytics() {
    const yearSelect = document.getElementById('analyticsYear');
    const selectedYear = yearSelect.value;
    
    let expenses;
    if (selectedYear) {
        expenses = filterExpensesByYear(parseInt(selectedYear));
    } else {
        expenses = getExpenses();
    }
    
    // Update summary cards
    updateSummaryCards(expenses, selectedYear ? parseInt(selectedYear) : null);
    
    // Update charts
    updateCategoryChart(expenses);
    updatePaymentChart(expenses);
    updateTrendChart(expenses, selectedYear ? parseInt(selectedYear) : null);
    
    // Update tables
    updateCategoryTable(expenses);
    updatePaymentTable(expenses);
}

/**
 * Update summary cards
 */
function updateSummaryCards(expenses, year) {
    const total = getTotalExpenses(expenses);
    const byCategory = getExpensesByCategory(expenses);
    const byPayment = getExpensesByPaymentMethod(expenses);
    
    // Total spending
    document.getElementById('totalSpending').textContent = formatCurrency(total);
    
    // Monthly average
    const months = year ? 12 : (new Date().getMonth() + 1);
    const monthlyAvg = total / months;
    document.getElementById('monthlyAverage').textContent = formatCurrency(monthlyAvg);
    
    // Top category
    let topCategory = { name: '-', total: 0 };
    for (const [category, data] of Object.entries(byCategory)) {
        if (data.total > topCategory.total) {
            topCategory = { name: category, total: data.total };
        }
    }
    document.getElementById('topCategory').textContent = topCategory.name;
    
    // Top payment method
    let topPayment = { name: '-', total: 0 };
    for (const [method, data] of Object.entries(byPayment)) {
        if (data.total > topPayment.total) {
            topPayment = { name: method, total: data.total };
        }
    }
    // Shorten payment method name for display
    const shortPaymentName = topPayment.name.split(' - ')[0] || topPayment.name;
    document.getElementById('topPayment').textContent = shortPaymentName;
}

/**
 * Update category pie chart
 */
function updateCategoryChart(expenses) {
    const byCategory = getExpensesByCategory(expenses);
    
    // Filter categories with spending
    const categories = [];
    const amounts = [];
    const colors = [
        '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
        '#14B8A6', '#F43F5E', '#3B82F6', '#A855F7', '#22C55E'
    ];
    
    let colorIndex = 0;
    for (const [category, data] of Object.entries(byCategory)) {
        if (data.total > 0) {
            categories.push(category);
            amounts.push(data.total);
            colorIndex++;
        }
    }
    
    if (categories.length === 0) {
        // Show empty state
        const ctx = document.getElementById('categoryChart');
        if (categoryChart) {
            categoryChart.destroy();
        }
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // Create or update chart
    const ctx = document.getElementById('categoryChart');
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update payment method pie chart
 */
function updatePaymentChart(expenses) {
    const byPayment = getExpensesByPaymentMethod(expenses);
    
    // Filter payment methods with spending
    const methods = [];
    const amounts = [];
    const colors = [
        '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    
    for (const [method, data] of Object.entries(byPayment)) {
        if (data.total > 0) {
            methods.push(method);
            amounts.push(data.total);
        }
    }
    
    if (methods.length === 0) {
        const ctx = document.getElementById('paymentChart');
        if (paymentChart) {
            paymentChart.destroy();
        }
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    // Create or update chart
    const ctx = document.getElementById('paymentChart');
    if (paymentChart) {
        paymentChart.destroy();
    }
    
    paymentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: methods,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, methods.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update monthly trend line chart
 */
function updateTrendChart(expenses, year) {
    const currentYear = year || new Date().getFullYear();
    const summary = getYearlySummary(currentYear);
    
    const labels = summary.map(m => m.monthName.substring(0, 3));
    const data = summary.map(m => m.total);
    
    // Create or update chart
    const ctx = document.getElementById('trendChart');
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Spending',
                data: data,
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4F46E5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Spending: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * Update category table
 */
function updateCategoryTable(expenses) {
    const tbody = document.getElementById('categoryTableBody');
    const byCategory = getExpensesByCategory(expenses);
    const total = getTotalExpenses(expenses);
    
    // Convert to array and sort by amount
    const categoryData = Object.entries(byCategory)
        .filter(([_, data]) => data.total > 0)
        .sort((a, b) => b[1].total - a[1].total);
    
    if (categoryData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        <p>No data available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    categoryData.forEach(([category, data]) => {
        const percentage = ((data.total / total) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="badge badge-primary">${category}</span></td>
            <td><strong>${formatCurrency(data.total)}</strong></td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update payment method table
 */
function updatePaymentTable(expenses) {
    const tbody = document.getElementById('paymentTableBody');
    const byPayment = getExpensesByPaymentMethod(expenses);
    
    // Convert to array and sort by amount
    const paymentData = Object.entries(byPayment)
        .filter(([_, data]) => data.total > 0)
        .sort((a, b) => b[1].total - a[1].total);
    
    if (paymentData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3">
                    <div class="empty-state">
                        <p>No data available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    paymentData.forEach(([method, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${method}</td>
            <td><strong>${formatCurrency(data.total)}</strong></td>
            <td>${data.count}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAnalytics);
