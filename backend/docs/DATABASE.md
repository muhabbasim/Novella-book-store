# Database Setup Guide

## Overview
This project uses PostgreSQL (Neon cloud database) with session-based authentication.

## Quick Start

### 1. First-time setup (Initialize database tables)
```bash
npm run init:db
```
This creates all necessary tables in your database. **Run this only once** when setting up the project for the first time.

### 2. Normal development (Start server)
```bash
npm run dev
```
The server will verify the database connection and start immediately without reinitializing tables.

### 3. Seed products (Optional)
```bash
npm run seed
```
Populate the database with sample product data.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run init:db` | Initialize database tables (first-time setup only) |
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample products |

## Database Tables

### users
- User authentication and profile information
- Fields: id, email, password_hash, name, created_at

### products
- Product catalog
- Fields: id, name, price, category, image, stock_quantity, description, created_at

### carts
- User shopping carts
- Fields: id, user_id, product_id, quantity, created_at, updated_at

### orders
- Order history
- Fields: id, user_id, total_amount, status, created_at

### order_items
- Individual items in each order
- Fields: id, order_id, product_id, quantity, price_at_purchase, created_at

### session
- Express session storage
- Fields: sid, sess, expire

## Environment Variables

Required in `.env` file:
```env
DATABASE_URL=postgresql://...    # Your Neon database connection string
PORT=5001                        # Server port
SESSION_SECRET=...               # Session encryption key
NODE_ENV=development             # Environment (development/production)
FRONTEND_URL=http://localhost:5173  # Frontend URL for CORS
```

## Force Table Reinitialization

If you need to reinitialize tables while the server is running:

```bash
# Option 1: Use the dedicated script (recommended)
npm run init:db

# Option 2: Set environment variable and restart server
INIT_DB=true npm run dev
```

## Troubleshooting

### Connection Refused Error
- Ensure your `.env` file has the correct `DATABASE_URL`
- Check that your Neon database is accessible
- Verify the connection string includes SSL mode

### Tables Already Exist
- Normal! The `CREATE TABLE IF NOT EXISTS` ensures tables aren't duplicated
- No need to drop and recreate unless you're changing the schema

### Missing Tables
- Run `npm run init:db` to create all tables
- Check database logs for any error messages
