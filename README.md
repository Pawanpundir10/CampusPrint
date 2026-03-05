# CampusPrint 🖨️

**Location-Based Smart Printing Management System**

No more WhatsApp to the print shop. Students upload PDFs, configure print settings, and collect when ready.

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Multer, Supabase Storage, Nodemailer
- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router v6

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Student** | Register, browse shops, upload PDFs, place orders, track & cancel |
| **Shop Admin** | Manage shop profile, view orders, update status, mark payment |
| **Super Admin** | Manage all users and shops platform-wide |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Supabase project with an **`orders`** storage bucket

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your credentials (see below)
npm run dev            # runs with nodemon on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # runs on http://localhost:5173
```

### 3. Seed a Super Admin (first time only)

```bash
cd backend
node scripts/seedAdmin.js
# Follow the prompts — or set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME in .env
```

---

## 🔑 Environment Variables

### `backend/.env`

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/campusprint
JWT_SECRET=<long-random-secret>
CLIENT_URL=http://localhost:5173          # frontend origin
PORT=5000

EMAIL_USER=you@gmail.com                  # Gmail for transactional email
EMAIL_PASSWORD=<gmail-app-password>       # Use an App Password, not your real password

SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>  # From Supabase → Settings → API

# Optional — used by seedAdmin.js
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=SecurePassword123!
SEED_ADMIN_NAME=Admin Name
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register student or shop admin |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Shops
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/shops` | — | List all shops |
| GET | `/api/shops/:id` | — | Single shop details |
| POST | `/api/shops` | Admin | Create shop |
| PUT | `/api/shops/:id` | Admin | Update shop |

### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/upload-files` | Student | Upload PDFs → Supabase Storage |
| POST | `/api/orders` | Student | Place order |
| GET | `/api/orders/my` | Student | My orders |
| GET | `/api/orders/:id` | Student/Admin | Order detail |
| POST | `/api/orders/:id/cancel` | Student | Cancel pending order |
| GET | `/api/orders/pdf/:path` | ✅ (token required) | Stream PDF from Supabase |

### Admin (Shop Owner)
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/orders` | Incoming orders |
| PUT | `/api/admin/orders/:id/status` | Update: pending → printing → ready → completed |
| PUT | `/api/admin/orders/:id/payment` | Mark cash payment received |
| GET | `/api/admin/earnings` | Earnings stats |

---

## 💰 Price Calculation

```
amount     = pages × copies × (bwPrice or colorPrice)
totalAmount = sum of all file amounts
```

---

## 🚢 Deployment Checklist

### Backend (e.g. Render, Railway, Fly.io)

- [ ] Set all environment variables in the hosting dashboard (never commit `.env`)
- [ ] Set `CLIENT_URL` to your **production frontend URL** (e.g. `https://campusprint.vercel.app`)
- [ ] Set `NODE_ENV=production`
- [ ] Confirm Supabase `orders` bucket exists and `SUPABASE_SERVICE_KEY` has write permissions
- [ ] Run `node scripts/seedAdmin.js` once to create the super admin account
- [ ] Use `npm start` (not `npm run dev`) as the start command

### Frontend (e.g. Vercel, Netlify)

- [ ] Set `VITE_API_URL=https://your-backend-url.com/api` in the hosting dashboard
- [ ] Run `npm run build` — deploy the `dist/` folder
- [ ] Configure a **catch-all redirect** to `index.html` for React Router (SPA routing):
  - **Vercel**: add `vercel.json` with rewrites
  - **Netlify**: add `_redirects` file: `/* /index.html 200`

### Vercel `vercel.json` example (frontend)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Netlify `_redirects` (place in `frontend/public/`)

```
/* /index.html 200
```

---

## 🔒 Security Notes

- JWT is required for all protected routes
- PDF files are gated behind JWT auth (token passed as `?token=...` query param)
- Role-based middleware enforces student/admin/superAdmin access
- Supabase service key is server-side only — never expose it to the frontend
- Always use a Gmail **App Password** (not your real password) for `EMAIL_PASSWORD`

---

## 📁 Project Structure

```
campusprint/
├── backend/
│   ├── config/          # DB + Supabase clients
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, role checks
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── scripts/         # One-off scripts (seedAdmin)
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Shared UI components
        ├── context/     # Auth context
        ├── pages/       # Page components (student, admin, superadmin)
        ├── services/    # Axios API client
        └── utils/       # Helpers (fmt, etc.)
```
