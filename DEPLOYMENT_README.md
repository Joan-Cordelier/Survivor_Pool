# Survivor Pool – Project Documentation

## 1. Overview
**Survivor Pool** is a full-stack web application with:
- **Frontend**: React + Vite (in `/Survivor`)  
- **Backend**: Node.js + Express + Prisma + MySQL/MariaDB (in `/Backend`)  
- **Deployment**:  
  - Backend hosted on **Render**  
  - Frontend hosted on **GitHub Pages**  
- **CI/CD**: Automated workflows using GitHub Actions:
  - Build + deploy frontend to GitHub Pages  
  - Redeploy backend on Render using Deploy Hook  
  - Optional Docker image builds pushed to GitHub Container Registry  

---

## 2. Architecture

```
+------------------+           +--------------------+
|   GitHub Pages   | <-------> |   Render Backend   |
|  (React / Vite)  |   HTTPS   | (Express + Prisma) |
+------------------+           +--------------------+
        |
        v
+-------------------+
|   MySQL/MariaDB   |
|  (Render Service) |
+-------------------+
```

- **Frontend**: Static React app served by GitHub Pages  
- **Backend**: Express app, connected to MySQL/MariaDB on Render  
- **Database**: Managed MySQL/MariaDB instance on Render  
- **External API**: Backend calls `api.jeb-incubator.com` with authentication  

---

## 3. Backend

### Features
- REST API endpoints:  
  - `/investor/get`, `/startup/get`, `/event`, `/news`, `/auth`, etc.  
- Authentication via external API (JEB Incubator).  
- Prisma ORM for database access.  
- CORS enabled for:
  - Local development (`http://localhost:5173`)  
  - Production frontend (`https://joan-cordelier.github.io`)  

### Environment Variables
Set in **Render → Environment**:
```env
PORT=3000
DATABASE_URL=mysql://<user>:<pass>@<host>:3306/<dbname>
JEB_API_KEY=<secret-key>  # used for external API calls
```

### Local Development
```bash
cd Backend
npm install
npm run dev
```
Backend will run at `http://localhost:3000`.

---

## 4. Frontend

### Features
- Built with **React + Vite**
- API abstraction layer:  
  - `/src/apis/BackendApi/*.api.js` calls backend endpoints  
  - Uses `VITE_BACKEND_URL` as base URL

### Environment Variables
Configured via `.env` in `/Survivor`:
```env
VITE_BACKEND_URL=https://survivor-pool-xxxxx.onrender.com
```

### Local Development
```bash
cd Survivor
yarn install
yarn dev
```
Frontend will run at `http://localhost:5173`.

---

## 5. CI/CD Workflows

### a) Frontend Deploy (`.github/workflows/deploy-frontend-pages.yml`)
- Trigger: Push to `main`
- Steps:
  1. Checkout repo
  2. Setup Node.js + Yarn
  3. Create `.env` with `VITE_BACKEND_URL` (from GitHub Secret)
  4. Build React app
  5. Upload `dist/` to GitHub Pages

Secret needed:
```
VITE_BACKEND_URL = https://survivor-pool-xxxxx.onrender.com
```

### b) Backend Deploy (`.github/workflows/backend-render.yml`)
- Trigger: Push to `main`
- Steps:
  1. Call Render Deploy Hook (URL stored in GitHub Secret `RENDER_DEPLOY_HOOK`)
  2. Render pulls code, installs deps, runs Prisma, and restarts service

Secrets needed:
```
RENDER_DEPLOY_HOOK = https://api.render.com/deploy/srv-xxxxx
```

### c) Optional Backend Docker Build
- Builds backend Docker image and pushes to **GitHub Container Registry**.  
- Useful if later you want to deploy with Kubernetes/Docker Swarm.

---

## 6. Deployment URLs
- **Frontend**:  
  `https://joan-cordelier.github.io/Survivor_Pool/`  

- **Backend**:  
  `https://survivor-pool-xxxxx.onrender.com/`  

- **Database**: Managed MySQL/MariaDB on Render (not public).

---

## 7. Development Workflow

### For Developers
1. **Clone repo**
   ```bash
   git clone https://github.com/<username>/Survivor_Pool.git
   ```
2. **Run backend locally**
   - Create `.env` with `DATABASE_URL` and `JEB_API_KEY`
   - Start with `npm run dev`
3. **Run frontend locally**
   - Create `.env` with `VITE_BACKEND_URL=http://localhost:3000`
   - Start with `yarn dev`
4. **Push changes**
   - GitHub Actions automatically redeploys backend + frontend.

---

## 8. Troubleshooting

- **Blank page on GitHub Pages**  
  Add `base: '/Survivor_Pool/'` in `vite.config.js` and configure Router with `basename="/Survivor_Pool"`.

- **CORS errors**  
  Ensure backend allows origin `https://joan-cordelier.github.io`.

- **401 Unauthorized from external API**  
  Check `JEB_API_KEY` is set in Render env vars and backend forwards it in headers.

- **Slow first request**  
  Free Render dynos have cold starts. Consider uptime pings.

---

## 9. Next Improvements
- Move frontend hosting to Netlify/Vercel for custom domain.  
- Add monitoring/alerts on Render.  
- Configure migrations in CI/CD (`prisma migrate deploy`).  
- Add tests to pipeline.

---

With this setup, you can demo a **full cloud deployment**: frontend + backend + database, fully automated with GitHub Actions.
