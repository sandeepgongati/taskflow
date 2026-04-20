# Real Free-Tier Backend Deployment

Use this when you want the public GitHub Pages frontend to connect to a real Spring Boot backend and a shared PostgreSQL database.

Recommended free-tier stack:

- Frontend: GitHub Pages
- Backend: Render Free Web Service or Koyeb Free Instance
- Database: Neon Free PostgreSQL

## Important Limits

Free backend hosting is good for portfolio demos, not guaranteed production.

- Render Free Web Services spin down after 15 minutes without traffic and wake up on the next request.
- Koyeb Free Instances scale down to zero after 1 hour without traffic.
- Neon Free PostgreSQL includes free compute allowances and scales down when idle.

## 1. Create Neon Database

1. Go to Neon and create a free PostgreSQL project.
2. Copy the connection details.
3. Use JDBC format:

```text
jdbc:postgresql://HOST/DATABASE?sslmode=require
```

Save:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
```

## 2. Deploy Backend On Render

1. Go to Render.
2. New > Web Service.
3. Connect your GitHub repository.
4. Select Docker deploy.
5. Root directory:

```text
backend
```

6. Instance type:

```text
Free
```

7. Add environment variables:

```text
DATABASE_URL=jdbc:postgresql://HOST/DATABASE?sslmode=require
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
JWT_SECRET=replace-with-a-long-random-secret
ALLOWED_ORIGINS=https://sandeepgongati.github.io
```

8. Deploy.

Your backend URL will look like:

```text
https://taskflow-backend.onrender.com
```

## 3. Connect GitHub Pages To Backend

Open `.github/workflows/pages.yml`.

Change:

```yaml
VITE_DEMO_MODE: "true"
```

to:

```yaml
VITE_DEMO_MODE: "false"
VITE_API_BASE_URL: "https://YOUR_BACKEND_URL"
```

Commit and push:

```powershell
git add .
git commit -m "Connect public frontend to backend API"
git push
```

GitHub Actions will redeploy the frontend.

## 4. Test Public Site

Open:

```text
https://sandeepgongati.github.io/taskflow/
```

Test:

- Admin login
- Register a new `@taskflow.dev` user
- Create a task
- Refresh from another browser

If the backend was asleep, the first login can take about a minute.

## Vercel Frontend

If you deploy the frontend on Vercel, the backend already accepts `https://*.vercel.app` origins. You can also add the exact Vercel domain in Render:

```text
ALLOWED_ORIGINS=https://sandeepgongati.github.io,https://taskflow-ten-dusky.vercel.app
```
