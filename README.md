# ENIT Junior Entreprise — Training Management Platform

A full-stack training management platform built for ENIT Junior Entreprise, featuring role-based dashboards, course management, progress tracking, and training proposal workflows.

---

## 🧩 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14 + Tailwind CSS         |
| Backend    | Node.js + Express                 |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT (JSON Web Tokens)             |
| Charts     | Chart.js + react-chartjs-2        |

---

## 📁 Project Structure

```
enit-je-platform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── trainingController.js
│   │   ├── progressController.js
│   │   ├── proposalController.js
│   │   ├── userController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   └── auth.js               # JWT verify + role restriction
│   ├── models/
│   │   ├── User.js
│   │   ├── Training.js
│   │   ├── Progress.js
│   │   └── TrainingProposal.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trainings.js
│   │   ├── progress.js
│   │   ├── proposals.js
│   │   ├── users.js
│   │   └── stats.js
│   ├── scripts/
│   │   └── seed.js               # Initial data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardLayout.js
    │   │   ├── Sidebar.js
    │   │   └── Topbar.js
    │   └── ui/
    │       ├── Modal.js
    │       ├── StatCard.js
    │       └── TrainingCard.js
    ├── lib/
    │   ├── api.js                 # Axios instance with JWT interceptor
    │   └── auth.js                # Auth context + hooks
    ├── pages/
    │   ├── auth/
    │   │   ├── login.js
    │   │   └── register.js
    │   ├── admin/
    │   │   ├── dashboard.js
    │   │   ├── trainings.js
    │   │   ├── proposals.js
    │   │   ├── users.js
    │   │   └── progress.js
    │   ├── member/
    │   │   ├── dashboard.js
    │   │   ├── trainings/
    │   │   │   ├── index.js
    │   │   │   └── [id].js
    │   │   ├── progress.js
    │   │   └── proposals.js
    │   ├── _app.js
    │   ├── _document.js
    │   ├── 404.js
    │   └── index.js
    ├── styles/
    │   └── globals.css
    ├── .env.example
    ├── next.config.js
    ├── postcss.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)
- npm or yarn

---

### 1. Clone / Unzip the project

```bash
unzip enit-je-platform.zip
cd enit-je-platform
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/enit_je_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Seed the database** (creates admin, 2 members, and 4 sample trainings):

```bash
node scripts/seed.js
```

**Start the backend:**

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The API will run on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the frontend:**

```bash
# Development
npm run dev

# Production build
npm run build && npm start
```

The app will run on **http://localhost:3000**

---

## 🔐 Demo Credentials

After running the seed script:

| Role   | Email                  | Password     |
|--------|------------------------|--------------|
| Admin  | admin@enit-je.tn       | Admin@123    |
| Member | anis@enit-je.tn        | Member@123   |
| Member | sarra@enit-je.tn       | Member@123   |

---

## 👥 Roles & Features

### Admin (RH)
- **Dashboard** — Statistics, monthly enrollment chart, category breakdown
- **Trainings** — Full CRUD: create, edit, delete, publish/unpublish
- **Proposals** — Approve or reject member proposals with review notes
- **Members** — View all users, activate/deactivate accounts, inspect individual progress
- **Progress** — Overview of all members' training progress with status filters

### Member
- **Dashboard** — Personal stats, category progress charts, recent activity
- **Trainings** — Browse, filter, and enroll in training courses
- **Training Detail** — View modules, mark modules as complete, track progress via circular progress ring
- **My Progress** — Full progress tracker with status filters and continue/review CTAs
- **Proposals** — Submit training proposals with justification; view status and admin notes

---

## 🌐 API Reference

### Auth
| Method | Route           | Access  | Description         |
|--------|-----------------|---------|---------------------|
| POST   | /auth/register  | Public  | Register new user   |
| POST   | /auth/login     | Public  | Login & get token   |
| GET    | /auth/me        | Private | Get current user    |
| PUT    | /auth/me        | Private | Update profile      |

### Trainings
| Method | Route              | Access       | Description          |
|--------|--------------------|--------------|----------------------|
| GET    | /trainings         | Private      | List all trainings   |
| GET    | /trainings/:id     | Private      | Get single training  |
| POST   | /trainings         | Admin        | Create training      |
| PUT    | /trainings/:id     | Admin        | Update training      |
| DELETE | /trainings/:id     | Admin        | Delete training      |

### Progress
| Method | Route                              | Access  | Description             |
|--------|------------------------------------|---------|-------------------------|
| POST   | /progress/enroll/:trainingId       | Private | Enroll in training      |
| PUT    | /progress/:trainingId/module/:idx  | Private | Mark module complete    |
| GET    | /progress/me                       | Private | Get my progress         |
| GET    | /progress/all                      | Admin   | Get all members progress|

### Proposals
| Method | Route                   | Access  | Description             |
|--------|-------------------------|---------|-------------------------|
| POST   | /proposals              | Private | Submit proposal         |
| GET    | /proposals              | Admin   | List all proposals      |
| GET    | /proposals/me           | Private | My proposals            |
| PUT    | /proposals/:id/review   | Admin   | Approve / reject        |

### Users
| Method | Route                        | Access | Description              |
|--------|------------------------------|--------|--------------------------|
| GET    | /users                       | Admin  | List all users           |
| GET    | /users/:id                   | Admin  | User details + progress  |
| PUT    | /users/:id/toggle-status     | Admin  | Activate/deactivate      |
| PUT    | /users/:id/role              | Admin  | Change role              |

### Stats
| Method | Route        | Access  | Description              |
|--------|--------------|---------|--------------------------|
| GET    | /stats/admin | Admin   | Admin dashboard stats    |
| GET    | /stats/me    | Private | Member personal stats    |

---

## 🎨 Brand Colors

| Name          | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| Navy (Primary)| `#1d2d4e` | Backgrounds, text, buttons|
| Teal (Accent) | `#3cbfbf` | Highlights, progress bars |
| Teal Dark     | `#2a9090` | Hover states              |

---

## 🏗 Production Notes

1. Set `NODE_ENV=production` in your backend `.env`
2. Use a strong, random `JWT_SECRET` (minimum 32 characters)
3. Replace `MONGODB_URI` with your Atlas connection string for production
4. Configure CORS `origin` in `server.js` to match your deployed frontend URL
5. Build the frontend with `npm run build` before deploying

---

## 📦 Running Both Servers Together

Install `concurrently` for convenience:

```bash
npm install -g concurrently

# From project root:
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

---

_Built with ❤️ for ENIT Junior Entreprise_
