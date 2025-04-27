const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/shop-monitoring-system/database/shop.db');

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

    // Create Sales Table with Status Column
    db.run(`
        CREATE TABLE sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            total REAL NOT NULL,
            sale_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Completed'
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
            role TEXT NOT NULL,
            performance TEXT
        )
    `);

    // Create Invoices Table
    db.run(`
        CREATE TABLE invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            total REAL NOT NULL,
            discount REAL,
            invoice_date TEXT NOT NULL
        )
    `);

    // Insert Sample Data for Users
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', 'password123', 'admin']);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['john_doe', 'john123', 'user']);

    // Insert Sample Data for Inventory
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['iPhone 14 Pro', 'Electronics', 2, 999.99, '2025-12-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Samsung Galaxy S22', 'Electronics', 5, 799.99, '2025-11-30']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Sony WH-1000XM4', 'Audio', 0, 349.99, '2025-10-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['MacBook Pro 16"', 'Computers', 8, 2399.99, '2026-01-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['iPad Air', 'Tablets', 12, 599.99, '2025-12-15']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Apple Watch Series 8', 'Wearables', 3, 399.99, '2025-11-30']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['AirPods Pro', 'Audio', 7, 249.99, '2025-10-31']);
    db.run(`INSERT INTO inventory (name, category, quantity, price, expiration_date) VALUES (?, ?, ?, ?, ?)`, ['Dell XPS 13', 'Computers', 6, 1199.99, '2026-01-15']);

    // Insert Sample Data for Customers
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['John Doe', 'john.doe@example.com', '(555) 123-4567', 'JD', 8, 129.99, 'Jul 5, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Jane Smith', 'jane.smith@example.com', '(555) 987-6543', 'JS', 5, 89.50, 'Jun 20, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Robert Johnson', 'robert.johnson@example.com', '(555) 765-4321', 'RJ', 2, 34.99, 'Jul 5, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Emily Davis', 'emily.davis@example.com', '(555) 234-5678', 'ED', 3, 49.99, 'Jun 30, 2023', 'Inactive']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Michael Wilson', 'michael.wilson@example.com', '(555) 876-5432', 'MW', 6, 149.99, 'Jul 12, 2023', 'Active']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['Sarah Thompson', 'sarah.thompson@example.com', '(555) 345-6789', 'ST', 1, 12.99, 'Jun 15, 2023', 'Inactive']);
    db.run(`INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        ['David Miller', 'david.miller@example.com', 'N/A', 'DM', 4, 79.99, 'Jul 8, 2023', 'Active']);

    // Insert Sample Data for Sales
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [1, 1, 2, 1999.98, '2023-07-15', 'Completed']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [2, 2, 1, 799.99, '2023-07-14', 'Completed']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [3, 3, 1, 349.99, '2023-07-14', 'Pending']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [4, 4, 3, 7199.97, '2023-07-13', 'Refunded']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [5, 5, 2, 1199.98, '2023-07-13', 'Completed']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [6, 6, 1, 399.99, '2023-07-12', 'Canceled']);
    db.run(`INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)`, [7, 7, 2, 499.98, '2023-07-12', 'Completed']);

    // Insert Sample Data for Employees
    db.run(`INSERT INTO employees (name, role, performance) VALUES (?, ?, ?)`, ['Alice Brown', 'Manager', 'Excellent']);
    db.run(`INSERT INTO employees (name, role, performance) VALUES (?, ?, ?)`, ['Bob Green', 'Sales', 'Good']);

    // Insert Sample Data for Invoices
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [1, 1999.98, 0, '2023-07-15']);
    db.run(`INSERT INTO invoices (customer_id, total, discount, invoice_date) VALUES (?, ?, ?, ?)`, [2, 799.99, 50, '2023-07-14']);
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database initialized with sample data.');
    }
});