# RBAC System — Role-Based Access Control with Admin Approval

A production-ready MERN stack application featuring JWT authentication, role-based access control, and an admin approval workflow.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Zustand + React Router
- **Backend**: Node.js + Express.js + Mongoose
- **Database**: MongoDB
- **Auth**: JWT (access token) + bcrypt

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rbac_db
JWT_SECRET=change_this_to_a_long_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Seed the default admin user:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

API will be available at `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:5173`

---

## Default Admin Credentials

| Field    | Value           |
|----------|-----------------|
| Email    | admin@rbac.dev  |
| Password | Admin@1234      |

> ⚠️ Change the admin password after first login in production!

---

## API Reference

### Auth Routes
| Method | Endpoint              | Access  | Description           |
|--------|-----------------------|---------|-----------------------|
| POST   | /api/auth/register    | Public  | Register new user     |
| POST   | /api/auth/login       | Public  | Login, receive JWT    |

### User Routes
| Method | Endpoint                  | Access       | Description              |
|--------|---------------------------|--------------|--------------------------|
| GET    | /api/users/me             | Auth         | Get own profile          |
| GET    | /api/users                | Admin only   | Get all users (paginated)|
| GET    | /api/users/pending        | Admin only   | Get pending users        |
| GET    | /api/users/stats          | Admin only   | Get platform stats       |
| PATCH  | /api/users/:id/approve    | Admin only   | Approve a user           |
| PATCH  | /api/users/:id/reject     | Admin only   | Reject a user            |

---

## Middleware Stack

```
Request
  └── helmet (security headers)
  └── cors
  └── rateLimit (100/15min global, 10/15min for auth)
  └── express.json
  └── authMiddleware    ← Verifies JWT, attaches req.user
  └── authorizeRoles()  ← Checks role (e.g., 'admin')
  └── checkApproval     ← Blocks pending/rejected users
  └── Controller
```

---

## User Flow

```
Register → status: "pending"
    ↓
Login → gets JWT (can see own profile/status)
    ↓
Admin approves → status: "approved"
    ↓
User accesses protected routes ✓

OR

Admin rejects → status: "rejected"
    ↓
User blocked from all protected data ✗
```

---

## Folder Structure

```
rbac-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js          ← authMiddleware, authorizeRoles, checkApproval
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── models/User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── scripts/seed.js
│   ├── server.js
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/index.jsx         ← Button, Badge, Card, Input, Avatar...
    │   │   ├── layout/              ← Navbar, Sidebar, DashboardLayout
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── AdminOverview.jsx
    │   │   ├── PendingApprovals.jsx
    │   │   └── AllUsers.jsx
    │   ├── services/api.js          ← Axios + JWT interceptor
    │   ├── store/authStore.js       ← Zustand auth state
    │   ├── utils/helpers.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Security Features

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT with expiry
- ✅ Server-side role + approval enforcement (never frontend-only)
- ✅ Helmet security headers
- ✅ Rate limiting on all routes (strict on auth)
- ✅ Input validation with express-validator
- ✅ CORS configured to specific origin
- ✅ Request body size limits (10kb)
- ✅ Mongoose indexes for performance
- ✅ Global error handler (no stack traces in production)
