# Finance Tracker - Personal Finance Management Application

A comprehensive, fully functional personal finance tracking web application built with HTML, CSS, and JavaScript. This application runs entirely in the browser using localStorage for data persistence, making it perfect for deployment on GitHub Pages.

## 🎯 Features

### Core Functionality
- ✅ **User Authentication**: Support for up to 10 user accounts with secure login/registration
- ✅ **Expense Management**: Add, edit, delete, and view expenses with detailed information
- ✅ **Category System**: 24 pre-defined expense categories based on your spreadsheet
- ✅ **Payment Methods**: 18 payment method options including cards, UPI, cash, and wallets
- ✅ **Data Fields**: Complete implementation of all fields from your spreadsheet:
  - Date
  - Category
  - Description
  - Amount
  - Payment Method
  - Reference Number
  - Notes

### Analytics & Insights
- 📊 **Interactive Charts**: Beautiful visualizations using Chart.js
  - Category distribution (Doughnut chart)
  - Payment method breakdown (Pie chart)
  - Monthly spending trends (Line chart)
- 📈 **Monthly & Yearly Summaries**: Comprehensive spending analysis
- 🎯 **Statistics**: Total spending, averages, transaction counts, and more
- 🔍 **Advanced Filtering**: Filter by month, year, category, and payment method

### User Experience
- 📱 **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- 🎨 **Modern UI**: Clean, professional design with smooth animations
- 🚀 **Fast Performance**: No backend required, instant loading
- 💾 **Data Management**: Export/import functionality for backup and transfer
- 🔐 **Session Persistence**: Stay logged in until you logout

## 📁 Project Structure

```
finance-tracker/
├── index.html              # Login/Registration page
├── dashboard.html          # Main dashboard with expense list
├── add-expense.html        # Add new expense form
├── analytics.html          # Charts and analytics
├── settings.html           # User settings and data management
├── css/
│   └── styles.css         # Complete styling (responsive)
└── js/
    ├── auth.js            # Authentication logic
    ├── data.js            # Data management (CRUD operations)
    ├── dashboard.js       # Dashboard functionality
    ├── add-expense.js     # Add expense functionality
    ├── analytics.js       # Charts and analytics
    └── settings.js        # Settings functionality
```

## 🚀 Getting Started

### Option 1: Local Development
1. Download the `finance-tracker` folder
2. Open `index.html` in your web browser
3. Register a new account or use the default test account

### Option 2: GitHub Pages Deployment
1. Create a new GitHub repository
2. Upload all files from the `finance-tracker` folder
3. Go to repository Settings → Pages
4. Select the main branch as source
5. Your app will be available at: `https://username.github.io/repository-name`

## 📖 Usage Guide

### First Time Setup
1. **Register**: Click "Register here" on the login page
2. **Create Account**: Enter a username and password
3. **Login**: Use your credentials to access the dashboard

### Adding Expenses
1. Navigate to "Add Expense" page
2. Fill in all required fields:
   - Date (defaults to today)
   - Category (from dropdown)
   - Amount
   - Description
   - Payment Method
3. Optionally add Reference No. and Notes
4. Click "Add Expense"

### Managing Expenses
- **View**: All expenses displayed on the Dashboard
- **Edit**: Click "Edit" button on any expense
- **Delete**: Click "Delete" button (with confirmation)
- **Filter**: Use filters to find specific expenses

### Analytics
- View spending by category and payment method
- Track monthly trends
- Analyze yearly patterns
- Export data for external analysis

## 💾 Data Storage

### How It Works
- All data is stored in browser's **localStorage**
- Each user's data is isolated and stored separately
- No server required - works offline after first load
- Data persists until manually cleared or browser cache is deleted

### Data Structure
Based on your `expense_tracker_enhanced.xlsx`:

**Categories** (24 total):
- Grocery, Travel, Ordered Food, Family Transfer, Savings
- Subscriptions, Rent, Utilities, Entertainment, Shopping
- Healthcare, Education, Transportation, Personal Care
- Insurance, Dining Out, Gifts, Investments, Bills
- Fitness, Hobbies, Donations, Home Maintenance, Other

**Payment Methods** (18 total):
- Credit Cards (HDFC, ICICI, SBI, Axis)
- Debit Cards (HDFC, ICICI, SBI, Axis)
- UPI (Google Pay, PhonePe, Paytm, BHIM)
- Cash, Bank Transfer, Net Banking
- Wallets (Paytm, Amazon Pay)
- Other

**Expense Fields**:
```javascript
{
  id: "unique_id",
  date: "YYYY-MM-DD",
  category: "Category name",
  description: "Expense description",
  amount: 1234.56,
  paymentMethod: "Payment method name",
  referenceNo: "Optional reference",
  notes: "Optional notes",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

## 🔐 Security Notes

### Important Considerations
1. **Client-Side Only**: All authentication is client-side (localStorage)
2. **Not Production-Grade**: This is suitable for personal use or demonstrations
3. **No Encryption**: Data is stored in plain text in localStorage
4. **Browser-Dependent**: Data is tied to the browser and device

### For Production Use
To make this production-ready, you would need:
- Real backend server with database
- Proper password hashing (bcrypt)
- JWT tokens or session management
- HTTPS encryption
- Server-side validation
- Database backups

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #4F46E5;  /* Main color */
    --secondary-color: #10B981; /* Secondary color */
    /* ... more variables */
}
```

### Adding Categories/Payment Methods
Edit the arrays in `js/data.js`:
```javascript
const CATEGORIES = ['Category1', 'Category2', ...];
const PAYMENT_METHODS = ['Method1', 'Method2', ...];
```

### Changing User Limit
Edit `MAX_USERS` in `js/auth.js`:
```javascript
const MAX_USERS = 10; // Change to desired number
```

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome)
- ⚠️ IE 11 (Not supported)

## 🐛 Known Limitations

1. **Data Loss Risk**: Clearing browser data will delete all expenses
2. **Single Device**: Data doesn't sync across devices
3. **No Cloud Backup**: Export data regularly to prevent loss
4. **Client-Side Auth**: Not secure for sensitive data
5. **localStorage Limits**: ~5-10MB depending on browser

## 💡 Tips & Best Practices

1. **Regular Exports**: Export your data weekly/monthly as backup
2. **Reference Numbers**: Use for bank reconciliation
3. **Descriptive Names**: Better for search and analysis
4. **Daily Updates**: Add expenses daily for accuracy
5. **Categories**: Use consistent categorization

## 🔧 Troubleshooting

### Login Issues
- Clear browser cache and try again
- Check if localStorage is enabled
- Try incognito/private mode

### Data Not Saving
- Ensure localStorage isn't full
- Check browser console for errors
- Try a different browser

### Charts Not Displaying
- Ensure Chart.js CDN is accessible
- Check internet connection
- Refresh the page

## 📄 License

This project is created for personal use. Feel free to modify and use as needed.

## 🙏 Credits

- **Chart.js**: For beautiful charts and graphs
- **Design Inspiration**: Modern finance applications
- **Data Structure**: Based on expense_tracker_enhanced.xlsx

## 📞 Support

For issues or questions:
1. Check this README first
2. Review the code comments
3. Check browser console for errors
4. Try the troubleshooting section

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Built With**: HTML, CSS, JavaScript, Chart.js
