const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// SQLite Database Setup
const dbPath = path.join(__dirname, '../database/shop.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Simple Authentication Middleware
const authenticate = (req, res, next) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Authentication error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            console.log('Invalid login attempt for:', username);
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        req.user = { role: row.role };
        console.log('Login successful for:', username);
        next();
    });
};

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Login database error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        res.json({ success: true, role: row.role });
    });
});

// Inventory Endpoints
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            console.error('Inventory fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/inventory', (req, res) => {
    const { name, quantity, price, expiration_date, category } = req.body;
    if (!name || quantity < 0 || price < 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    db.run(
        'INSERT INTO inventory (name, quantity, price, expiration_date, category) VALUES (?, ?, ?, ?, ?)',
        [name, quantity, price, expiration_date, category],
        function (err) {
            if (err) {
                console.error('Inventory add error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity, price, expiration_date, category } = req.body;
    if (!name || quantity < 0 || price < 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    db.run(
        'UPDATE inventory SET name = ?, quantity = ?, price = ?, expiration_date = ?, category = ? WHERE id = ?',
        [name, quantity, price, expiration_date, category, id],
        function (err) {
            if (err) {
                console.error('Inventory update error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM inventory WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Inventory delete error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

// Sales Endpoints
app.get('/api/sales', (req, res) => {
    db.all('SELECT * FROM sales', [], (err, rows) => {
        if (err) {
            console.error('Sales fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/sales', (req, res) => {
    const { customer_id, product_id, quantity, total, status, sale_date } = req.body;
    if (!customer_id || !product_id || quantity < 0 || total < 0 || !status) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    db.run(
        'INSERT INTO sales (customer_id, product_id, quantity, total, sale_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customer_id, product_id, quantity, total, sale_date || new Date().toISOString(), status],
        function (err) {
            if (err) {
                console.error('Sales add error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Customers Endpoints
app.get('/api/customers', (req, res) => {
    db.all('SELECT * FROM customers', [], (err, rows) => {
        if (err) {
            console.error('Customers fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        const transformedRows = rows.map(row => ({
            id: row.id,
            initials: row.initials,
            name: row.name,
            email: row.email,
            phone: row.phone || 'N/A',
            orders: row.orders || 0,
            totalSpent: parseFloat(row.total_spent) || 0.00,
            lastPurchase: row.last_purchase || 'N/A',
            status: row.status || 'Inactive'
        }));
        res.json(transformedRows);
    });
});

app.post('/api/customers', (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const lastPurchase = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    db.run(
        'INSERT INTO customers (name, email, phone, initials, orders, total_spent, last_purchase, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone || 'N/A', initials, 0, 0.00, lastPurchase, 'Active'],
        function (err) {
            if (err) {
                console.error('Customer add error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const lastPurchase = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    db.run(
        'UPDATE customers SET name = ?, email = ?, phone = ?, initials = ?, last_purchase = ? WHERE id = ?',
        [name, email, phone || 'N/A', initials, lastPurchase, id],
        function (err) {
            if (err) {
                console.error('Customer update error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM customers WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Customer delete error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(204).json({ success: true });
    });
});

// Employees Endpoints
app.get('/api/employees', (req, res) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
        if (err) {
            console.error('Employees fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/employees', (req, res) => {
    const { name, email, phone, role, department, join_date, status, today_status } = req.body;
    if (!name || !email || !role || !department || !join_date) {
        return res.status(400).json({ error: 'Name, email, role, department, and join date are required' });
    }
    db.run(
        'INSERT INTO employees (name, email, phone, role, department, join_date, status, today_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone || 'N/A', role, department, join_date, status || 'Active', today_status || 'Present'],
        function (err) {
            if (err) {
                console.error('Employee add error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, role, department, join_date, status, today_status } = req.body;
    if (!name || !email || !role || !department || !join_date) {
        return res.status(400).json({ error: 'Name, email, role, department, and join date are required' });
    }
    db.run(
        'UPDATE employees SET name = ?, email = ?, phone = ?, role = ?, department = ?, join_date = ?, status = ?, today_status = ? WHERE id = ?',
        [name, email, phone || 'N/A', role, department, join_date, status || 'Active', today_status || 'Present', id],
        function (err) {
            if (err) {
                console.error('Employee update error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Employee delete error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(204).json({ success: true });
    });
});

// Invoices Endpoints
app.get('/api/invoices', (req, res) => {
    const query = `
        SELECT i.*, c.name as customer_name 
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Invoices fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Calculate metrics
        let totalRevenue = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;
        let totalInvoices = rows.length;
        
        rows.forEach(invoice => {
            // Add a status field if it doesn't exist or process existing status
            if (!invoice.status) {
                const dueDate = new Date(invoice.due_date || invoice.invoice_date);
                const currentDate = new Date();
                
                if (dueDate < currentDate) {
                    invoice.status = 'Overdue';
                    overdueAmount += invoice.total;
                } else {
                    invoice.status = 'Pending';
                    pendingAmount += invoice.total;
                }
            } else {
                // Process existing status
                if (invoice.status === 'Paid') {
                    totalRevenue += invoice.total;
                } else if (invoice.status === 'Pending') {
                    pendingAmount += invoice.total;
                } else if (invoice.status === 'Overdue') {
                    overdueAmount += invoice.total;
                }
                // Draft invoices are not counted in any metric
            }
            
            // Format invoice number for display
            invoice.invoice_number = `INV-${String(invoice.id).padStart(3, '0')}`;
        });
        
        console.log('Invoice metrics:', {
            totalRevenue,
            pendingAmount,
            overdueAmount,
            totalInvoices
        });
        
        // Return metrics along with invoices
        res.json({
            invoices: rows,
            metrics: {
                totalRevenue,
                pendingAmount,
                overdueAmount,
                totalInvoices
            }
        });
    });
});

app.post('/api/invoices', (req, res) => {
    const { customer_id, total, discount, invoice_date, due_date, status } = req.body;
    if (!customer_id || !total || !invoice_date) {
        return res.status(400).json({ error: 'Customer ID, total, and invoice date are required' });
    }
    
    db.run(
        'INSERT INTO invoices (customer_id, total, discount, invoice_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
        [customer_id, total, discount || 0, invoice_date, due_date || null, status || 'Pending'],
        function (err) {
            if (err) {
                console.error('Invoice add error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/invoices/:id', (req, res) => {
    const { id } = req.params;
    const { customer_id, total, discount, invoice_date, due_date, status } = req.body;
    
    if (!customer_id || !total || !invoice_date) {
        return res.status(400).json({ error: 'Customer ID, total, and invoice date are required' });
    }
    
    db.run(
        'UPDATE invoices SET customer_id = ?, total = ?, discount = ?, invoice_date = ?, due_date = ?, status = ? WHERE id = ?',
        [customer_id, total, discount || 0, invoice_date, due_date || null, status || 'Pending', id],
        function (err) {
            if (err) {
                console.error('Invoice update error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        }
    );
});

app.delete('/api/invoices/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM invoices WHERE id = ?', [id], function (err) {
        if (err) {
            console.error('Invoice delete error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

// Get a single invoice by ID
app.get('/api/invoices/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = ?
    `;
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Invoice fetch error:', err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        // Format invoice number
        row.invoice_number = `INV-${String(row.id).padStart(3, '0')}`;
        
        res.json(row);
    });
});

// Analytics Endpoints
// Sales Analytics
app.get('/api/analytics/sales', (req, res) => {
    try {
        const queries = {
            // Monthly sales for the last 7 months
            monthlySales: `
                SELECT 
                    strftime('%Y-%m', sale_date) as month,
                    SUM(total) as total_sales
                FROM sales
                WHERE sale_date >= date('now', '-7 months')
                GROUP BY month
                ORDER BY month ASC
            `,
            // Top selling products
            topProducts: `
                SELECT 
                    i.name as product_name,
                    SUM(s.total) as total_sales,
                    SUM(s.quantity) as quantity_sold
                FROM sales s
                JOIN inventory i ON s.product_id = i.id
                GROUP BY s.product_id
                ORDER BY total_sales DESC
                LIMIT 6
            `,
            // Sales metrics
            salesMetrics: `
                SELECT 
                    SUM(total) as total_revenue,
                    AVG(total) as average_order_value,
                    (SELECT COUNT(*) FROM sales WHERE status = 'Completed') * 100.0 / COUNT(*) as conversion_rate
                FROM sales
            `,
            // Monthly growth
            monthlyGrowth: `
                SELECT
                    COALESCE(curr.month, prev.month) as month,
                    COALESCE(curr.sales, 0) as current_sales,
                    COALESCE(prev.sales, 0) as previous_sales,
                    (COALESCE(curr.sales, 0) - COALESCE(prev.sales, 0)) / CASE WHEN COALESCE(prev.sales, 0) = 0 THEN 1 ELSE COALESCE(prev.sales, 0) END * 100 as growth_rate
                FROM (
                    SELECT strftime('%Y-%m', sale_date) as month, SUM(total) as sales
                    FROM sales
                    WHERE sale_date >= date('now', '-6 months')
                    GROUP BY month
                ) curr
                LEFT JOIN (
                    SELECT strftime('%Y-%m', date(sale_date, '+1 month')) as month, SUM(total) as sales
                    FROM sales
                    WHERE sale_date >= date('now', '-7 months') AND sale_date < date('now', '-1 month')
                    GROUP BY month
                ) prev ON curr.month = prev.month
                ORDER BY month ASC
            `
        };

        const data = {};
        const promises = [];

        // Execute all queries asynchronously
        for (const [key, query] of Object.entries(queries)) {
            promises.push(
                new Promise((resolve, reject) => {
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            console.error(`Error executing ${key} query:`, err);
                            reject(err);
                        } else {
                            data[key] = rows;
                            resolve();
                        }
                    });
                })
            );
        }

        // Wait for all queries to complete
        Promise.all(promises)
            .then(() => {
                res.json(data);
            })
            .catch(error => {
                console.error('Error in sales analytics:', error);
                res.status(500).json({ error: error.message });
            });
    } catch (error) {
        console.error('Error in sales analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Inventory Analytics
app.get('/api/analytics/inventory', (req, res) => {
    try {
        const queries = {
            // Inventory summary
            summary: `
                SELECT 
                    COUNT(*) as total_products,
                    SUM(CASE WHEN quantity <= 5 THEN 1 ELSE 0 END) as low_stock_items,
                    SUM(price * quantity) as inventory_value
                FROM inventory
            `,
            // Category distribution
            categories: `
                SELECT 
                    category,
                    COUNT(*) as product_count,
                    SUM(quantity) as total_quantity,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 1) as percentage
                FROM inventory
                GROUP BY category
                ORDER BY product_count DESC
            `,
            // Stock levels for low stock items
            stockLevels: `
                SELECT 
                    id,
                    name,
                    quantity,
                    price,
                    category
                FROM inventory
                WHERE quantity <= 12
                ORDER BY quantity ASC
                LIMIT 10
            `,
            // Inventory growth
            inventoryGrowth: `
                SELECT 
                    COUNT(*) as total_products,
                    (SELECT COUNT(*) FROM inventory WHERE quantity > 0) as in_stock_products,
                    (SELECT COUNT(*) FROM inventory WHERE quantity = 0) as out_of_stock_products
                FROM inventory
            `
        };

        const data = {};
        const promises = [];

        // Execute all queries asynchronously
        for (const [key, query] of Object.entries(queries)) {
            promises.push(
                new Promise((resolve, reject) => {
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            console.error(`Error executing ${key} query:`, err);
                            reject(err);
                        } else {
                            data[key] = rows;
                            resolve();
                        }
                    });
                })
            );
        }

        // Wait for all queries to complete
        Promise.all(promises)
            .then(() => {
                res.json(data);
            })
            .catch(error => {
                console.error('Error in inventory analytics:', error);
                res.status(500).json({ error: error.message });
            });
    } catch (error) {
        console.error('Error in inventory analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Customer Analytics
app.get('/api/analytics/customers', (req, res) => {
    try {
        const queries = {
            // Customer summary
            summary: `
                SELECT 
                    COUNT(*) as total_customers,
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_customers,
                    AVG(total_spent) as avg_lifetime_value,
                    COUNT(DISTINCT id) * 100.0 / (SELECT COUNT(*) FROM customers) as repeat_purchase_rate
                FROM customers
            `,
            // Monthly customer growth
            monthlyGrowth: `
                SELECT 
                    'Current' as period,
                    COUNT(*) as customer_count
                FROM customers
            `,
            // Top customers by spending
            topCustomers: `
                SELECT 
                    id,
                    name,
                    total_spent,
                    orders,
                    last_purchase
                FROM customers
                ORDER BY total_spent DESC
                LIMIT 7
            `,
            // Customer metrics
            customerMetrics: `
                SELECT
                    SUM(total_spent) as total_spent,
                    AVG(total_spent) as avg_spent,
                    SUM(orders) as total_orders
                FROM customers
            `
        };

        const data = {};
        const promises = [];

        // Execute all queries asynchronously
        for (const [key, query] of Object.entries(queries)) {
            promises.push(
                new Promise((resolve, reject) => {
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            console.error(`Error executing ${key} query:`, err);
                            reject(err);
                        } else {
                            data[key] = rows;
                            resolve();
                        }
                    });
                })
            );
        }

        // Wait for all queries to complete
        Promise.all(promises)
            .then(() => {
                // Generate mock data for the age distribution since it's not available in the database
                data.ageDistribution = [
                    { age_group: '18-24', percentage: 15 },
                    { age_group: '25-34', percentage: 35 },
                    { age_group: '35-44', percentage: 25 },
                    { age_group: '45-54', percentage: 15 },
                    { age_group: '55+', percentage: 10 }
                ];
                
                // Generate mock monthly growth data
                const currentMonth = new Date().getMonth();
                data.customerGrowth = [];
                let baseCount = 120;
                for (let i = 0; i < 7; i++) {
                    const month = new Date();
                    month.setMonth(currentMonth - 6 + i);
                    data.customerGrowth.push({
                        month: month.toLocaleString('default', { month: 'short' }),
                        customer_count: baseCount
                    });
                    baseCount += Math.floor(Math.random() * 40) + 10;
                }
                
                res.json(data);
            })
            .catch(error => {
                console.error('Error in customer analytics:', error);
                res.status(500).json({ error: error.message });
            });
    } catch (error) {
        console.error('Error in customer analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});