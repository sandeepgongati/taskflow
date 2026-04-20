# Free Static Demo Deployment

This is the safest no-cost way to publish TaskFlow publicly.

It hosts only the React frontend and uses browser localStorage as a demo data store. Visitors can login, register `@taskflow.dev` users, create tasks, and view the admin directory without any paid backend server.

## Option A: GitHub Pages

1. Create a public GitHub repository.
2. Push this project to that repository.
3. In GitHub, open `Settings > Pages`.
4. Set the source to `GitHub Actions`.
5. Push to `main`.

The workflow `.github/workflows/pages.yml` builds with:

```text
VITE_DEMO_MODE=true
```

Your public URL will look like:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/
```

## Option B: Netlify Manual Upload

1. Build the demo locally:

```powershell
cd frontend
$env:VITE_DEMO_MODE="true"
npm install
npm run build
```

2. Go to Netlify.
3. Drag and drop the `frontend/dist` folder into Netlify Drop.
4. Netlify gives you a public URL.

## What This Demo Does Not Do

- It does not use the Spring Boot backend.
- It does not use PostgreSQL.
- Data is stored in each visitor's browser only.

## When You Want Real Backend Later

Use one of these:

- Backend: Render free web service, Koyeb free service, or Google App Engine free quota
- Database: Neon free PostgreSQL or Supabase free PostgreSQL
- Frontend: GitHub Pages, Netlify, Vercel, or Firebase Hosting

Free backend services can sleep after inactivity. That is normal for no-cost hosting.

