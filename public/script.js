// Initialize App
function initializeApp() {
    console.log("Initializing application...");
    
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
    setupEmployeeControls();
    setupInvoiceControls();

    // Check for hash in URL and navigate to that section
    const hash = window.location.hash;
    if (hash) {
        const targetSection = document.querySelector(`[data-section="${hash.substring(1)}-section"]`);
        if (targetSection) {
            targetSection.click();
        }
    }
    
    // Set up auto-refresh for real-time data updates (every 30 seconds)
    setInterval(() => {
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;
        
        const sectionId = activeSection.id;
        
        console.log("Auto-refreshing data for section:", sectionId);
        
        // Refresh data based on active section
        switch (sectionId) {
            case 'dashboard-section':
                updateDashboard();
                break;
            case 'inventory-section':
                renderInventory();
                break;
            case 'sales-section':
                renderSales();
                break;
            case 'customers-section':
                renderCustomers();
                break;
            case 'employees-section':
                renderEmployees();
                break;
            case 'billing-section':
                renderInvoices();
                break;
            case 'analytics-section':
                renderCharts();
                break;
        }
    }, 30000); // 30 seconds
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
            
            // Update URL hash without scrolling
            const scrollPosition = window.pageYOffset;
            window.location.hash = sectionId.replace('-section', '');
            window.scrollTo(0, scrollPosition);
        });
    });
    
    // Toggle Analytics submenu
    const analyticsLink = document.querySelector('.nav-link[data-section="analytics-section"]');
    const analyticsSubmenu = document.querySelector('.analytics-submenu');
    const analyticsDropdownIcon = document.getElementById('analytics-dropdown-icon');
    
    if (analyticsLink && analyticsSubmenu && analyticsDropdownIcon) {
        analyticsLink.addEventListener('click', (e) => {
            e.preventDefault();
            analyticsSubmenu.classList.toggle('hidden');
            const isOpen = !analyticsSubmenu.classList.contains('hidden');
            analyticsDropdownIcon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0)';
        });
    }
    
    // Analytics submenu items
    document.querySelectorAll('.analytics-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show analytics section
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.getElementById('analytics-section').classList.add('active');
            
            // Update nav link appearance
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            analyticsLink.classList.add('active');
            
            // Get analytics type
            const type = item.getAttribute('data-type');
            
            // Update URL hash
            window.location.hash = 'analytics';
            
            // Show corresponding content
            const salesBtn = document.getElementById('sales-analytics-btn');
            const inventoryBtn = document.getElementById('inventory-analytics-btn');
            const customerBtn = document.getElementById('customer-analytics-btn');
            
            if (type === 'sales' && salesBtn) {
                salesBtn.click();
            } else if (type === 'inventory' && inventoryBtn) {
                inventoryBtn.click();
            } else if (type === 'customer' && customerBtn) {
                customerBtn.click();
            }
        });
    });
}

// Fetch Data
async function fetchData(endpoint) {
    console.log(`Fetching data from endpoint: ${endpoint}`);
    try {
        const response = await fetch(`http://localhost:3000/api/${endpoint}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Data fetched from ${endpoint}:`, data);
        return data;
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
    document.getElementById('total-sales').textContent = `₹${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}`;
    document.getElementById('total-inventory').textContent = inventory.length;
    document.getElementById('total-customers').textContent = customers.length;
    document.getElementById('average-order-value').textContent = sales.length > 0 ? `₹${(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2)}` : '$0.00';

    // Recent Sales
    const recentSales = document.getElementById('recent-sales');
    recentSales.innerHTML = '';
    
    sales.slice(0, 5).forEach(sale => {
        const product = inventory.find(item => item.id === sale.product_id) || { name: 'Unknown' };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${product.name}</td>
            <td class="p-2">${sale.quantity}</td>
            <td class="p-2">₹${sale.total.toFixed(2)}</td>
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
            <td class="p-2">₹${item.price.toFixed(2)}</td>
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
            document.getElementById('view-product-price').textContent = `₹${item.price.toFixed(2)}`;
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
    const inventory = await fetchData('inventory');
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

    document.getElementById('total-sales-sales').textContent = `₹${totalSales}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('average-order').textContent = `₹${averageOrder}`;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;

    // Populate Table
    filteredSales.forEach(sale => {
        const product = inventory.find(item => item.id === sale.product_id) || { name: 'Unknown' };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">ORD-${sale.id}</td>
            <td class="p-2">${sale.customer_id}</td>
            <td class="p-2">${sale.sale_date}</td>
            <td class="p-2">₹${sale.total.toFixed(2)}</td>
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
            const product = inventory.find(item => item.id === sale.product_id) || { name: 'Unknown' };
            const details = document.getElementById('invoice-details');
            details.innerHTML = `
                <p><strong>Order #:</strong> ORD-${sale.id}</p>
                <p><strong>Customer ID:</strong> ${sale.customer_id}</p>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Date:</strong> ${sale.sale_date}</p>
                <p><strong>Amount:</strong>₹${sale.total.toFixed(2)}</p>
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
            const product = inventory.find(item => item.id === sale.product_id) || { name: 'Unknown' };
            const invoiceContent = `
                Invoice
                Order #: ORD-${sale.id}
                Customer ID: ${sale.customer_id}
                Product: ${product.name}
                Date: ${sale.sale_date}
                Amount: ₹${sale.total.toFixed(2)}
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
            ['Order #', 'Customer ID', 'Product', 'Date', 'Amount', 'Items', 'Status'],
            ...filteredSales.map(sale => {
                const product = inventory.find(item => item.id === sale.product_id) || { name: 'Unknown' };
                return [`ORD-${sale.id}`, sale.customer_id, product.name, sale.sale_date, `₹${sale.total.toFixed(2)}`, sale.quantity, sale.status];
            })
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
    document.getElementById('avg-spent-metric').textContent = `₹${avgSpent}`;

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
            <td class="p-2">₹${customer.totalSpent.toFixed(2)}</td>
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
            document.getElementById('view-customer-total-spent').textContent = `₹${customer.totalSpent.toFixed(2)}`;
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
async function renderEmployees(filter = '', statusFilter = '') {
    const employees = await fetchData('employees');
    const employeesList = document.getElementById('employees-list');
    employeesList.innerHTML = '';

    const filteredEmployees = employees
        .filter(employee => employee.name.toLowerCase().includes(filter.toLowerCase()))
        .filter(employee => statusFilter ? employee.status === statusFilter : true);

    // Calculate Metrics
    const totalEmployees = filteredEmployees.length;
    const activeEmployees = filteredEmployees.filter(e => e.status === 'Active').length;
    const departments = [...new Set(filteredEmployees.map(e => e.department))].length;

    document.getElementById('total-employees-metric').textContent = totalEmployees;
    document.getElementById('active-employees-metric').textContent = activeEmployees;
    document.getElementById('departments-metric').textContent = departments;

    // Populate Table
    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${employee.name}</td>
            <td class="p-2">${employee.role}</td>
            <td class="p-2">${employee.department}</td>
            <td class="p-2">${employee.today_status}</td>
            <td class="p-2">${employee.join_date}</td>
            <td class="p-2"><span class="status-${employee.status.toLowerCase()}">${employee.status}</span></td>
            <td class="p-2">
                <div class="dropdown">
                    <span class="dropdown-toggle">...</span>
                    <div class="dropdown-menu">
                        <a href="#" class="view-profile" data-id="${employee.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            View Profile
                        </a>
                        <a href="#" class="edit-employee" data-id="${employee.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
                            Edit
                        </a>
                        <a href="#" class="delete-employee" data-id="${employee.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            Delete
                        </a>
                    </div>
                </div>
            </td>
        `;
        employeesList.appendChild(row);
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

    // View Profile
    document.querySelectorAll('.view-profile').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const employee = filteredEmployees.find(e => e.id == id);
            document.getElementById('view-profile-name').textContent = employee.name;
            document.getElementById('view-profile-email').textContent = employee.email;
            document.getElementById('view-profile-phone').textContent = employee.phone || 'N/A';
            document.getElementById('view-profile-role').textContent = employee.role;
            document.getElementById('view-profile-department').textContent = employee.department;
            document.getElementById('view-profile-join-date').textContent = employee.join_date;
            document.getElementById('view-profile-today-status').textContent = employee.today_status;
            // Mock past attendance (since not stored in DB)
            document.getElementById('view-profile-past-attendance').innerHTML = `
                <li>2023-07-14: Present</li>
                <li>2023-07-13: Absent</li>
                <li>2023-07-12: Present</li>
            `;
            document.getElementById('view-profile-modal').classList.remove('hidden');
        });
    });

    // Edit Employee
    document.querySelectorAll('.edit-employee').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const employee = filteredEmployees.find(e => e.id == id);
            document.getElementById('employee-modal-title').textContent = 'Edit Employee';
            document.getElementById('employee-id').value = employee.id;
            document.getElementById('employee-name').value = employee.name;
            document.getElementById('employee-email').value = employee.email;
            document.getElementById('employee-phone').value = employee.phone || '';
            document.getElementById('employee-role').value = employee.role;
            document.getElementById('employee-department').value = employee.department;
            document.getElementById('employee-join-date').value = employee.join_date;
            document.getElementById('add-employee-modal').classList.remove('hidden');
        });
    });

    // Delete Employee
    document.querySelectorAll('.delete-employee').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            await fetch(`http://localhost:3000/api/employees/${id}`, { method: 'DELETE' });
            renderEmployees(filter, statusFilter);
        });
    });
}

// Setup Employee Controls
function setupEmployeeControls() {
    // Add Employee Button
    document.getElementById('add-employee-btn').addEventListener('click', () => {
        document.getElementById('employee-modal-title').textContent = 'Add New Employee';
        document.getElementById('employee-id').value = '';
        document.getElementById('employee-name').value = '';
        document.getElementById('employee-email').value = '';
        document.getElementById('employee-phone').value = '';
        document.getElementById('employee-role').value = '';
        document.getElementById('employee-department').value = '';
        document.getElementById('employee-join-date').value = '';
        document.getElementById('add-employee-modal').classList.remove('hidden');
    });

    // Cancel Add/Edit Employee
    document.getElementById('cancel-add-employee').addEventListener('click', () => {
        document.getElementById('add-employee-modal').classList.add('hidden');
    });

    // Close View Profile Modal
    document.getElementById('close-view-profile').addEventListener('click', () => {
        document.getElementById('view-profile-modal').classList.add('hidden');
    });

    // Save Employee
    document.getElementById('save-employee-btn').addEventListener('click', async () => {
        const id = document.getElementById('employee-id').value;
        const employee = {
            name: document.getElementById('employee-name').value,
            email: document.getElementById('employee-email').value,
            phone: document.getElementById('employee-phone').value,
            role: document.getElementById('employee-role').value,
            department: document.getElementById('employee-department').value,
            join_date: document.getElementById('employee-join-date').value,
            status: 'Active',
            today_status: 'Present'
        };

        if (id) {
            await fetch(`http://localhost:3000/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employee)
            });
        } else {
            await fetch('http://localhost:3000/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employee)
            });
        }

        document.getElementById('add-employee-modal').classList.add('hidden');
        renderEmployees();
    });

    // Search and Filter
    document.getElementById('search-employees').addEventListener('input', () => {
        const filter = document.getElementById('search-employees').value;
        const statusFilter = document.getElementById('filter-employees').value;
        renderEmployees(filter, statusFilter);
    });

    document.getElementById('filter-employees').addEventListener('change', () => {
        const filter = document.getElementById('search-employees').value;
        const statusFilter = document.getElementById('filter-employees').value;
        renderEmployees(filter, statusFilter);
    });
}

// Render Invoices
async function renderInvoices() {
    try {
        console.log("Rendering invoices...");
        
        // Show spinner
        document.querySelectorAll('#billing-section .spinner').forEach(spinner => spinner.classList.remove('hidden'));
        
        // Fetch invoices data
        const response = await fetchData('invoices');
        console.log("API Response:", response);
        
        const invoices = response.invoices || [];
        const metrics = response.metrics || {
            totalRevenue: 0,
            pendingAmount: 0,
            overdueAmount: 0,
            totalInvoices: 0
        };
        
        // Hide spinner
        document.querySelectorAll('#billing-section .spinner').forEach(spinner => spinner.classList.add('hidden'));
        
        // Update metrics cards
        document.getElementById('total-revenue').textContent = `₹${metrics.totalRevenue.toFixed(2)}`;
        document.getElementById('pending-amount').textContent = `₹${metrics.pendingAmount.toFixed(2)}`;
        document.getElementById('overdue-amount').textContent = `₹${metrics.overdueAmount.toFixed(2)}`;
        document.getElementById('total-invoices').textContent = metrics.totalInvoices;
        
        // Update invoice list
        const invoicesList = document.getElementById('invoices-list');
        if (!invoicesList) {
            console.error("Invoice list element not found!");
            return;
        }
        
        invoicesList.innerHTML = '';
        
        if (invoices.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="p-4 text-center text-gray-500">No invoices found</td>
            `;
            invoicesList.appendChild(row);
            return;
        }
        
        // Add invoices to table
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            
            // Determine status class
            let statusClass = 'bg-gray-200 text-gray-800'; // Default
            if (invoice.status === 'Paid') {
                statusClass = 'bg-green-100 text-green-800';
            } else if (invoice.status === 'Pending') {
                statusClass = 'bg-yellow-100 text-yellow-800';
            } else if (invoice.status === 'Overdue') {
                statusClass = 'bg-red-100 text-red-800';
            } else if (invoice.status === 'Draft') {
                statusClass = 'bg-blue-100 text-blue-800';
            }
            
            row.innerHTML = `
                <td class="p-2 text-blue-600">${invoice.invoice_number}</td>
                <td class="p-2">${invoice.customer_name || `Customer #${invoice.customer_id}`}</td>
                <td class="p-2">${formatDate(invoice.invoice_date)}</td>
                <td class="p-2">${formatDate(invoice.due_date || invoice.invoice_date)}</td>
                <td class="p-2">₹${invoice.total.toFixed(2)}</td>
                <td class="p-2">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${invoice.status}
                    </span>
                </td>
                <td class="p-2">
                    <div class="dropdown">
                        <span class="dropdown-toggle cursor-pointer">
                            <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                            </svg>
                        </span>
                        <div class="dropdown-menu right-0 w-48">
                            <a href="#" class="view-invoice flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="${invoice.id}">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                View Invoice
                            </a>
                            <a href="#" class="send-invoice flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="${invoice.id}">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Send Invoice
                            </a>
                            <a href="#" class="download-pdf flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="${invoice.id}">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Download PDF
                            </a>
                            <a href="#" class="print-invoice flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="${invoice.id}">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                </svg>
                                Print
                            </a>
                        </div>
                    </div>
                </td>
            `;
            invoicesList.appendChild(row);
        });
        
        setupDropdownEvents();
        setupInvoiceButtonHandlers(invoices);
        
    } catch (error) {
        console.error("Error rendering invoices:", error);
        document.querySelectorAll('#billing-section .spinner').forEach(spinner => spinner.classList.add('hidden'));
        
        // Show error message to user
        const invoicesList = document.getElementById('invoices-list');
        if (invoicesList) {
            invoicesList.innerHTML = `
                <tr>
                    <td colspan="7" class="p-4 text-center text-red-500">Error loading invoices. Please try again.</td>
                </tr>
            `;
        }
    }
}

// Setup dropdown events for the invoice list
function setupDropdownEvents() {
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
}

// Setup invoice button handlers
function setupInvoiceButtonHandlers(invoices) {
    // View Invoice
    document.querySelectorAll('.view-invoice').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            try {
                const invoice = await fetch(`http://localhost:3000/api/invoices/${id}`).then(res => res.json());
                openInvoiceModal(invoice);
            } catch (error) {
                console.error('Error fetching invoice:', error);
                alert('Could not load invoice details. Please try again.');
            }
        });
    });
    
    // Send Invoice
    document.querySelectorAll('.send-invoice').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const invoice = invoices.find(inv => inv.id == id);
            if (invoice) {
                alert(`Email would be sent for invoice ${invoice.invoice_number} to ${invoice.customer_name || 'customer'}`);
            }
        });
    });
    
    // Download PDF
    document.querySelectorAll('.download-pdf').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const invoice = invoices.find(inv => inv.id == id);
            if (invoice) {
                alert(`Downloading PDF for invoice ${invoice.invoice_number}`);
            }
        });
    });
    
    // Print Invoice
    document.querySelectorAll('.print-invoice').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-id');
            const invoice = invoices.find(inv => inv.id == id);
            if (invoice) {
                alert(`Printing invoice ${invoice.invoice_number}`);
            }
        });
    });
    
    // Setup New Invoice button
    const newInvoiceBtn = document.getElementById('new-invoice-btn');
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener('click', () => {
            console.log("New invoice button clicked");
            const modalTitle = document.getElementById('invoice-modal-title');
            const invoiceIdInput = document.getElementById('invoice-id');
            const customerIdInput = document.getElementById('invoice-customer-id');
            const amountInput = document.getElementById('invoice-amount');
            const discountInput = document.getElementById('invoice-discount');
            const dateInput = document.getElementById('invoice-date');
            const dueDateInput = document.getElementById('invoice-due-date');
            const statusSelect = document.getElementById('invoice-status');
            const modal = document.getElementById('add-invoice-modal');
            
            if (modalTitle) modalTitle.textContent = 'Create New Invoice';
            if (invoiceIdInput) invoiceIdInput.value = '';
            if (customerIdInput) customerIdInput.value = '';
            if (amountInput) amountInput.value = '';
            if (discountInput) discountInput.value = '0';
            
            if (dateInput) {
                const today = new Date();
                dateInput.valueAsDate = today;
            }
            
            if (dueDateInput) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 14);
                dueDateInput.valueAsDate = dueDate;
            }
            
            if (statusSelect) statusSelect.value = 'Pending';
            if (modal) modal.classList.remove('hidden');
        });
    } else {
        console.error("New invoice button not found!");
    }
    
    // Setup Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            console.log("Export button clicked");
            alert('Exporting invoices to CSV...');
            // Here you would implement the actual export functionality
        });
    }
    
    // Setup Search functionality
    const searchInput = document.getElementById('search-invoices');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#invoices-list tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Setup Filter functionality
    const filterSelect = document.getElementById('filter-invoices');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const rows = document.querySelectorAll('#invoices-list tr');
            
            rows.forEach(row => {
                if (filterValue === 'all') {
                    row.style.display = '';
                    return;
                }
                
                const statusElement = row.querySelector('td:nth-child(6) span');
                if (statusElement) {
                    const status = statusElement.textContent.trim().toLowerCase();
                    row.style.display = status === filterValue ? '' : 'none';
                }
            });
        });
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // If invalid date, return the original string
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Open Invoice Modal
function openInvoiceModal(invoice) {
    console.log("Opening invoice modal for invoice:", invoice);
    
    const modal = document.getElementById('view-invoice-detail-modal');
    if (!modal) {
        console.error("Invoice detail modal not found!");
        return;
    }
    
    // Set invoice details
    const elements = {
        number: document.getElementById('invoice-detail-number'),
        customer: document.getElementById('invoice-detail-customer'),
        date: document.getElementById('invoice-detail-date'),
        dueDate: document.getElementById('invoice-detail-due-date'),
        amount: document.getElementById('invoice-detail-amount'),
        discount: document.getElementById('invoice-detail-discount'),
        total: document.getElementById('invoice-detail-total'),
        status: document.getElementById('invoice-detail-status')
    };
    
    // Update elements if they exist
    if (elements.number) elements.number.textContent = invoice.invoice_number;
    if (elements.customer) elements.customer.textContent = invoice.customer_name || `Customer #${invoice.customer_id}`;
    if (elements.date) elements.date.textContent = formatDate(invoice.invoice_date);
    if (elements.dueDate) elements.dueDate.textContent = formatDate(invoice.due_date);
    if (elements.amount) elements.amount.textContent = `₹${invoice.total.toFixed(2)}`;
    if (elements.discount) elements.discount.textContent = invoice.discount ? `₹${invoice.discount.toFixed(2)}` : '$0.00';
    
    // Calculate total after discount
    const totalAfterDiscount = invoice.total - (invoice.discount || 0);
    if (elements.total) elements.total.textContent = `₹${totalAfterDiscount.toFixed(2)}`;
    
    // Set status with appropriate styling
    if (elements.status) {
        elements.status.textContent = invoice.status;
        
        // Remove all existing status classes
        elements.status.className = 'px-2 py-1 rounded-full text-xs font-medium';
        
        // Add appropriate status class
        if (invoice.status === 'Paid') {
            elements.status.classList.add('bg-green-100', 'text-green-800');
        } else if (invoice.status === 'Pending') {
            elements.status.classList.add('bg-yellow-100', 'text-yellow-800');
        } else if (invoice.status === 'Overdue') {
            elements.status.classList.add('bg-red-100', 'text-red-800');
        } else if (invoice.status === 'Draft') {
            elements.status.classList.add('bg-blue-100', 'text-blue-800');
        } else {
            elements.status.classList.add('bg-gray-200', 'text-gray-800');
        }
    }
    
    // Show the modal
    modal.classList.remove('hidden');
}

// Setup Invoice Controls
function setupInvoiceControls() {
    console.log("Setting up invoice controls...");
    
    // Cancel Add/Edit Invoice
    const cancelAddInvoiceBtn = document.getElementById('cancel-add-invoice');
    if (cancelAddInvoiceBtn) {
        cancelAddInvoiceBtn.addEventListener('click', () => {
            const modal = document.getElementById('add-invoice-modal');
            if (modal) modal.classList.add('hidden');
        });
    }
    
    // Save Invoice
    const saveInvoiceBtn = document.getElementById('save-invoice-btn');
    if (saveInvoiceBtn) {
        saveInvoiceBtn.addEventListener('click', async () => {
            console.log("Save invoice button clicked");
            
            // Get form elements
            const idInput = document.getElementById('invoice-id');
            const customerIdInput = document.getElementById('invoice-customer-id');
            const amountInput = document.getElementById('invoice-amount');
            const discountInput = document.getElementById('invoice-discount');
            const dateInput = document.getElementById('invoice-date');
            const dueDateInput = document.getElementById('invoice-due-date');
            const statusSelect = document.getElementById('invoice-status');
            const modal = document.getElementById('add-invoice-modal');
            
            // Validate required fields
            if (!customerIdInput || !amountInput || !dateInput || !dueDateInput || !statusSelect) {
                console.error("One or more form fields not found");
                return;
            }
            
            // Get form values
            const id = idInput?.value || '';
            const customerId = parseInt(customerIdInput.value);
            const total = parseFloat(amountInput.value);
            const discount = parseFloat(discountInput?.value || 0);
            const invoiceDate = dateInput.value;
            const dueDate = dueDateInput.value;
            const status = statusSelect.value;
            
            // Validate input
            if (!customerId || isNaN(customerId)) {
                alert('Please enter a valid customer ID');
                return;
            }
            
            if (!total || isNaN(total) || total <= 0) {
                alert('Please enter a valid amount');
                return;
            }
            
            if (!invoiceDate) {
                alert('Please enter a valid invoice date');
                return;
            }
            
            // Create invoice object
            const invoice = {
                customer_id: customerId,
                total: total,
                discount: discount,
                invoice_date: invoiceDate,
                due_date: dueDate,
                status: status
            };
            
            try {
                let response;
                
                if (id) {
                    // Update existing invoice
                    console.log("Updating invoice:", id, invoice);
                    response = await fetch(`http://localhost:3000/api/invoices/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invoice)
                    });
                } else {
                    // Create new invoice
                    console.log("Creating new invoice:", invoice);
                    response = await fetch('http://localhost:3000/api/invoices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(invoice)
                    });
                }
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to save invoice');
                }
                
                // Hide modal and refresh invoices
                if (modal) modal.classList.add('hidden');
                await renderInvoices();
                
                // Show success message
                alert(id ? 'Invoice updated successfully' : 'Invoice created successfully');
            } catch (error) {
                console.error('Error saving invoice:', error);
                alert('Failed to save invoice: ' + error.message);
            }
        });
    } else {
        console.error("Save invoice button not found!");
    }
    
    // Close invoice detail modal
    const closeInvoiceDetailBtn = document.getElementById('close-invoice-detail-modal');
    if (closeInvoiceDetailBtn) {
        closeInvoiceDetailBtn.addEventListener('click', () => {
            const modal = document.getElementById('view-invoice-detail-modal');
            if (modal) modal.classList.add('hidden');
        });
    }

    const exportButton = document.getElementById('export-invoices');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            exportInvoicesToCSV();
        });
    }
}

// Function to export invoices to CSV
function exportInvoicesToCSV() {
    fetch('/api/invoices')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching invoices for export');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.invoices || data.invoices.length === 0) {
                alert('No invoices available to export');
                return;
            }
            
            const invoices = data.invoices;
            
            // Define CSV headers
            const headers = [
                'Invoice Number',
                'Customer',
                'Invoice Date',
                'Due Date',
                'Total',
                'Status'
            ];
            
            // Create CSV rows
            const csvRows = [];
            csvRows.push(headers.join(','));
            
            invoices.forEach(invoice => {
                const invoiceNumber = `INV-${String(invoice.id).padStart(3, '0')}`;
                const row = [
                    invoiceNumber,
                    invoice.customer_name || 'Unknown',
                    formatDate(invoice.invoice_date),
                    formatDate(invoice.due_date),
                    formatCurrency(invoice.total),
                    invoice.status
                ];
                
                // Escape any commas in the data
                const escapedRow = row.map(value => {
                    // If the value contains a comma, quote it
                    if (String(value).includes(',')) {
                        return `"${value}"`;
                    }
                    return value;
                });
                
                csvRows.push(escapedRow.join(','));
            });
            
            // Combine rows into a CSV string
            const csvString = csvRows.join('\n');
            
            // Create a Blob and download link
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `invoices-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Trigger download and clean up
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            console.log('Invoices exported to CSV successfully');
        })
        .catch(error => {
            console.error('Error exporting invoices:', error);
            alert('Failed to export invoices. Please try again.');
        });
}

// Helper function to format currency
function formatCurrency(amount) {
    if (amount === undefined || amount === null) return '$0.00';
    return '$' + parseFloat(amount).toFixed(2);
}

// Render Charts
async function renderCharts() {
    console.log("Rendering analytics charts...");
    
    // Setup analytics navigation
    setupAnalyticsNavigation();
    
    // Render each analytics section
    await renderSalesAnalytics();
    await renderInventoryAnalytics();
    await renderCustomerAnalytics();
}

// Setup Analytics Navigation
function setupAnalyticsNavigation() {
    console.log("Setting up analytics navigation...");
    
    const salesBtn = document.getElementById('sales-analytics-btn');
    const inventoryBtn = document.getElementById('inventory-analytics-btn');
    const customerBtn = document.getElementById('customer-analytics-btn');
    const salesContent = document.getElementById('sales-analytics-content');
    const inventoryContent = document.getElementById('inventory-analytics-content');
    const customerContent = document.getElementById('customer-analytics-content');
    
    if (!salesBtn || !inventoryBtn || !customerBtn || !salesContent || !inventoryContent || !customerContent) {
        console.error("One or more analytics elements not found");
        return;
    }
    
    // Show Sales Analytics by default
    salesContent.classList.remove('hidden');
    inventoryContent.classList.add('hidden');
    customerContent.classList.add('hidden');
    
    // Sales Analytics Button
    salesBtn.addEventListener('click', () => {
        // Update buttons
        salesBtn.classList.add('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        salesBtn.classList.remove('text-gray-500');
        inventoryBtn.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        inventoryBtn.classList.add('text-gray-500');
        customerBtn.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        customerBtn.classList.add('text-gray-500');
        
        // Show/hide content
        salesContent.classList.remove('hidden');
        inventoryContent.classList.add('hidden');
        customerContent.classList.add('hidden');
    });
    
    // Inventory Analytics Button
    inventoryBtn.addEventListener('click', () => {
        // Update buttons
        salesBtn.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        salesBtn.classList.add('text-gray-500');
        inventoryBtn.classList.add('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        inventoryBtn.classList.remove('text-gray-500');
        customerBtn.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        customerBtn.classList.add('text-gray-500');
        
        // Show/hide content
        salesContent.classList.add('hidden');
        inventoryContent.classList.remove('hidden');
        customerContent.classList.add('hidden');
    });
    
    // Customer Analytics Button
    customerBtn.addEventListener('click', () => {
        // Update buttons
        salesBtn.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        salesBtn.classList.add('text-gray-500');
        inventoryBtn.classList.remove('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        inventoryBtn.classList.add('text-gray-500');
        customerBtn.classList.add('text-blue-600', 'font-medium', 'border-b-2', 'border-blue-600', 'pb-2');
        customerBtn.classList.remove('text-gray-500');
        
        // Show/hide content
        salesContent.classList.add('hidden');
        inventoryContent.classList.add('hidden');
        customerContent.classList.remove('hidden');
    });
}

// Sales Analysis Charts
function renderSalesAnalytics() {
    console.log('Initializing Sales Analytics charts');
    
    // Check if chart elements exist before trying to render
    const monthlySalesElement = document.getElementById('monthly-sales-chart');
    const topProductsElement = document.getElementById('top-products-chart');
    
    if (!monthlySalesElement) {
        console.error('Monthly sales chart element not found');
        return;
    }
    
    if (!topProductsElement) {
        console.error('Top products chart element not found');
        return;
    }
    
    fetchAnalyticsData('sales').then(data => {
        if (!data) {
            console.error('No sales analytics data received');
            return;
        }
        
        // Prepare data for Monthly Sales Chart
        const months = [];
        const salesData = [];
        
        if (data.monthlySales && data.monthlySales.length > 0) {
            data.monthlySales.forEach(item => {
                // Format YYYY-MM to MMM YYYY (Jan 2023)
                const [year, month] = item.month.split('-');
                const date = new Date(year, parseInt(month) - 1);
                months.push(date.toLocaleString('default', { month: 'short' }) + ' ' + year);
                salesData.push(item.total_sales);
            });
        } else {
            // Default data if no sales data available
            const currentDate = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setMonth(currentDate.getMonth() - i);
                months.push(date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear());
                salesData.push(0);
            }
        }

        // Update monthly sales chart
        const monthlySalesCtx = monthlySalesElement.getContext('2d');
        if (window.monthlySalesChart) {
            window.monthlySalesChart.destroy();
        }
        
        window.monthlySalesChart = new Chart(monthlySalesCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Sales',
                    data: salesData,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });

        // Update Top Products Chart
        const topProductsCtx = topProductsElement.getContext('2d');
        
        if (window.topProductsChart) {
            window.topProductsChart.destroy();
        }
        
        const productNames = [];
        const productSales = [];
        
        if (data.topProducts && data.topProducts.length > 0) {
            data.topProducts.forEach(product => {
                productNames.push(product.product_name);
                productSales.push(product.total_sales);
            });
        } else {
            // Default data if no products data available
            productNames.push('No Data');
            productSales.push(0);
        }
        
        window.topProductsChart = new Chart(topProductsCtx, {
            type: 'bar',
            data: {
                labels: productNames,
                datasets: [{
                    label: 'Sales Amount',
                    data: productSales,
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Update sales metrics
        const totalRevenueElement = document.getElementById('total-revenue');
        const averageOrderElement = document.getElementById('average-order');
        const conversionRateElement = document.getElementById('conversion-rate');
        
        if (data.salesMetrics && data.salesMetrics.length > 0 && 
            totalRevenueElement && averageOrderElement && conversionRateElement) {
            const metrics = data.salesMetrics[0];
            totalRevenueElement.textContent = formatCurrency(metrics.total_revenue || 0);
            averageOrderElement.textContent = formatCurrency(metrics.average_order_value || 0);
            conversionRateElement.textContent = `${(metrics.conversion_rate || 0).toFixed(1)}%`;
        } else {
            console.error('Sales metrics elements not found or no metrics data available');
        }
        
        // Update monthly growth metrics
        const growthIndicator = document.getElementById('growth-indicator');
        const growthText = document.getElementById('growth-percentage');
        
        if (data.monthlyGrowth && data.monthlyGrowth.length > 0 && 
            growthIndicator && growthText) {
            const latestGrowth = data.monthlyGrowth[data.monthlyGrowth.length - 1];
            const growthRate = latestGrowth.growth_rate || 0;
            
            if (growthRate > 0) {
                growthIndicator.className = 'text-green-500';
                growthIndicator.innerHTML = '<i class="fas fa-arrow-up mr-1"></i>';
                growthText.className = 'text-green-500';
            } else {
                growthIndicator.className = 'text-red-500';
                growthIndicator.innerHTML = '<i class="fas fa-arrow-down mr-1"></i>';
                growthText.className = 'text-red-500';
            }
            
            growthText.textContent = `${Math.abs(growthRate).toFixed(1)}%`;
        } else {
            console.error('Growth indicator elements not found or no growth data available');
        }
    });
}

// Inventory Analysis Charts
function renderInventoryAnalytics() {
    console.log('Initializing Inventory Analytics charts');
    
    // Check if chart elements exist
    const categoryChartElement = document.getElementById('category-distribution-chart');
    const stockLevelsTable = document.getElementById('stock-levels-table');
    
    if (!categoryChartElement) {
        console.error('Category distribution chart element not found');
    }
    
    if (!stockLevelsTable) {
        console.error('Stock levels table element not found');
    }
    
    fetchAnalyticsData('inventory').then(data => {
        if (!data) {
            console.error('No inventory analytics data received');
            return;
        }
        
        // Category Distribution Chart
        if (categoryChartElement) {
            const categoryCtx = categoryChartElement.getContext('2d');
            
            if (window.categoryChart) {
                window.categoryChart.destroy();
            }
            
            const categories = [];
            const categoryData = [];
            const categoryColors = [
                'rgba(79, 70, 229, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ];
            
            if (data.categories && data.categories.length > 0) {
                data.categories.forEach(category => {
                    categories.push(category.category || 'Uncategorized');
                    categoryData.push(category.product_count || 0);
                });
            } else {
                categories.push('No Data');
                categoryData.push(1);
            }
            
            window.categoryChart = new Chart(categoryCtx, {
                type: 'pie',
                data: {
                    labels: categories,
                    datasets: [{
                        data: categoryData,
                        backgroundColor: categoryColors.slice(0, categories.length),
                        borderWidth: 1,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 10,
                                boxWidth: 12,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Stock Levels Table
        if (stockLevelsTable) {
            let tableHTML = `
                <thead>
                    <tr class="text-xs font-semibold text-gray-500 bg-gray-100">
                        <th class="px-4 py-2 text-left">Product</th>
                        <th class="px-4 py-2 text-left">Category</th>
                        <th class="px-4 py-2 text-right">Price</th>
                        <th class="px-4 py-2 text-right">Stock</th>
                        <th class="px-4 py-2 text-right">Status</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            if (data.stockLevels && data.stockLevels.length > 0) {
                data.stockLevels.forEach(item => {
                    const stockStatus = item.quantity <= 5 ? 
                        '<span class="px-2 py-1 text-xs font-semibold text-red-500 bg-red-100 rounded-full">Critical</span>' : 
                        '<span class="px-2 py-1 text-xs font-semibold text-yellow-500 bg-yellow-100 rounded-full">Low</span>';
                    
                    tableHTML += `
                        <tr class="text-xs border-b border-gray-200">
                            <td class="px-4 py-2">${item.name}</td>
                            <td class="px-4 py-2">${item.category}</td>
                            <td class="px-4 py-2 text-right">${formatCurrency(item.price)}</td>
                            <td class="px-4 py-2 text-right">${item.quantity}</td>
                            <td class="px-4 py-2 text-right">${stockStatus}</td>
                        </tr>
                    `;
                });
            } else {
                tableHTML += `
                    <tr class="text-xs border-b border-gray-200">
                        <td colspan="5" class="px-4 py-2 text-center">No low stock items</td>
                    </tr>
                `;
            }
            
            tableHTML += '</tbody>';
            stockLevelsTable.innerHTML = tableHTML;
        }
        
        // Update inventory metrics
        const totalProductsElement = document.getElementById('total-products');
        const lowStockElement = document.getElementById('low-stock');
        const inventoryValueElement = document.getElementById('inventory-value');
        
        if (data.summary && data.summary.length > 0 && 
            totalProductsElement && lowStockElement && inventoryValueElement) {
            const metrics = data.summary[0];
            totalProductsElement.textContent = metrics.total_products || 0;
            lowStockElement.textContent = metrics.low_stock_items || 0;
            inventoryValueElement.textContent = formatCurrency(metrics.inventory_value || 0);
        } else {
            console.error('Inventory metrics elements not found or no metrics data available');
        }
        
        // Update inventory growth metrics
        const inStockPercentageElement = document.getElementById('in-stock-percentage');
        const outOfStockPercentageElement = document.getElementById('out-of-stock-percentage');
        
        if (data.inventoryGrowth && data.inventoryGrowth.length > 0 && 
            inStockPercentageElement && outOfStockPercentageElement) {
            const growth = data.inventoryGrowth[0];
            const inStock = growth.in_stock_products || 0;
            const outOfStock = growth.out_of_stock_products || 0;
            const total = growth.total_products || 1; // Avoid division by zero
            
            inStockPercentageElement.textContent = `${((inStock / total) * 100).toFixed(1)}%`;
            outOfStockPercentageElement.textContent = `${((outOfStock / total) * 100).toFixed(1)}%`;
        } else {
            console.error('Inventory growth elements not found or no growth data available');
        }
    });
}

// Customer Analysis Charts
function renderCustomerAnalytics() {
    console.log('Initializing Customer Analytics charts');
    
    // Check if chart elements exist
    const topCustomersElement = document.getElementById('top-customers-chart');
    const ageDistributionElement = document.getElementById('age-distribution-chart');
    const customerGrowthElement = document.getElementById('customer-growth-chart');
    
    if (!topCustomersElement) {
        console.error('Top customers chart element not found');
    }
    
    if (!ageDistributionElement) {
        console.error('Age distribution chart element not found');
    }
    
    if (!customerGrowthElement) {
        console.error('Customer growth chart element not found');
    }
    
    fetchAnalyticsData('customers').then(data => {
        if (!data) {
            console.error('No customer analytics data received');
            return;
        }
        
        // Top Customers Chart
        if (topCustomersElement) {
            const topCustomersCtx = topCustomersElement.getContext('2d');
            
            if (window.topCustomersChart) {
                window.topCustomersChart.destroy();
            }
            
            const customerNames = [];
            const customerSpending = [];
            
            if (data.topCustomers && data.topCustomers.length > 0) {
                data.topCustomers.forEach(customer => {
                    customerNames.push(customer.name);
                    customerSpending.push(customer.total_spent);
                });
            } else {
                customerNames.push('No Data');
                customerSpending.push(0);
            }
            
            window.topCustomersChart = new Chart(topCustomersCtx, {
                type: 'bar',
                data: {
                    labels: customerNames,
                    datasets: [{
                        label: 'Total Spent',
                        data: customerSpending,
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderWidth: 0,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Age Distribution Chart
        if (ageDistributionElement) {
            const ageCtx = ageDistributionElement.getContext('2d');
            
            if (window.ageChart) {
                window.ageChart.destroy();
            }
            
            const ageGroups = [];
            const ageData = [];
            const ageColors = [
                'rgba(79, 70, 229, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ];
            
            if (data.ageDistribution && data.ageDistribution.length > 0) {
                data.ageDistribution.forEach(age => {
                    ageGroups.push(age.age_group);
                    ageData.push(age.percentage);
                });
            } else {
                ageGroups.push('No Data');
                ageData.push(100);
            }
            
            window.ageChart = new Chart(ageCtx, {
                type: 'doughnut',
                data: {
                    labels: ageGroups,
                    datasets: [{
                        data: ageData,
                        backgroundColor: ageColors.slice(0, ageGroups.length),
                        borderWidth: 1,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 10,
                                boxWidth: 12,
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Customer Growth Chart
        if (customerGrowthElement) {
            const growthCtx = customerGrowthElement.getContext('2d');
            
            if (window.customerGrowthChart) {
                window.customerGrowthChart.destroy();
            }
            
            const growthMonths = [];
            const growthData = [];
            
            if (data.customerGrowth && data.customerGrowth.length > 0) {
                data.customerGrowth.forEach(item => {
                    growthMonths.push(item.month);
                    growthData.push(item.customer_count);
                });
            } else {
                // Default data if no growth data available
                const currentDate = new Date();
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(currentDate.getMonth() - i);
                    growthMonths.push(date.toLocaleString('default', { month: 'short' }));
                    growthData.push(0);
                }
            }
            
            window.customerGrowthChart = new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: growthMonths,
                    datasets: [{
                        label: 'Customer Count',
                        data: growthData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Update customer metrics
        const totalCustomersElement = document.getElementById('total-customers');
        const activeCustomersElement = document.getElementById('active-customers');
        const avgLifetimeValueElement = document.getElementById('avg-lifetime-value');
        const repeatRateElement = document.getElementById('repeat-rate');
        
        if (data.summary && data.summary.length > 0 && 
            totalCustomersElement && activeCustomersElement && 
            avgLifetimeValueElement && repeatRateElement) {
            const metrics = data.summary[0];
            totalCustomersElement.textContent = metrics.total_customers || 0;
            activeCustomersElement.textContent = metrics.active_customers || 0;
            avgLifetimeValueElement.textContent = formatCurrency(metrics.avg_lifetime_value || 0);
            repeatRateElement.textContent = `${(metrics.repeat_purchase_rate || 0).toFixed(1)}%`;
        } else {
            console.error('Customer summary elements not found or no summary data available');
        }
        
        // Customer Metrics
        const totalSpentElement = document.getElementById('total-spent');
        const avgSpentElement = document.getElementById('avg-spent');
        const totalOrdersElement = document.getElementById('total-orders');
        
        if (data.customerMetrics && data.customerMetrics.length > 0 && 
            totalSpentElement && avgSpentElement && totalOrdersElement) {
            const metrics = data.customerMetrics[0];
            totalSpentElement.textContent = formatCurrency(metrics.total_spent || 0);
            avgSpentElement.textContent = formatCurrency(metrics.avg_spent || 0);
            totalOrdersElement.textContent = metrics.total_orders || 0;
        } else {
            console.error('Customer metrics elements not found or no metrics data available');
        }
    });
}

// Helper function to fetch analytics data
function fetchAnalyticsData(type) {
    console.log(`Fetching analytics data for: ${type}`);
    return fetch(`/api/analytics/${type}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Error fetching ${type} analytics. Status: ${response.status}`);
                throw new Error(`Error fetching ${type} analytics: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Analytics data received for ${type}:`, data);
            return data;
        })
        .catch(error => {
            console.error(`Error fetching ${type} analytics:`, error);
            return null;
        });
}

// Initialize analytics on respective page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    if (document.querySelector('.dashboard-content')) {
        updateDashboard();
    }
    
    // Initialize sales analytics
    if (document.querySelector('.sales-analytics')) {
        renderSalesAnalytics();
    }
    
    // Initialize inventory analytics
    if (document.querySelector('.inventory-analytics')) {
        renderInventoryAnalytics();
    }
    
    // Initialize customer analytics
    if (document.querySelector('.customer-analytics')) {
        renderCustomerAnalytics();
    }
    
    // Initialize invoices
    if (document.querySelector('.invoices-content')) {
        fetchInvoices();
    }
    
    // Initialize inventory
    if (document.querySelector('.inventory-content')) {
        fetchInventory();
    }
    
    // Initialize sales
    if (document.querySelector('.sales-content')) {
        fetchSales();
    }
    
    // Initialize customers
    if (document.querySelector('.customers-content')) {
        fetchCustomers();
    }
    
    // Initialize employees
    if (document.querySelector('.employees-content')) {
        fetchEmployees();
    }
    
    // Menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('-translate-x-full');
        });
    }
    
    // Mobile menu close
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    if (closeMobileMenu) {
        closeMobileMenu.addEventListener('click', function() {
            document.getElementById('sidebar').classList.add('-translate-x-full');
        });
    }
});