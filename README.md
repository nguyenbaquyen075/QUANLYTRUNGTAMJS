# Quản Lý Trung Tâm — Learning Center Management System

A management system for a Vietnamese tutoring center: courses and classes,
lessons and attendance, assignments and exams, invoicing, and a homepage
whose content the staff edit themselves from the admin panel.

The interface is in Vietnamese. Code, commits and documentation are in
English.

## Stack

| Layer | Choice |
|-------|--------|
| Backend | Node.js 22, Express, Sequelize |
| Database | PostgreSQL in production, SQLite locally (same models) |
| Frontend | React 18 + Vite, React Router, Axios |
| Server-rendered views | EJS (kept alongside the SPA) |
| Sessions | express-session on connect-pg-simple |
| Realtime | `ws` for notification push |
| Media | Cloudinary, with a local `uploads/` fallback |
| Export | exceljs, pdfkit |
| Hosting | Render (single service, see `render.yaml`) |

Both the React SPA and the original EJS views are served by the same Express
app. The SPA is the primary interface; the EJS views remain for pages that
were never migrated.

## Roles

Five roles, enforced server-side (`ADMIN`, `STAFF`, `TEACHER`, `STUDENT`,
`PARENT`):

- **Admin** — full access: users, courses, classes, invoices, site content
- **Staff** — course and class administration, limited financial access
- **Teacher** — own classes: lessons, attendance, assignments, grading,
  feedback
- **Student** — schedule, lesson replays, assignments, exams, results
- **Parent** — read-only view of their child's progress, plus invoices

## What it does

**Teaching**
- Courses, classes and enrolment, with per-class student permissions
- Lessons with video replay and attendance tracking
- Assignments: essay and multiple-choice, per-section point allocation
- Exams: one question at a time, per-sub-item grading for true/false
  questions (a, b, c, d), print and download, first-attempt-only scoring
- Teacher feedback and evaluations on submitted work

**Administration**
- Student and teacher management, teacher profiles with avatars
- Notifications: system-wide, per-class or per-user, pushed over WebSocket
- Invoices and checkout, with an audit log
- Excel and PDF export

**Site content**
- The homepage (banner, countdown, introduction, featured teachers, slides,
  achievements, feedback, courses) and the footer contact details are stored
  in `SiteSetting` and `HomepageItem` and edited from the admin panel. Every
  block falls back to its original hardcoded content when unset.

## Known limitations

Two features are less complete than the older specification documents
suggest:

- **The advisor chat is rule-based, not AI.** `aiController` matches
  keywords and phone-number patterns to canned replies. It calls no language
  model, despite the `AiChatSession` and `UserLearningProfile` models.
- **Checkout is simulated.** It creates a real `Invoice` record, but no
  payment gateway is wired up — the VNPay environment variables are read and
  the request is never signed.

`tailieuchucnang.md` describes the intended system, including features not
yet built. Treat it as a specification, not as documentation of what runs.

## Getting started

Requires Node.js 22 or newer. No database setup is needed for local
development; it falls back to SQLite.

```bash
npm install     # installs root, backend and frontend
npm run seed    # demo users, teachers, students and courses
npm run dev     # backend and frontend together
```

The frontend runs on http://localhost:5173 and proxies API calls to the
backend on port 3001.

Demo accounts, all with the password `123456`:

| Role | Login |
|------|-------|
| Admin | `admin@trungtam.com` |
| Teacher | `nvnguyen@gmail.com` |
| Student | `quyen27@gmail.com` |

Seeding is idempotent: it skips when the database already has users. Set
`SEED_FORCE=true` to reseed.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | Backend and frontend with hot reload |
| `npm start` | Production: Express serves the built SPA |
| `npm run build` | Builds the frontend into `frontend/dist` |
| `npm run seed` | Seeds demo data |
| `npm test --prefix backend` | Backend tests (`node --test`) |

## Configuration

Copy `backend/.env.example` to `backend/.env`. Everything is optional
locally.

| Variable | Purpose |
|----------|---------|
| `PORT`, `NODE_ENV` | Server basics |
| `DB_DIALECT`, `DATABASE_URL` | Postgres connection; unset means SQLite |
| `SESSION_SECRET` | Session signing key — set a real one in production |
| `CLOUDINARY_*` | Media storage; unset falls back to local `uploads/` |
| `VNP_*` | Read by the checkout views; the gateway is not yet wired up |

If `DATABASE_URL` points at a host that no longer resolves, the app logs the
problem and falls back to SQLite rather than refusing to start.

## Project layout

```
backend/
  server.js            entry point, seeds on first boot
  src/
    models/            Sequelize models
    controllers/       one per area: admin, auth, home, student, teacher, …
    routes/            Express routers
    views/             EJS pages kept from before the SPA
frontend/
  src/pages/           React pages, grouped by role
  src/components/
docs/                  design specs and implementation plans
render.yaml            the single source of deployment configuration
```

## Deployment

Deployed to Render as one service. `render.yaml` is authoritative — a
manually created service ignores it and will fail to build. See
[DEPLOY_RENDER.md](DEPLOY_RENDER.md).

## Contributing

Branch naming, commit style, the PR flow and releases are described in
[CONTRIBUTING.md](CONTRIBUTING.md). `main` is protected: every change goes
through a pull request with CI passing.

The `phase/*` branches are read-only markers on the history that predates
this workflow, one per period of work. They are not active development
branches.
