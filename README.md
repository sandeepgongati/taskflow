# TaskFlow

TaskFlow is a full-stack project management platform built with Spring Boot, React, PostgreSQL, Docker, JWT authentication, and role-based access control.

## Features

- JWT registration and login
- Role-based access for `ADMIN`, `MANAGER`, and `USER`
- Task CRUD API backed by PostgreSQL
- React dashboard with authentication state
- Dockerized frontend, backend, and database
- GitHub Actions workflows for CI and GitHub Pages frontend deployment

## Local Development

### Backend

```powershell
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`.

If Docker/PostgreSQL is not running, use the local demo profile:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### Docker

```powershell
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8080`  
PostgreSQL: `localhost:5432`

## Demo Accounts

On first startup, the backend seeds:

| Email | Password | Role |
| --- | --- | --- |
| admin@taskflow.dev | Admin@123 | ADMIN |
| manager@taskflow.dev | Manager@123 | MANAGER |
| user@taskflow.dev | User@123 | USER |

## Free Public Deployment

GitHub Pages can host the React frontend for free, but it cannot run the Spring Boot backend. A free/low-cost public setup is:

- Frontend: GitHub Pages
- Backend: Render free web service, Fly.io free allowance, or another Java-capable free tier
- Database: Supabase or Neon free PostgreSQL

Set these environment variables for the backend host:

```text
DATABASE_URL=jdbc:postgresql://HOST:5432/DB
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
JWT_SECRET=replace-with-a-long-random-secret
ALLOWED_ORIGINS=https://YOUR_GITHUB_USERNAME.github.io
```

For GitHub Pages, set this repository secret:

```text
VITE_API_BASE_URL=https://YOUR_BACKEND_HOST
```

Then enable GitHub Pages from GitHub Actions in the repository settings.
