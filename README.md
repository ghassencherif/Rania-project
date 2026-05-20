# Free Time Optimizer - Tourism Platform

Full-stack tourism web application for business travelers in Tunisia.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT + role-based access (admin / participant)

## Dashboards

- Participant dashboard: personalized short-activity recommendations
- Admin dashboard: overview metrics and activity management (create/delete)

## 1) Database Setup

1. Create your MySQL database and tables using:
   - `server/database/schema.sql`
2. Seeded admin account:
   - Email: `admin@freetime.tn`
   - Password: `Admin123!`

## 2) Backend Setup

1. Go to `server` folder.
2. Copy `.env.example` to `.env`.
3. Update your DB credentials in `.env`.
4. Install and run:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

## 3) Frontend Setup

1. Go to `client` folder.
2. Create `.env` and set:

```bash
VITE_API_URL=http://localhost:5000/api
```

3. Install and run:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/activities`
- `GET /api/activities/recommendations` (participant only)
- `GET /api/admin/overview` (admin only)
- `POST /api/admin/activities` (admin only)
- `PUT /api/admin/activities/:id` (admin only)
- `DELETE /api/admin/activities/:id` (admin only)
