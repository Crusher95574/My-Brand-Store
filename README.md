# 🛍️ My Brand Store — Full Stack E-Commerce Application

A production-ready, full-stack e-commerce web application built with React, Node.js/Express, and MongoDB, featuring AI-powered shopping assistance via Gemini.

---

## 📁 Project Architecture

```
mybrandstore/
├── package.json                  ← Root: run both servers concurrently
│
├── backend/                      ← Node.js + Express REST API
│   ├── .env                      ← Environment variables (never commit!)
│   ├── server.js                 ← Entry point: middleware + route mounting
│   ├── package.json
│   │
│   ├── config/
│   │   └── db.js                 ← MongoDB connection via Mongoose
│   │
│   ├── models/                   ← Mongoose Schemas (shape of DB documents)
│   │   ├── Product.js            ← Product schema with reviews sub-doc
│   │   ├── User.js               ← User schema with JWT + bcrypt + admin role
│   │   └── Order.js              ← Order schema with status tracking
│   │
│   ├── controllers/              ← Business logic (what each route does)
│   │   ├── productController.js  ← CRUD + filtering + reviews (admin & user)
│   │   ├── userController.js     ← Register, login, profile, wishlist, admin list
│   │   ├── orderController.js    ← Place order, history, status update (admin)
│   │   └── aiController.js       ← Gemini API proxy + recommendations
│   │
│   ├── routes/                   ← Express routers (URL → controller)
│   │   ├── productRoutes.js      ← Public GET + Admin POST/PUT/DELETE
│   │   ├── userRoutes.js         ← Auth + profile + admin gets all users
│   │   ├── orderRoutes.js        ← User orders + admin order management
│   │   ├── cartRoutes.js         ← Cart operations
│   │   └── aiRoutes.js           ← AI chat & recommendations
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     ← JWT verify + attach user to req
│   │   ├── roleMiddleware.js     ← Admin role checker (optional/custom)
│   │   └── errorMiddleware.js    ← Global error handler
│   │
│   └── utils/
│       └── seeder.js             ← Seed DB with sample products + admin user
│
└── frontend/                     ← React SPA (Dual Mode: Store + Admin)
    ├── package.json
    ├── admin.css                 ← Admin panel styling
    └── src/
        ├── App.js                ← Router: store routes + admin routes
        ├── index.css             ← Global + store styles
        ├── admin.css             ← Admin-specific styles
        │
        ├── services/
        │   └── api.js            ← Axios instance + product/order/user/admin APIs
        │
        ├── context/
        │   ├── CartContext.js    ← Global cart state (store only)
        │   └── AuthContext.js    ← JWT + user info (used in admin for role check)
        │
        ├── hooks/
        │   └── useProducts.js    ← Product fetching hook (store only)
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.js     ← Store navbar (hidden in admin)
        │   │   └── Footer.js     ← Store footer (hidden in admin)
        │   └── common/
        │       ├── ProductCard.js  ← Reusable product card (store)
        │       ├── AiAdvisor.js    ← Floating AI chat (store only)
        │       └── PrivateRoute.js ← Auth guard for protected routes
        │
        ├── pages/                  ← STORE PAGES
        │   ├── HomePage.js         ← Hero + featured products
        │   ├── ProductListPage.js  ← Filter, search, sort, paginate
        │   ├── ProductDetailPage.js← Full detail + reviews + AI recs
        │   ├── CartPage.js         ← Cart management
        │   ├── CheckoutPage.js     ← Shipping form + payment
        │   ├── OrderConfirmPage.js ← Order confirmation
        │   ├── OrderHistoryPage.js ← User's past orders
        │   ├── LoginPage.js        ← Auth for customers & admins
        │   ├── RegisterPage.js     ← Register customers only
        │   ├── NotFoundPage.js     ← 404 fallback
        │   │
        │   └── admin/              ← ADMIN PAGES (role-protected)
        │       ├── AdminLayout.js     ← Main wrapper: role guard, sidebar
        │       ├── AdminDashboard.js  ← KPIs, revenue sparkline, charts
        │       ├── AdminProducts.js   ← CRUD products, search, filter
        │       ├── AdminOrders.js     ← Manage orders, status updates
        │       ├── AdminCustomers.js  ← User list, search, role filter
        │       └── AdminAnalytics.js  ← Revenue trends, top products
        │
        └── utils/ (optional)
            └── (utility functions for store)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Install all dependencies (root + backend + frontend)
npm run install:all
```

### 2. Configure Environment

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/mybrandstore
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here     # optional
```

### 3. Seed the Database

```bash
cd backend && npm run seed
# Creates 12 products + admin user (admin@mybrandstore.com / admin123456)
```

### 4. Start Development Servers

```bash
# From root directory — starts both backend (port 5000) and frontend (port 3000)
npm run dev
```

**Access the Application:**

- **🛍️ Store:** http://localhost:3000
- **👑 Admin Panel:** http://localhost:3000/admin (login with admin credentials above)

**Test Accounts:**
| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@mybrandstore.com | admin123456 | Admin |
| Customer | customer@example.com | password123 | Customer |

---

## 👑 Admin-Only Access

After logging in as admin, you can access the admin panel at `/admin`. Here's what admins can do:

### Admin Capabilities

| Feature       | What Admins Can Do                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard** | View real-time KPIs: total revenue, pending orders, delivered orders, product count                                                                                          |
| **Products**  | ✅ Create new products ✏️ Edit existing products 🗑️ Delete/hide products 🔍 Search & filter by category 📊 View stock levels                                                 |
| **Orders**    | 📋 View all customer orders 🔍 Search by order ID/customer name 🏷️ Filter by status (pending/processing/shipped/delivered) ✏️ Update order status 💰 Track revenue per order |
| **Customers** | 👥 View all registered users 🔍 Search by name/email 👨‍💼 Filter by role (admin/customer) 📊 View active/inactive status                                                       |
| **Analytics** | 📈 Monthly revenue trends (last 6 months) 🍩 Order status distribution 📊 Category sales breakdown 🏆 Top selling products                                                   |

### Store Features NOT Available to Admin in Admin Panel

- Shopping cart
- Product browsing (use API/backend for data)
- AI advisor
- Customer order history (view via Customers section instead)

**Note:** Admins can still browse the store as regular customers if they navigate to `/` instead of `/admin`.

---

## 🌐 API Reference

### Base URL: `http://localhost:4000/api/v1`

#### Products

| Method | Endpoint                                                                                             | Description                    | Auth   |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------ | ------ |
| GET    | `/products`                                                                                          | List all products (filterable) | Public |
| GET    | `/products?search=watch&category=Accessories&minPrice=100&maxPrice=500&sort=-rating&page=1&limit=12` | Advanced filtering             | Public |
| GET    | `/products?featured=true`                                                                            | Featured products only         | Public |
| GET    | `/products/categories`                                                                               | Category counts                | Public |
| GET    | `/products/:id`                                                                                      | Single product with reviews    | Public |
| POST   | `/products`                                                                                          | Create product                 | Admin  |
| PUT    | `/products/:id`                                                                                      | Update product                 | Admin  |
| DELETE | `/products/:id`                                                                                      | Soft-delete product            | Admin  |
| POST   | `/products/:id/reviews`                                                                              | Add review                     | User   |

#### Authentication

| Method | Endpoint              | Description                       | Auth   |
| ------ | --------------------- | --------------------------------- | ------ |
| POST   | `/users/register`     | `{ name, email, password }` → JWT | Public |
| POST   | `/users/login`        | `{ email, password }` → JWT       | Public |
| GET    | `/users/profile`      | Get own profile                   | 🔒     |
| PUT    | `/users/profile`      | Update profile                    | 🔒     |
| POST   | `/users/wishlist/:id` | Toggle wishlist                   | 🔒     |
| GET    | `/users`              | Get all users (admin list)        | Admin  |

#### Orders

| Method | Endpoint          | Description            | Auth  |
| ------ | ----------------- | ---------------------- | ----- |
| POST   | `/orders`         | Place new order        | 🔒    |
| GET    | `/orders`         | Get all orders (admin) | Admin |
| GET    | `/orders/my`      | User's order history   | 🔒    |
| GET    | `/orders/:id`     | Order details          | 🔒    |
| PUT    | `/orders/:id/pay` | Mark as paid           | 🔒    |
| PUT    | `/orders/:id`     | Update order status    | Admin |

#### AI

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ | ------ |
| POST   | `/ai/chat`                | `{ messages, cartItems }` → AI reply | Public |
| GET    | `/ai/recommendations/:id` | AI product recommendations           | Public |

---

## 👑 Admin Panel

### Overview

The admin panel provides comprehensive management tools for e-commerce operations. Only users with `role: "admin"` can access the panel. Access is protected by `AdminLayout` which verifies user role before rendering.

**Default Admin Credentials (after seeding):**

```
Email: admin@mybrandstore.com
Password: admin123456
```

### Admin Module Architecture

```
frontend/src/pages/admin/
├── AdminLayout.js              ← Main wrapper: role guard, sidebar, topbar
├── AdminDashboard.js           ← KPIs, charts, revenue sparkline
├── AdminProducts.js            ← CRUD products, search, filter by category
├── AdminOrders.js              ← Order management, status updates
├── AdminCustomers.js           ← Customer list, role filter, activity
└── AdminAnalytics.js           ← Revenue charts, top products, donut charts
```

### Admin Routing Structure

```javascript
// App.js
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} /> // /admin
  <Route path="products" element={<AdminProducts />} /> // /admin/products
  <Route path="orders" element={<AdminOrders />} /> // /admin/orders
  <Route path="customers" element={<AdminCustomers />} /> // /admin/customers
  <Route path="analytics" element={<AdminAnalytics />} /> // /admin/analytics
</Route>
```

### Access Control Flow

```
User navigates to /admin
    ↓
AdminLayout mounts and checks AuthContext
    ↓
if (!user || user.role !== "admin"):
  → Show "Access Denied" component
  → Display: 🔒 message + redirect to home button
    ↓
else:
  → Render full admin panel (sidebar + outlet)
  → Display sidebar nav + topbar + rendered page
```

### Sidebar Navigation

- **Dashboard** (▦) — Sales KPIs, order trends, revenue sparkline
- **Products** (📦) — Product CRUD, inventory management
- **Orders** (🧾) — Order fulfillment, status tracking
- **Customers** (👥) — User directory, role filter
- **Analytics** (📊) — Revenue trends, category distribution

---

## 📊 Admin Features & Data Flows

### 1. Dashboard (`/admin`)

**Purpose:** Real-time sales overview with key metrics and charts

**Key Metrics (KPIs):**

- Total Revenue — Sum of `isPaid` orders' totalPrice
- Pending Orders — Count of `status === "pending"` orders
- Delivered Orders — Count of `status === "delivered"` orders
- Total Orders — Total order count
- Total Products — Product catalog size

**Charts:**

- **Sparkline** — Revenue trend (last 7 days)
- **Order Status Overview** — Recent orders table (last 8 orders)
- **Top Products** — Best-rated products (last 6 products)

**Dashboard Data Flow:**

```
Dashboard mounts
    ↓
useEffect: Promise.all([
  api.get("/orders"),
  api.get("/products?limit=50&sort=-rating")
])
    ↓
Process order data:
  → Calculate total revenue (isPaid orders)
  → Count pending orders
  → Count delivered orders
  → Generate 7-day revenue array
    ↓
setStats(): render KPI cards with color-coded values
    ↓
Canvas Sparkline: draws area chart with revenue data
    ↓
Render order table + top products list
```

---

### 2. Products Management (`/admin/products`)

**Purpose:** Full product lifecycle management

**Features:**

- ✅ **Add Product** — Create new products with form modal
- 🔍 **Search** — Real-time search by product name
- 🏷️ **Category Filter** — Filter by Clothing, Accessories, Jewelry, etc.
- ⭐ **Sort** — Latest first, pagination (12 per page)
- ✏️ **Edit Product** — Update any field via modal form
- 🗑️ **Delete Product** — Soft-delete (sets `isActive: false`)

**Form Fields:**

```javascript
{
  name: "Product Name",
  description: "Detailed description",
  price: 99.99,
  originalPrice: 149.99,           // For sale pricing
  category: "Clothing",
  badge: "New|Bestseller|Sale|Limited|Top Rated",
  emoji: "👕",                     // Product emoji icon
  countInStock: 25,
  isFeatured: true,
  isActive: true,
  tags: "comma, separated, tags",
  colors: "Black, White, Blue"
}
```

**Products CRUD Flow:**

```
Admin clicks "+ Add Product" OR clicks edit icon
    ↓
openCreate() or openEdit(product):
  → setEditMode(true/false)
  → populate form with existing data or empty form
  → setShowModal(true)
    ↓
User fills form
    ↓
User clicks "Save"
    ↓
validations() → check required fields
    ↓
if (editMode):
  → api.put(`/products/${editId}`, form)
  → Backend: update MongoDB document
else:
  → api.post("/products", form)
  → Backend: create new MongoDB document
    ↓
Backend returns updated product
    ↓
setShowModal(false)
    ↓
toast.success("Product saved!")
    ↓
fetchProducts() — refresh products list
    ↓
Table re-renders with new/updated product
```

**Stock Status Indicators:**

- 🟢 **OK** — 6+ items in stock
- 🟠 **LOW** — 1–5 items (warnings shown)
- 🔴 **OUT** — 0 items (cannot purchase)

**Product Row Display:**
| Field | Shows |
|-------|-------|
| Product | Emoji + name + SKU |
| Category | Color-coded pill |
| Price | Current price + ~~strikethrough~~ original |
| Stock | Color-coded indicator |
| Rating | ⭐ stars + review count |
| Badge | Sale tag if applicable |
| Status | Active/Hidden pill |
| Actions | Edit/Delete buttons |

---

### 3. Order Management (`/admin/orders`)

**Purpose:** Track order fulfillment and update customer status

**Features:**

- 📋 **Order List** — All orders with real-time filtering
- 🔍 **Search** — By order ID, customer name, or email
- 🏷️ **Status Filter** — pending, processing, shipped, delivered, cancelled
- 💰 **Revenue Dashboard** — Total paid revenue display
- 📊 **Status Summary Pills** — Click to filter by status
- ✏️ **Update Order Status** — Change via dropdown

**Order Status Colors:**

```
pending    → 🟡 Yellow  (#fff3cd)
processing → 🔵 Blue    (#cce5ff)
shipped    → 🟢 Green   (#d4edda)
delivered  → 🔷 Cyan    (#d1ecf1)
cancelled  → 🔴 Red     (#f8d7da)
```

**Order Management Flow:**

```
Admin opens Order Management page
    ↓
fetchOrders():
  → api.get("/orders")
  → Get all orders from backend
    ↓
orders display in table with:
  • Order ID (MBS-XXXXX)
  • Customer name
  • Order date
  • Total amount
  • Payment status (Paid/Unpaid)
  • Current status (pending/processing/shipped/delivered)
    ↓
Admin searches or filters by status
    ↓
filtered = orders.filter(status & search)
    ↓
Filtered results display instantly
    ↓
Admin clicks order row → expands details:
  • Items list (product name, quantity, price)
  • Shipping address
  • Payment method
  • Tracking number (if shipped)
    ↓
Admin selects new status from dropdown
    ↓
updateStatus(orderId, newStatus):
  → setUpdating(orderId) - show loading state
  → api.put(`/orders/${orderId}`, { status: newStatus })
  → Backend: update Order.status in MongoDB
    ↓
Backend returns updated order
    ↓
setOrders(orders.map(o => o._id === orderId ? updated : o))
    ↓
toast.success(`Status updated to ${newStatus}`)
    ↓
Table re-renders with new status (color changes)
    ↓
Revenue total recalculates automatically
```

**Summary Metrics:**

- **Total Revenue** — Calculated from `isPaid` orders only
- **Status Breakdown** — Count per status (clickable to filter)

---

### 4. Customer Management (`/admin/customers`)

**Purpose:** View and manage user accounts

**Features:**

- 👥 **Customer List** — All registered users
- 🔍 **Search** — By name or email
- 👨‍💼 **Role Filter** — admin / customer
- 📊 **Quick Stats** — Total, Active, Admin count

**Customer Data Flow:**

```
Customer Management page loads
    ↓
useEffect → api.get("/users")
    ↓
Get all users from backend
    ↓
setCustomers(data.data)
    ↓
Display summary KPIs:
  • Total Customers: count all
  • Active: count where isActive === true
  • Admins: count where role === "admin"
  • Inactive: total - active
    ↓
User searches or filters
    ↓
filtered = customers.filter(role & search):
  → matchRole: roleFilter === "all" || c.role === roleFilter
  → matchSearch: name or email includes searchTerm
    ↓
Table displays:
  • Avatar (user initial)
  • Name
  • Email
  • Role (admin/customer)
  • Status (Active/Inactive)
  • Join date
  • Last login (if tracked)
    ↓
Admin can click row for additional details (if expanded)
```

**Customer Fields Shown:**
| Field | Description |
|-------|-------------|
| Avatar | First letter of name |
| Name | User's display name |
| Email | Contact email |
| Role | admin or customer |
| Status | Active or Inactive |
| Created | Account creation date |

---

### 5. Analytics (`/admin/analytics`)

**Purpose:** Business intelligence with revenue trends and product performance

**Features:**

- 📈 **Revenue Trends** — Monthly revenue chart (last 6 months)
- 🍩 **Order Status Distribution** — Donut chart
- 📊 **Category Breakdown** — Sales distribution by category
- 🏆 **Top Selling Products** — Best performers by revenue

**Charts Included:**

1. **Monthly Revenue Line Chart** — Track growth over time
2. **Order Status Donut Chart** — Visual breakdown of pending/shipped/delivered
3. **Category Distribution Donut** — Which categories sell most
4. **Top Products Table** — Product name, sales count, revenue

**Analytics Data Flow:**

```
Analytics page mounts
    ↓
useEffect: Promise.all([
  api.get("/orders"),
  api.get("/products?limit=50")
])
    ↓
Process order data:
  → Filter payments (isPaid orders)
  → Extract month/year: new Date(paidAt).toLocaleDateString()
  → Group by month: monthlyRevenue[key] += order.totalPrice
  → Last 6 months: filter and sort
    ↓
Process product data:
  → Group by category: categoryCount[category]++
  → Sort by revenue
  → Calculate total revenue per product
    ↓
Generate chart data:
  • monthlyRevenue array: [Jan: 5000, Feb: 7200, ...]
  • categoryData array: [{category: "Clothing", value: 45}, ...]
  • statusData array: [{status: "delivered", value: 120}, ...]
    ↓
Render charts:
  • LineChart draws monthly revenue curve
  • DonutChart renders category distribution
  • DonutChart renders status breakdown
  • TopProducts table sorted by revenue DESC
    ↓
Charts update in real-time if orders/products change
```

**Custom Chart Components:**

- **DonutChart** — SVG-based, color-coded slices, displays percentages
- **Sparkline** — Canvas-based line chart (also used in Dashboard)
- **BarChart** (if implemented) — For category/monthly comparisons

---

## 🔐 Admin-Specific Security

| Feature           | Implementation                                                           |
| ----------------- | ------------------------------------------------------------------------ |
| Role-based access | `AdminLayout` checks `user.role === "admin"` before rendering            |
| Protected routes  | `/admin/*` routes require authentication + admin role                    |
| Soft deletes      | Products marked `isActive: false` (prevents orphaned order refs)         |
| Audit logging     | Future enhancement: track admin actions (created, updated by, timestamp) |
| Admin removal     | Cannot delete admin user via UI (backend validation required)            |

---

## 🏗️ How It Works — Data Flow

### Authentication Flow (Store & Admin)

```
User fills login form
    ↓
POST /api/v1/users/login
    ↓
Backend: find user → verify bcrypt password → sign JWT
    ↓
Frontend: store JWT in localStorage → update AuthContext (includes role: "customer" or "admin")
    ↓
If role === "admin" → can access /admin routes; else locked out
    ↓
All future API calls: axios interceptor adds "Authorization: Bearer <token>"
    ↓
Protected routes: authMiddleware.js verifies JWT → attaches req.user
```

### Store: Add to Cart Flow

```
Customer clicks "Add to Cart"
    ↓
CartContext.addToCart() dispatches ADD_ITEM action
    ↓
cartReducer processes: checks existing item, updates quantity
    ↓
useEffect: saves updated cart to localStorage
    ↓
Cart badge re-renders via React context subscription
```

### Store: Place Order Flow

```
Customer submits checkout form
    ↓
CheckoutPage: validates form, calls orderAPI.create()
    ↓
POST /api/v1/orders (JWT required)
    ↓
orderController: verifies stock from DB, calculates server-side price
    ↓
Deducts stock from Product.countInStock
    ↓
Creates Order document with generated orderId (MBS-XXXXX)
    ↓
Frontend: clearCart() → navigate to /order-confirmation/:id
```

### Admin: Product CRUD Flow

```
Admin navigates to /admin/products
    ↓
AdminLayout checks: user.role === "admin" → allows access
    ↓
AdminProducts loads: api.get("/products", {params: {page, search, category}})
    ↓
Admin clicks "+ Add Product" → opens modal with empty form
    ↓
Admin fills form + clicks Save
    ↓
if (editMode):
  → api.put(`/products/${id}`, formData) [UPDATE]
else:
  → api.post("/products", formData) [CREATE]
    ↓
Backend: validate, create/update in MongoDB
    ↓
Frontend: toast.success() + refresh product list
    ↓
Table re-renders with new/updated product
```

### Admin: Order Status Update Flow

```
Admin navigates to /admin/orders
    ↓
AdminLayout checks: user.role === "admin" → allows access
    ↓
AdminOrders loads: api.get("/orders")
    ↓
Admin searches/filters by status or customer
    ↓
Admin clicks order row → view details + items
    ↓
Admin selects new status from dropdown (pending → processing → shipped → delivered)
    ↓
updateStatus(orderId, newStatus):
  → api.put(`/orders/${orderId}`, {status: newStatus})
    ↓
Backend: find order, update Order.status + Order.updatedAt
    ↓
Frontend: toast.success() + re-render order with new status color
    ↓
Revenue total recalculates automatically
```

### Admin: Dashboard Overview Flow

```
Admin navigates to /admin
    ↓
AdminLayout checks: user.role === "admin" → allows access
    ↓
AdminDashboard loads: Promise.all([api.get("/orders"), api.get("/products")])
    ↓
Process all orders:
  → Calculate total revenue (sum of isPaid orders)
  → Count pending, delivered, cancelled
  → Generate last 7 days revenue array
    ↓
Render KPI cards with color-coded metrics
    ↓
Display sparkline chart (7-day revenue trend)
    ↓
Display recent orders table (last 8)
    ↓
Display top products by rating (last 6)
    ↓
Charts update in real-time if data changes
```

### Store: AI Chat Flow

```
Customer types message in AiAdvisor
    ↓
AiAdvisor.js: calls aiAPI.chat(messages, cartItems)
    ↓
POST /api/v1/ai/chat
    ↓
aiController: fetches live product catalog from MongoDB
    ↓
Builds system prompt with products + customer's cart context
    ↓
Calls Gemini API (API key stays on server — never exposed to client!)
    ↓
Returns AI reply to frontend (product recommendations, styling advice, etc.)
```

---

## 🔐 Security Features

| Feature             | Implementation                                                      |
| ------------------- | ------------------------------------------------------------------- |
| Password hashing    | bcryptjs with salt rounds: 12                                       |
| JWT authentication  | 30-day expiry, verified on every protected route                    |
| Role-based access   | Admin routes check `user.role === "admin"` in AdminLayout + backend |
| Rate limiting       | 100 requests/15min per IP                                           |
| Security headers    | Helmet.js (XSS, clickjacking, etc.)                                 |
| CORS                | Configured to frontend URL only                                     |
| Server-side pricing | Order prices always fetched from DB, never trusted from client      |
| Soft deletes        | Products set `isActive: false` to preserve order history            |
| AI key protection   | Gemini API key only used server-side, never in frontend             |
| Admin route guards  | `PrivateRoute` + `AdminLayout` double-check role before rendering   |

---

## 🎨 Frontend Architecture

### Store (Customer-Facing)

- **State:** CartContext, AuthContext
- **Pages:** Home, Products, Cart, Checkout, Orders, Auth
- **Components:** Product cards, navbar, footer, AI advisor
- **Features:** Product browsing, cart management, order history, AI recommendations

### Admin Panel (Role-Protected)

- **State:** AuthContext (for role verification)
- **Pages:** Dashboard, Products CRUD, Orders management, Customers, Analytics
- **Components:** Sidebar navigation, KPI cards, data tables, charts
- **Features:** Inventory management, order fulfillment, customer management, analytics

### State Management

- **CartContext** — useReducer pattern, localStorage persistence (store only)
- **AuthContext** — JWT state, user role, auto-hydrate from localStorage (used in both store & admin)
- **URL-driven filters** — Product list reads/writes to URL search params (shareable links)

### Axios Interceptors (`services/api.js`)

```javascript
// Request: auto-attach JWT (works for both store users & admins)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: auto-handle 401 (token expired for both roles)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

---

## 🗄️ Database Schema

### Product

```javascript
{
  name, description, price, originalPrice,
  category: enum["Clothing","Accessories","Jewelry","Bags","Beauty","Footwear"],
  emoji, images: [{url, alt, isPrimary}],
  colors: [{name, hex}], sizes: [String], tags: [String],
  badge: enum["New","Bestseller","Sale","Limited","Top Rated",null],
  countInStock, sku (auto-generated),
  reviews: [{ user, name, rating, comment }],
  rating, numReviews,         // recalculated on review save
  isFeatured, isActive,       // soft-delete via isActive
  weight, dimensions,
  createdAt, updatedAt        // auto via timestamps: true
}
```

### User

```javascript
{
  name, email (unique), password (hashed, select: false),
  role: enum["customer","admin"],    // Determines access: store-only vs admin panel
  avatar, phone,
  addresses: [{label, street, city, state, zip, country, isDefault}],
  wishlist: [ObjectId → Product],
  isActive, lastLogin,
  createdAt, updatedAt
}
```

**Role Details:**

- **"customer"** — Can browse store, add to cart, place orders, view own order history
- **"admin"** — Full access to `/admin/*` routes + all admin operations (CRUD products, manage orders, view analytics)

**Admin Management:**

- Default admin seeded: `admin@mybrandstore.com / admin123456`
- Only backend can assign admin role (no UI to promote users to admin)
- Admin can view all customers via `/admin/customers`
- Admin cannot delete admin users via UI (prevents lockout)

### Order

```javascript
{
  orderId (auto: "MBS-XXXXX"),
  user: ObjectId → User,
  orderItems: [{ product, name, emoji, price, quantity, color, size }],
  shippingAddress: { firstName, lastName, email, phone, street, city, state, zip, country },
  paymentMethod: enum["stripe","cod","upi"],
  paymentResult: { id, status, updateTime, emailAddress },
  isPaid, paidAt,
  itemsPrice, shippingPrice, taxPrice, totalPrice,
  status: enum["pending","processing","shipped","delivered","cancelled"],
  isDelivered, deliveredAt, trackingNumber,
  createdAt, updatedAt
}
```

---

## 📦 Tech Stack Summary

| Layer       | Technology                 | Purpose                                    |
| ----------- | -------------------------- | ------------------------------------------ |
| Frontend    | React 18                   | UI for store + admin panel                 |
| Routing     | React Router v6            | SPA navigation (store + admin routes)      |
| HTTP Client | Axios                      | API calls with JWT interceptors            |
| State       | Context + useReducer       | Cart & Auth (works for both store & admin) |
| Admin UI    | Custom CSS + SVG charts    | Dashboard, forms, tables, charts           |
| Backend     | Node.js + Express          | REST API (store + admin endpoints)         |
| Database    | MongoDB + Mongoose         | Document storage + ODM                     |
| Auth        | JWT + bcryptjs             | Stateless authentication + role-based      |
| AI          | Gemini API                 | Style advisor + product recommendations    |
| Security    | Helmet + CORS + Rate Limit | Production hardening + role validation     |
| Styling     | Custom CSS + Google Fonts  | Luxury design system (store + admin)       |
| Charts      | Canvas + SVG               | Sparkline, donut charts, analytics         |

---

## 🔮 Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Use MongoDB Atlas for cloud database
- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Add real Stripe keys for payment processing (if using Stripe)
- [ ] Create production admin account (update from seeded credentials)
- [ ] Run `npm run build` in frontend and serve static files
- [ ] Set up HTTPS / SSL certificate
- [ ] Configure proper CORS origin (production frontend URL)
- [ ] Set up environment variables in hosting platform (Render, Railway, Vercel)
- [ ] Store Gemini API key securely in backend environment
- [ ] Enable rate limiting on production backend
- [ ] Implement admin action logging/audit trail (optional)
- [ ] Test admin panel thoroughly before launching
- [ ] Set up backup strategy for MongoDB data
- [ ] Monitor admin user activities and unusual orders

---
