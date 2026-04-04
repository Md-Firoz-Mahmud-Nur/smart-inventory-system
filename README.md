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

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Database Client**: Neon serverless PostgreSQL
- **Authentication**: JWT + bcryptjs password hashing
- **Validation**: Zod schema validation
- **Database Migrations**: Prisma migrations with strategic indexing

## Project Structure

```
├── app/
│   ├── api/                          # API routes
│   │   ├── auth/                     # Authentication endpoints
│   │   ├── products/                 # Product management
│   │   ├── categories/               # Category management
│   │   ├── orders/                   # Order processing
│   │   ├── restock-queue/            # Restock management
│   │   ├── activity-logs/            # Activity tracking
│   │   ├── dashboard/                # Dashboard metrics
│   │   └── init/                     # Database initialization
│   ├── auth/                         # Login and registration pages
│   ├── dashboard/                    # Protected dashboard
│   ├── products/page.tsx             # Products management page
│   ├── categories/page.tsx           # Categories management page
│   ├── orders/page.tsx               # Orders listing and management
│   ├── restock-queue/page.tsx        # Restock queue management
│   ├── page.tsx                      # Root redirect to dashboard
│   ├── layout.tsx                    # Root layout
├── lib/
│   ├── auth.ts                       # Auth utilities (JWT, bcrypt)
│   ├── db.ts                         # Prisma client instance
│   ├── middleware.ts                 # Auth middleware & utilities
│   └── utils.ts                      # Helper functions
├── prisma/
│   ├── schema.prisma                 # Database schema with 7 models
├── middleware.ts                     # Next.js middleware for route protection
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+ (or Neon account for serverless)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Md-Firoz-Mahmud-Nur/smart-inventory-system
cd smart-inventory-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. **Start development server**

```bash
npm run dev
```

**Demo credentials:**

- Email: `demo@example.com`
- Password: `123456`

### Demo Data

Seed the database with demo data:

```bash
curl http://localhost:3000/api/init/seed
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an GitHub issue or contact support.
