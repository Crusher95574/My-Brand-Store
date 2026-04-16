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
│   │   ├── User.js               ← User schema with JWT + bcrypt methods
│   │   └── Order.js              ← Order schema with status tracking
│   │
│   ├── controllers/              ← Business logic (what each route does)
│   │   ├── productController.js  ← CRUD + filtering + reviews
│   │   ├── userController.js     ← Register, login, profile, wishlist
│   │   ├── orderController.js    ← Place order, history, payment update
│   │   └── aiController.js       ← Anthropic API proxy + recommendations
│   │
│   ├── routes/                   ← Express routers (URL → controller)
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   └── aiRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     ← JWT protect + role authorize
│   │   └── errorMiddleware.js    ← Global error handler
│   │
│   └── utils/
│       └── seeder.js             ← Seed DB with sample products + admin
│
└── frontend/                     ← React SPA
    ├── package.json
    └── src/
        ├── App.js                ← Router + Context providers + layout
        ├── index.css             ← Global styles + design system
        │
        ├── services/
        │   └── api.js            ← Axios instance + all API call functions
        │
        ├── context/
        │   ├── CartContext.js    ← Global cart state (useReducer + localStorage)
        │   └── AuthContext.js    ← Auth state (JWT + user info)
        │
        ├── hooks/
        │   └── useProducts.js    ← Custom hook for product fetching
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.js     ← Sticky nav with search + cart badge
        │   │   └── Footer.js
        │   └── common/
        │       ├── ProductCard.js  ← Reusable product card
        │       ├── AiAdvisor.js    ← Floating AI chat widget
        │       └── PrivateRoute.js ← Auth guard for protected routes
        │
        └── pages/
            ├── HomePage.js         ← Hero + featured products + categories
            ├── ProductListPage.js  ← Filter, search, sort, paginate
            ├── ProductDetailPage.js← Full detail + reviews + AI recs
            ├── CartPage.js         ← Cart management
            ├── CheckoutPage.js     ← Shipping form + order summary
            ├── OrderConfirmPage.js ← Post-order confirmation
            ├── OrderHistoryPage.js ← User's past orders
            ├── LoginPage.js
            ├── RegisterPage.js
            └── NotFoundPage.js
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

Open: **http://localhost:3000**

---

## 🌐 API Reference

### Base URL: `http://localhost:4000/api/v1`

#### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List all products (filterable) | Public |
| GET | `/products?search=watch&category=Accessories&minPrice=100&maxPrice=500&sort=-rating&page=1&limit=12` | Advanced filtering | Public |
| GET | `/products?featured=true` | Featured products only | Public |
| GET | `/products/categories` | Category counts | Public |
| GET | `/products/:id` | Single product with reviews | Public |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Soft-delete product | Admin |
| POST | `/products/:id/reviews` | Add review | User |

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | `{ name, email, password }` → JWT |
| POST | `/users/login` | `{ email, password }` → JWT |
| GET | `/users/profile` | Get own profile | 🔒 |
| PUT | `/users/profile` | Update profile | 🔒 |
| POST | `/users/wishlist/:id` | Toggle wishlist | 🔒 |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Place new order | 🔒 |
| GET | `/orders/my` | User's order history | 🔒 |
| GET | `/orders/:id` | Order details | 🔒 |
| PUT | `/orders/:id/pay` | Mark as paid | 🔒 |

#### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | `{ messages, cartItems }` → AI reply | Public |
| GET | `/ai/recommendations/:id` | AI product recommendations | Public |

---

## 🏗️ How It Works — Data Flow

### Authentication Flow
```
User fills login form
    ↓
POST /api/v1/users/login
    ↓
Backend: find user → verify bcrypt password → sign JWT
    ↓
Frontend: store JWT in localStorage → update AuthContext
    ↓
All future API calls: axios interceptor adds "Authorization: Bearer <token>"
    ↓
Protected routes: authMiddleware.js verifies JWT → attaches req.user
```

### Add to Cart Flow
```
User clicks "Add to Cart"
    ↓
CartContext.addToCart() dispatches ADD_ITEM action
    ↓
cartReducer processes: checks existing item, updates quantity
    ↓
useEffect: saves updated cart to localStorage
    ↓
Cart badge re-renders via React context subscription
```

### Place Order Flow
```
User submits checkout form
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

### AI Chat Flow
```
User types message
    ↓
AiAdvisor.js: calls aiAPI.chat(messages, cartItems)
    ↓
POST /api/v1/ai/chat
    ↓
aiController: fetches live product catalog from MongoDB
    ↓
Builds system prompt with products + cart context
    ↓
Calls Gemini API (API key stays on server — never exposed to client!)
    ↓
Returns AI reply to frontend
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs with salt rounds: 12 |
| JWT authentication | 30-day expiry, verified on every protected route |
| Rate limiting | 100 requests/15min per IP |
| Security headers | Helmet.js (XSS, clickjacking, etc.) |
| CORS | Configured to frontend URL only |
| Server-side pricing | Order prices always fetched from DB, never trusted from client |
| Soft deletes | Products set `isActive: false` to preserve order history |
| AI key protection | Anthropic API key only used server-side, never in frontend |

---

## 🎨 Frontend Features

### State Management
- **CartContext** — useReducer pattern, localStorage persistence
- **AuthContext** — JWT state, auto-hydrate from localStorage
- **URL-driven filters** — Product list reads/writes to URL search params (shareable links)

### Axios Interceptors (`services/api.js`)
```javascript
// Request: auto-attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: auto-handle 401 (token expired)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
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
  role: enum["customer","admin"],
  avatar, phone,
  addresses: [{label, street, city, state, zip, country, isDefault}],
  wishlist: [ObjectId → Product],
  isActive, lastLogin,
  createdAt, updatedAt
}
```

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

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI, routing, state |
| Routing | React Router v6 | SPA navigation |
| HTTP Client | Axios | API calls with interceptors |
| State | Context + useReducer | Cart & Auth global state |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Document storage + ODM |
| Auth | JWT + bcryptjs | Stateless authentication |
| AI |  Gemini API | Style advisor + recommendations |
| Security | Helmet + CORS + Rate Limit | Production hardening |
| Styling | Custom CSS + Google Fonts | Luxury design system |

---

## 🔮 Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Use MongoDB Atlas for cloud database
- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Add real Stripe keys for payment processing
- [ ] Run `npm run build` in frontend and serve static files
- [ ] Set up HTTPS / SSL certificate
- [ ] Configure proper CORS origin
- [ ] Set up environment variables in hosting platform (Render, Railway, Vercel)

---
