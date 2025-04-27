const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database', 'shop.db'));

db.serialize(() => {
    // Drop existing tables if they exist
    db.run('DROP TABLE IF EXISTS users');
    db.run('DROP TABLE IF EXISTS inventory');
    db.run('DROP TABLE IF EXISTS sales');
    db.run('DROP TABLE IF EXISTS customers');
    db.run('DROP TABLE IF EXISTS employees');
    db.run('DROP TABLE IF EXISTS invoices');

    // Create Users Table
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `);

    // Create Inventory Table
    db.run(`
        CREATE TABLE inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            expiration_date TEXT
        )
    `);

    // Create Sales Table with product_id
    db.run(`
        CREATE TABLE sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            total REAL NOT NULL,
            sale_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Completed',
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (product_id) REFERENCES inventory(id)
        )
    `);

    // Create Customers Table
    db.run(`
        CREATE TABLE customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            initials TEXT NOT NULL,
            orders INTEGER NOT NULL DEFAULT 0,
            total_spent REAL NOT NULL DEFAULT 0.0,
            last_purchase TEXT,
            status TEXT NOT NULL DEFAULT 'Active'
        )
    `);

    // Create Employees Table
    db.run(`
        CREATE TABLE employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            join_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Active',
            today_status TEXT DEFAULT 'Present'
        )
    `);

    // Create Invoices Table
    db.run(`
        CREATE TABLE invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            total REAL NOT NULL,
            discount REAL,
            invoice_date TEXT NOT NULL,
            due_date TEXT,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Insert Sample Data for Users
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', 'password123', 'admin']);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['john_doe', 'john123', 'user']);

    // Insert Sample Data for Inventory
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['iPhone 14 Pro', 'Electronics', 2, 99999.99, '2025-12-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Samsung Galaxy S22', 'Electronics', 5, 79999.99, '2025-11-30']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Sony WH-1000XM4', 'Audio', 0, 3499.99, '2025-10-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['MacBook Pro 16"', 'Computers', 8, 2399.99, '2026-01-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['iPad Air', 'Tablets', 12, 59999.99, '2025-12-15']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Apple Watch Series 8', 'Wearables', 3, 39999.99, '2025-11-30']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['AirPods Pro', 'Audio', 7, 24999.99, '2025-10-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Dell XPS 13', 'Computers', 6, 11999.99, '2026-01-15']);

    // Insert Sample Data for Customers
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['John Doe', 'john.doe@example.com', '(555) 123-4567', 'JD', 8, 12999.99, 'Jul 5, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Jane Smith', 'jane.smith@example.com', '(555) 987-6543', 'JS', 5, 8999.50, 'Jun 20, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Robert Johnson', 'robert.johnson@example.com', '(555) 765-4321', 'RJ', 2, 3499.99, 'Jul 5, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Emily Davis', 'emily.davis@example.com', '(555) 234-5678', 'ED', 3, 4999.99, 'Jun 30, 2023', 'Inactive']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Michael Wilson', 'michael.wilson@example.com', '(555) 876-5432', 'MW', 6, 14999.99, 'Jul 12, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Sarah Thompson', 'sarah.thompson@example.com', '(555) 345-6789', 'ST', 1, 1299.99, 'Jun 15, 2023', 'Inactive']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['David Miller', 'david.miller@example.com', 'N/A', 'DM', 4, 7999.99, 'Jul 8, 2023', 'Active']);

    // Insert Sample Data for Sales
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [1, 1, 2, 1999.98, '2023-07-15', 'Completed']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [2, 2, 1, 799.99, '2023-07-14', 'Completed']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [3, 3, 1, 349.99, '2023-07-14', 'Pending']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [4, 4, 3, 7199.97, '2023-07-13', 'Refunded']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [5, 5, 2, 1199.98, '2023-07-13', 'Completed']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [6, 6, 1, 399.99, '2023-07-12', 'Canceled']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [7, 7, 2, 499.98, '2023-07-12', 'Completed']);

    // Insert Sample Data for Employees
    db.run(`INSERT INTO employees (name, email, phone, role, department, join_date, status, today_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Alice Brown', 'alice.brown@example.com', '(555) 111-2222', 'Manager', 'Sales', '2023-01-15', 'Active', 'Present']);
    db.run(`INSERT INTO employees (name, email, phone, role, department, join_date, status, today_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Bob Green', 'bob.green@example.com', '(555) 333-4444', 'Sales Associate', 'Sales', '2023-03-10', 'Active', 'Absent']);
    db.run(`INSERT INTO employees (name, email, phone, role, department, join_date, status, today_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Carol White', 'carol.white@example.com', '(555) 555-6666', 'Technician', 'Support', '2023-02-20', 'Active', 'Present']);

    // Insert Sample Data for Invoices
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [1, 599.99, 0, '2023-07-01', '2023-07-15', 'Paid']);
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [2, 349.99, 50, '2023-07-03', '2023-07-17', 'Paid']);
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [3, 199.99, 0, '2023-07-05', '2023-07-19', 'Pending']);
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [4, 129.99, 0, '2023-07-08', '2023-07-22', 'Pending']);
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [5, 799.99, 0, '2023-06-25', '2023-07-09', 'Overdue']);
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [6, 249.99, 0, '2023-07-10', '2023-07-24', 'Draft']);
    
    // Add current month invoices
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Format date as YYYY-MM-DD
    const formatDate = (year, month, day) => {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    };
    
    // Add invoice from 5 days ago (Paid)
    const fiveDaysAgo = new Date(currentDate);
    fiveDaysAgo.setDate(currentDate.getDate() - 5);
    const dueDateForFiveDaysAgo = new Date(fiveDaysAgo);
    dueDateForFiveDaysAgo.setDate(fiveDaysAgo.getDate() + 14);
    
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [1, 1250.00, 125, formatDate(fiveDaysAgo.getFullYear(), fiveDaysAgo.getMonth() + 1, fiveDaysAgo.getDate()), 
         formatDate(dueDateForFiveDaysAgo.getFullYear(), dueDateForFiveDaysAgo.getMonth() + 1, dueDateForFiveDaysAgo.getDate()), 'Paid']);
    
    // Add invoice from 3 days ago (Pending)
    const threeDaysAgo = new Date(currentDate);
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    const dueDateForThreeDaysAgo = new Date(threeDaysAgo);
    dueDateForThreeDaysAgo.setDate(threeDaysAgo.getDate() + 14);
    
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [2, 780.50, 0, formatDate(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth() + 1, threeDaysAgo.getDate()), 
         formatDate(dueDateForThreeDaysAgo.getFullYear(), dueDateForThreeDaysAgo.getMonth() + 1, dueDateForThreeDaysAgo.getDate()), 'Pending']);
    
    // Add invoice from 10 days ago (Overdue)
    const tenDaysAgo = new Date(currentDate);
    tenDaysAgo.setDate(currentDate.getDate() - 10);
    const dueDateForTenDaysAgo = new Date(tenDaysAgo);
    dueDateForTenDaysAgo.setDate(tenDaysAgo.getDate() + 7); // Due date already passed
    
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [3, 499.99, 25, formatDate(tenDaysAgo.getFullYear(), tenDaysAgo.getMonth() + 1, tenDaysAgo.getDate()), 
         formatDate(dueDateForTenDaysAgo.getFullYear(), dueDateForTenDaysAgo.getMonth() + 1, dueDateForTenDaysAgo.getDate()), 'Overdue']);
    
    // Add invoice from today (Draft)
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)`, 
        [4, 1875.25, 150, formatDate(currentYear, currentMonth, currentDate.getDate()), 
         formatDate(currentYear, currentMonth, currentDate.getDate() + 14), 'Draft']);
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database initialized with sample data.');
    }
});