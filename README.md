# Smart Inventory & Order Management System

A production-ready web application to manage product inventory, process customer orders, track stock levels, and automate restock alerts with intelligent conflict prevention and real-time analytics.

## Features

### 1. Authentication

- User registration and login with secure password hashing
- JWT-based authentication with HTTP-only cookies
- Demo user login for quick testing
- User profile management

### 2. Product & Category Management

- Create, edit, and manage product categories
- Define products with pricing, stock levels, and minimum thresholds
- Track product status (Active, Out of Stock)
- Automatic category organization
- Product search and filtering

### 3. Stock Management

- Real-time inventory tracking
- Automatic stock deduction on order confirmation
- Out-of-stock prevention with validation
- Minimum stock threshold alerts
- Stock status indicators and warnings
- Inventory level visualization on dashboard

### 4. Order Processing

- Create and manage customer orders with multiple items
- Multi-item order support with individual quantity tracking
- Real-time price calculation and total order value
- Order status tracking (Pending, Confirmed, Shipped, Delivered, Cancelled)
- Order history and analytics
- Order cancellation with automatic stock restoration

### 5. Smart Stock Management

- Atomic database transactions to prevent race conditions
- Duplicate product prevention in orders
- Stock locking mechanism during order creation
- Automatic conflict detection for insufficient inventory
- Graceful error handling with clear user feedback

### 6. Restock Queue Management

- Automatic restock queue creation for low-stock items
- Priority-based ordering (High, Medium, Low)
- Dynamic priority calculation based on stock levels
- One-click queue management
- Historical restock tracking

### 7. Dashboard & Analytics

- Real-time statistics and KPIs
- Today's order count and revenue metrics
- Pending vs completed order tracking
- Low stock item alerts
- Recent orders with itemized details
- Product summary with stock status
- Visual indicators for inventory health

### 8. Activity Logging

- Complete audit trail of all actions
- Detailed activity logs with action types
- Metadata tracking for comprehensive history
- User-scoped activity tracking
- Latest activities visible on dashboard

## Tech Stack

### Frontend

- **Framework**: Next.js 16 with App Router
- **UI Framework**: React 19 with shadcn/ui components
- **Styling**: Tailwind CSS v4 with custom theming
- **State Management**: React Context + React Hooks with SWR
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React