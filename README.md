# Shop Monitoring System

A web-based shop monitoring system built with Node.js, Express, SQLite, and vanilla JavaScript.

## Setup Instructions

1. Make sure you have Node.js installed on your system.

2. Clone the repository:
   ```
   git clone https://github.com/yourusername/shop-monitoring-system.git
   cd shop-monitoring-system
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Initialize the database (only run this once to set up the database):
   ```
   npm run init-db
   ```

5. Start the server:
   ```
   npm start
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000/login.html
   ```

7. Login with the default credentials:
   - Username: admin
   - Password: password123

## Features

- Inventory management
- Sales tracking
- Customer management
- Employee management
- Billing and invoices
- Analytics dashboard

## Troubleshooting

If you encounter any issues:

1. Make sure the database is properly initialized (run `npm run init-db`)
2. Ensure the server is running (check for any errors in the console)
3. Clear your browser cache and try again