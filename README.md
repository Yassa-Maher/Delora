# Delora Hypermarket — E-Commerce Platform

Full-stack grocery/hypermarket e-commerce built with **React + Vite + Tailwind** (frontend) and **Express + MySQL** (backend).

---

## Features

### Customer
- Browse products by category, search, sort
- Product detail with reviews, offers, weight-based quantities
- Shopping cart (supports decimal quantities for kg/liter items)
- Checkout with coupon codes, cash-on-delivery, or e-wallet (bank transfer proof)
- Order tracking with status notifications
- Favorites / wishlist
- Address management
- Profile with photo upload
- Arabic/English bilingual UI

### Admin
- Dashboard with stats (revenue, best-sellers, monthly sales, category sales)
- Product CRUD with stock management, offer fields, and image upload
- Category management
- Order management with status updates and wallet payment review
- Banner management with product/category linking
- Branch management
- Coupon management
- Contact messages with reply system (sends email)
- SEO management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router 6, Axios |
| Backend | Express 5, MySQL2, JWT, bcrypt |
| Database | MySQL with raw SQL, connection pooling |
| Auth | JWT with cookies, role-based (user, store_manager, super_admin) |
| Images | Multer for file uploads |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, rate limiting, CORS |

---

## Project Structure

```
├── backend/
│   ├── db/
│   │   ├── init_schema.sql          # Full DB schema
│   │   ├── seed.js                  # Sample data seeder
│   │   └── migration_*.sql          # Manual migrations
│   ├── src/
│   │   ├── config/                  # DB, env, swagger config
│   │   ├── controllers/             # 19 controllers
│   │   ├── middlewares/             # auth, error handler, upload
│   │   ├── routes/                  # 19 route files
│   │   └── server.js                # App entry point
│   ├── uploads/                     # Uploaded images
│   └── .env                         # Environment variables
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios API wrappers
│   │   ├── components/              # Shared components
│   │   ├── contexts/                # Auth, Cart, Theme, Language, Favorites
│   │   ├── pages/                   # Page components
│   │   │   └── admin/               # Admin panel pages
│   │   ├── App.jsx                  # Routes
│   │   └── main.jsx                 # Entry
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=Delora_db
JWT_SECRET=your_secret_key
GMAIL_EMAIL=your.email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 3. Database Setup

```bash
cd backend

# Create database and tables
npm run db:init

# (Optional) Seed sample data
npm run db:seed

# Reset everything
npm run db:reset
```

Apply migrations (if any were added after init):
```bash
mysql -u root -proot Delora_db < db/migration_file.sql
```

### 4. Run

```bash
# Backend (http://localhost:5000)
cd backend
npm run dev

# Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 5. Build for Production

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## API Documentation

Swagger UI available at `http://localhost:5000/api/docs` when the backend is running.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/products | List products |
| GET | /api/products/:id | Product detail |
| POST | /api/cart | Add to cart |
| GET | /api/cart | Get cart |
| POST | /api/orders/checkout | Place order |
| GET | /api/orders/my-orders | User orders |
| GET | /api/user-notifications | User notifications |
| GET | /api/favorites | User favorites |

Admin routes are prefixed with role checks (`super_admin`, `store_manager`).

---

## Roles

- **user** — Customer (browse, cart, order, reviews, favorites)
- **store_manager** — Admin panel access (products, orders, banners, etc.)
- **super_admin** — Full access including user management

Default admin credentials (from seed data):
- Email: `superadmin@delora.com` / Password: `123456789`
- Email: `manager@delora.com` / Password: `123456789`

---

## Migrations

Database migrations are manual SQL files in `backend/db/`:

| File | Purpose |
|------|---------|
| `migration_quantity_decimal.sql` | Convert cart/order quantities to DECIMAL for weight products |
| `migration_contact_reply.sql` | Add admin_reply columns to contacts table |
| `migration_user_notifications.sql` | Create user_notifications table |

---

## License

ISC
