# Google Deployment Guide

This setup publishes TaskFlow as a real public web app:

- Frontend: Firebase Hosting
- Backend: Google App Engine Standard, Java 21
- Database: Neon PostgreSQL free plan

## What Is Free

Firebase Hosting has a no-cost tier for static web apps. Google App Engine Standard has free quotas, but a Google Cloud billing account is still required. Neon has a free PostgreSQL plan suitable for this project while traffic is small.

Free tiers are not the same as unlimited production hosting. If traffic grows or quotas are exceeded, costs can start. Add budget alerts before deploying.

## 1. Create Neon PostgreSQL

1. Create a Neon project.
2. Copy the PostgreSQL connection details.
3. Convert the connection to this JDBC format:

```text
jdbc:postgresql://HOST/DATABASE?sslmode=require
```

Keep these values private:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
```

## 2. Prepare App Engine Backend

Copy the template:

```powershell
Copy-Item backend/src/main/appengine/app.yaml.example backend/src/main/appengine/app.yaml
```

Edit `backend/src/main/appengine/app.yaml` and replace:

```text
YOUR_NEON_HOST
YOUR_DATABASE
YOUR_NEON_USERNAME
YOUR_NEON_PASSWORD
YOUR_FIREBASE_SITE
JWT_SECRET
```

Deploy backend:

```powershell
cd backend
gcloud auth login
gcloud config set project YOUR_GOOGLE_CLOUD_PROJECT_ID
gcloud app create
mvn package appengine:deploy
```

Your backend URL will look similar to:

```text
https://YOUR_GOOGLE_CLOUD_PROJECT_ID.REGION_ID.r.appspot.com
```

## 3. Prepare Firebase Frontend

Create a file:

```text
frontend/.env.production
```

Add:

```text
VITE_API_BASE_URL=https://YOUR_APP_ENGINE_BACKEND_URL
```

Copy Firebase project config:

```powershell
Copy-Item .firebaserc.example .firebaserc
```

Edit `.firebaserc` with your Firebase project id.

Build and deploy:

```powershell
npm install -g firebase-tools
firebase login
npm --prefix frontend install
npm --prefix frontend run build
firebase deploy --only hosting
```

Your public frontend URLs will look like:

```text
https://YOUR_FIREBASE_PROJECT_ID.web.app
https://YOUR_FIREBASE_PROJECT_ID.firebaseapp.com
```

## 4. Production Notes

- Use a long random `JWT_SECRET`.
- Keep `app.yaml` out of Git if it contains real secrets.
- Update `ALLOWED_ORIGINS` with your actual Firebase domains.
- The local demo profile uses H2 and does not persist data after restart.
- Production data persists in Neon PostgreSQL.

