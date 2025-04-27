// Initialize App
function initializeApp() {
    setupNavigation();
    updateDashboard();
    renderInventory();
    renderSales();
    renderCustomers();
    renderEmployees();
    renderInvoices();
    renderCharts();
    setupInventoryControls();
    setupCustomerControls();
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Fetch Data
async function fetchData(endpoint) {
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error.message);
        return [];
    }
}

// Dashboard Updates
async function updateDashboard() {
    const inventory = await fetchData('inventory');
    const sales = await fetchData('sales');
    const customers = await fetchData('customers');

    // Update Metrics
    document.getElementById('total-sales').textContent = `$${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}`;
    document.getElementById('total-inventory').textContent = inventory.length;
    document.getElementById('total-customers').textContent = customers.length;
    document.getElementById('average-order-value').textContent = sales.length > 0 ? `$${(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2)}` : '$0.00';

    // Recent Sales
    const recentSales = document.getElementById('recent-sales');
    recentSales.innerHTML = '';
    sales.slice(0, 5).forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${sale.product_id}</td>
            <td class="p-2">${sale.quantity}</td>
            <td class="p-2">$${sale.total.toFixed(2)}</td>
            <td class="p-2">${sale.sale_date}</td>
        `;
        recentSales.appendChild(row);
    });

    // Low Stock
    const lowStock = document.getElementById('low-stock');
    lowStock.innerHTML = '';
    inventory.filter(item => item.quantity <= 3).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${item.name}</td>
            <td class="p-2">${item.category || 'N/A'}</td>
            <td class="p-2 ${item.quantity === 0 ? 'text-red-600' : 'text-yellow-600'}">${item.quantity}</td>
        `;
        lowStock.appendChild(row);
    });
}

// Render Inventory
async function renderInventory(filter = '', category = '') {
    const inventory = await fetchData('inventory');
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';

    const filteredInventory = inventory
        .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
        .filter(item => category ? item.category === category : true);

    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${item.name}</td>
            <td class="p-2">${item.category || 'N/A'}</td>
            <td class="p-2">$${item.price.toFixed(2)}</td>
            <td class="p-2 ${item.quantity === 0 ? 'text-red-600' : item.quantity <= 3 ? 'text-yellow-600' : ''}">${item.quantity}</td>
            <td class="p-2">${item.quantity === 0 ? 'Out of Stock' : item.quantity <= 3 ? 'Low Stock' : 'In Stock'}</td>
            <td class="p-2">
                <div class="dropdown">
                    <span class="dropdown-toggle">...</span>
                    <div class="dropdown-menu">
                        <a href="#" class="view-product" data-id="${item.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Details
                        </a>
                        <a href="#" class="edit-product" data-id="${item.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                            Edit
                        </a>
                        <a href="#" class="delete-product" data-id="${item.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            Delete
                        </a>
                    </div>
                </div>
            </td>
        `;
        inventoryList.appendChild(row);
    });

    // Add event listeners for dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownMenu = toggle.nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.remove('show');
            });
            dropdownMenu.classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    });

    // View Product Details
    document.querySelectorAll('.view-product').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const item = inventory.find(i => i.id == id);
            document.getElementById('view-product-name').textContent = item.name;
            document.getElementById('view-product-category').textContent = item.category || 'N/A';
            document.getElementById('view-product-price').textContent = `$${item.price.toFixed(2)}`;
            document.getElementById('view-product-quantity').textContent = item.quantity;
            document.getElementById('view-product-expiration').textContent = item.expiration_date || 'N/A';
            document.getElementById('view-product-modal').classList.remove('hidden');
        });
    });

    // Edit Product
    document.querySelectorAll('.edit-product').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const item = inventory.find(i => i.id == id);
            document.getElementById('modal-title').textContent = 'Edit Product';
            document.getElementById('product-id').value = item.id;
            document.getElementById('product-name').value = item.name;
            document.getElementById('product-category').value = item.category || '';
            document.getElementById('product-quantity').value = item.quantity;
            document.getElementById('product-price').value = item.price;
            document.getElementById('product-expiration').value = item.expiration_date || '';
            document.getElementById('add-product-modal').classList.remove('hidden');
        });
    });

    // Delete Product
    document.querySelectorAll('.delete-product').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            await fetch(`http://localhost:3000/api/inventory/${id}`, { method: 'DELETE' });
            renderInventory(filter, category);
        });
    });
}

// Setup Inventory Controls
function setupInventoryControls() {
    // Add Product Button
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('product-id').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('product-quantity').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-expiration').value = '';
        document.getElementById('add-product-modal').classList.remove('hidden');
    });

    // Cancel Add/Edit Product
    document.getElementById('cancel-add-product').addEventListener('click', () => {
        document.getElementById('add-product-modal').classList.add('hidden');
    });

    // Close View Product Modal
    document.getElementById('close-view-product').addEventListener('click', () => {
        document.getElementById('view-product-modal').classList.add('hidden');
    });

    // Save Product
    document.getElementById('save-product-btn').addEventListener('click', async () => {
        const id = document.getElementById('product-id').value;
        const product = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            quantity: parseInt(document.getElementById('product-quantity').value),
            price: parseFloat(document.getElementById('product-price').value),
            expiration_date: document.getElementById('product-expiration').value
        };

        if (id) {
            await fetch(`http://localhost:3000/api/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        } else {
            await fetch('http://localhost:3000/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        }

        document.getElementById('add-product-modal').classList.add('hidden');
        renderInventory();
    });

    // Search and Filter
    document.getElementById('search-products').addEventListener('input', () => {
        const filter = document.getElementById('search-products').value;
        const category = document.getElementById('category-filter').value;
        renderInventory(filter, category);
    });

    document.getElementById('category-filter').addEventListener('change', () => {
        const filter = document.getElementById('search-products').value;
        const category = document.getElementById('category-filter').value;
        renderInventory(filter, category);
    });
}

// Render Sales
async function renderSales(filter = '', statusFilter = '') {
    const sales = await fetchData('sales');
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = '';

    const filteredSales = sales
        .filter(sale => sale.customer_id.toString().includes(filter))
        .filter(sale => statusFilter ? sale.status === statusFilter : true);

    // Calculate Metrics
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2);
    const totalOrders = filteredSales.length;
    const averageOrder = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0.00;
    const completionRate = totalOrders > 0 ? (filteredSales.filter(s => s.status === 'Completed').length / totalOrders * 100).toFixed(0) : 0;

    document.getElementById('total-sales-sales').textContent = `$${totalSales}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('average-order').textContent = `$${averageOrder}`;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;

    // Populate Table
    filteredSales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">ORD-${sale.id}</td>
            <td class="p-2">${sale.customer_id}</td>
            <td class="p-2">${sale.sale_date}</td>
            <td class="p-2">$${sale.total.toFixed(2)}</td>
            <td class="p-2">${sale.quantity}</td>
            <td class="p-2"><span class="status-${sale.status.toLowerCase()}">${sale.status}</span></td>
            <td class="p-2">
                <div class="dropdown">
                    <span class="dropdown-toggle">...</span>
                    <div class="dropdown-menu">
                        <a href="#" class="view-invoice" data-id="${sale.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Invoice
                        </a>
                        <a href="#" class="download-invoice" data-id="${sale.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Invoice
                        </a>
                    </div>
                </div>
            </td>
        `;
        salesList.appendChild(row);
    });

    // Add event listeners for dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownMenu = toggle.nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.remove('show');
            });
            dropdownMenu.classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    });

    // View Invoice
    document.querySelectorAll('.view-invoice').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const sale = sales.find(s => s.id == id);
            const details = document.getElementById('invoice-details');
            details.innerHTML = `
                <p><strong>Order #:</strong> ORD-${sale.id}</p>
                <p><strong>Customer ID:</strong> ${sale.customer_id}</p>
                <p><strong>Date:</strong> ${sale.sale_date}</p>
                <p><strong>Amount:</strong> $${sale.total.toFixed(2)}</p>
                <p><strong>Items:</strong> ${sale.quantity}</p>
                <p><strong>Status:</strong> ${sale.status}</p>
            `;
            document.getElementById('view-invoice-modal').classList.remove('hidden');
        });
    });

    // Close View Invoice Modal
    document.getElementById('close-view-invoice').addEventListener('click', () => {
        document.getElementById('view-invoice-modal').classList.add('hidden');
    });

    // Download Invoice
    document.querySelectorAll('.download-invoice').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const sale = sales.find(s => s.id == id);
            const invoiceContent = `
                Invoice
                Order #: ORD-${sale.id}
                Customer ID: ${sale.customer_id}
                Date: ${sale.sale_date}
                Amount: $${sale.total.toFixed(2)}
                Items: ${sale.quantity}
                Status: ${sale.status}
            `;
            const blob = new Blob([invoiceContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_ORD-${sale.id}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    });

    // Export Sales
    document.getElementById('export-sales').addEventListener('click', () => {
        const csv = [
            ['Order #', 'Customer ID', 'Date', 'Amount', 'Items', 'Status'],
            ...filteredSales.map(sale => [`ORD-${sale.id}`, sale.customer_id, sale.sale_date, `$${sale.total.toFixed(2)}`, sale.quantity, sale.status])
        ].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    });

    // Search and Filter
    document.getElementById('search-sales').addEventListener('input', () => {
        const filter = document.getElementById('search-sales').value;
        const statusFilter = document.getElementById('filter-sales').value;
        renderSales(filter, statusFilter);
    });

    document.getElementById('filter-sales').addEventListener('change', () => {
        const filter = document.getElementById('search-sales').value;
        const statusFilter = document.getElementById('filter-sales').value;
        renderSales(filter, statusFilter);
    });
}

// Render Customers
async function renderCustomers(filter = '') {
    const customers = await fetchData('customers');
    const customersList = document.getElementById('customers-list');
    customersList.innerHTML = '';

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Calculate Metrics
    const totalCustomers = filteredCustomers.length;
    const activeCustomers = filteredCustomers.filter(c => c.status === 'Active').length;
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.orders, 0);
    const avgSpent = totalCustomers > 0 ? (filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers).toFixed(2) : 0.00;

    document.getElementById('total-customers-metric').textContent = totalCustomers;
    document.getElementById('active-customers-metric').textContent = activeCustomers;
    document.getElementById('total-orders-metric').textContent = totalOrders;
    document.getElementById('avg-spent-metric').textContent = `$${avgSpent}`;

    // Populate Table
    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${customer.initials} ${customer.name}</td>
            <td class="p-2">
                <div>${customer.email}</div>
                <div>(${customer.phone})</div>
            </td>
            <td class="p-2">${customer.orders}</td>
            <td class="p-2">$${customer.totalSpent.toFixed(2)}</td>
            <td class="p-2">${customer.lastPurchase}</td>
            <td class="p-2"><span class="status-${customer.status.toLowerCase()}">${customer.status}</span></td>
            <td class="p-2">
                <div class="dropdown">
                    <span class="dropdown-toggle">...</span>
                    <div class="dropdown-menu">
                        <a href="#" class="sales-history" data-id="${customer.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Sales History
                        </a>
                        <a href="#" class="view-details" data-id="${customer.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Details
                        </a>
                        <a href="#" class="edit-customer" data-id="${customer.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                            Edit Customer
                        </a>
                    </div>
                </div>
            </td>
        `;
        customersList.appendChild(row);
    });

    // Add event listeners for dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownMenu = toggle.nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.remove('show');
            });
            dropdownMenu.classList.toggle('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    });

    // Sales History
    document.querySelectorAll('.sales-history').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            alert(`Viewing sales history for customer ID: ${id}`);
        });
    });

    // View Details
    document.querySelectorAll('.view-details').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const customer = filteredCustomers.find(c => c.id == id);
            document.getElementById('view-customer-name').textContent = customer.name;
            document.getElementById('view-customer-email').textContent = customer.email;
            document.getElementById('view-customer-phone').textContent = customer.phone;
            document.getElementById('view-customer-orders').textContent = customer.orders;
            document.getElementById('view-customer-total-spent').textContent = `$${customer.totalSpent.toFixed(2)}`;
            document.getElementById('view-customer-last-purchase').textContent = customer.lastPurchase;
            document.getElementById('view-customer-status').textContent = customer.status;
            document.getElementById('view-customer-modal').classList.remove('hidden');
        });
    });

    // Edit Customer
    document.querySelectorAll('.edit-customer').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const customer = filteredCustomers.find(c => c.id == id);
            document.getElementById('customer-modal-title').textContent = 'Edit Customer';
            document.getElementById('customer-id').value = customer.id;
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-email').value = customer.email;
            document.getElementById('customer-phone').value = customer.phone;
            document.getElementById('add-customer-modal').classList.remove('hidden');
        });
    });
}

// Setup Customer Controls
function setupCustomerControls() {
    // Add Customer Button
    document.getElementById('add-customer-btn').addEventListener('click', () => {
        document.getElementById('customer-modal-title').textContent = 'Add New Customer';
        document.getElementById('customer-id').value = '';
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('add-customer-modal').classList.remove('hidden');
    });

    // Cancel Add/Edit Customer
    document.getElementById('cancel-add-customer').addEventListener('click', () => {
        document.getElementById('add-customer-modal').classList.add('hidden');
    });

    // Close View Customer Modal
    document.getElementById('close-view-customer').addEventListener('click', () => {
        document.getElementById('view-customer-modal').classList.add('hidden');
    });

    // Save Customer
    document.getElementById('save-customer-btn').addEventListener('click', async () => {
        const id = document.getElementById('customer-id').value;
        const customer = {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value
        };

        if (id) {
            await fetch(`http://localhost:3000/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer)
            });
        } else {
            await fetch('http://localhost:3000/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customer)
            });
        }

        document.getElementById('add-customer-modal').classList.add('hidden');
        renderCustomers();
    });

    // Search Customers
    document.getElementById('search-customers').addEventListener('input', () => {
        const filter = document.getElementById('search-customers').value;
        renderCustomers(filter);
    });
}

// Render Employees
async function renderEmployees() {
    const employees = await fetchData('employees');
    const employeesList = document.getElementById('employees-list');
    employeesList.innerHTML = '';
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${employee.name}</td>
            <td class="p-2">${employee.role}</td>
            <td class="p-2">${employee.performance || 'N/A'}</td>
        `;
        employeesList.appendChild(row);
    });
}

// Render Invoices
async function renderInvoices() {
    const invoices = await fetchData('invoices');
    const invoicesList = document.getElementById('invoices-list');
    invoicesList.innerHTML = '';
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${invoice.customer_id}</td>
            <td class="p-2">$${invoice.total.toFixed(2)}</td>
            <td class="p-2">${invoice.discount ? `$${invoice.discount.toFixed(2)}` : 'N/A'}</td>
            <td class="p-2">${invoice.invoice_date}</td>
        `;
        invoicesList.appendChild(row);
    });
}

// Render Charts
async function renderCharts() {
    const sales = await fetchData('sales');
    const ctxRevenue = document.getElementById('revenue-chart').getContext('2d');
    const ctxAnalytics = document.getElementById('analytics-chart').getContext('2d');

    new Chart(ctxRevenue, {
        type: 'line',
        data: {
            labels: sales.map(sale => sale.sale_date),
            datasets: [{
                label: 'Revenue',
                data: sales.map(sale => sale.total),
                borderColor: '#3b82f6',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(ctxAnalytics, {
        type: 'bar',
        data: {
            labels: sales.map(sale => sale.sale_date),
            datasets: [{
                label: 'Sales',
                data: sales.map(sale => sale.total),
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}