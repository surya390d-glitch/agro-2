# 🚀 AGRO PROJECT - Complete Deployment Guide

## **Project Structure**
```
Agro/
├── backend/           (Express API - deployed on Render)
├── frontend/          (Vite React - deployed on Vercel)
└── agra/              (Mobile/alternative frontend)
```

---

## **PART 1: FIX & DEPLOY BACKEND ON RENDER**

### **Step 1.1: Add missing files to backend folder**

**Location:** `C:\Users\Surya\Desktop\Agro\backend\`

1. **Copy `.env.example` content** to `.env` file:
```
PORT=5000
JWT_SECRET=agroguardian-secret-key-12345-change-this-in-production
NODE_ENV=production
FRONTEND_URL=https://agro-2-wip0jram8-surya390d-glitchs-projects.vercel.app
```

2. **Verify `package.json`** has correct structure (check provided file)

3. **Verify `.gitignore`** exists with:
```
node_modules/
.env
.env.local
*.log
```

### **Step 1.2: Commit & push to GitHub**

```powershell
cd C:\Users\Surya\Desktop\Agro\backend
git add .
git commit -m "Add environment variables and deployment config"
git push origin main
```

### **Step 1.3: Set Environment Variables on Render**

1. **Go to:** https://dashboard.render.com → **agro-2**
2. **Click:** Settings → Environment
3. **Add these variables:**

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `JWT_SECRET` | `agroguardian-secret-key-12345-change-this-in-production` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://agro-2-wip0jram8-surya390d-glitchs-projects.vercel.app` |

4. **Click:** "Save Changes"

### **Step 1.4: Redeploy Backend**

1. **Go to:** Render dashboard → **agro-2**
2. **Click:** Manual Deploy → **Clear build cache & deploy**
3. **Wait** 2-3 minutes for build to complete
4. **Check status:** Should show ✅ **Ready** (green)

### **Step 1.5: Verify Backend is Working**

Open in browser:
```
https://agro-2.onrender.com/api/health
```

You should see:
```json
{
    "status": "AgroGuardian API Running",
    "version": "1.0.0"
}
```

---

## **PART 2: DEPLOY FRONTEND ON VERCEL**

### **Step 2.1: Frontend Structure Check**

**Location:** `C:\Users\Surya\Desktop\Agro\frontend\`

Verify `vite.config.js` or `vite.config.ts` exists with:
```javascript
export default {
  server: { port: 5173 },
  build: { outDir: 'dist' }
}
```

### **Step 2.2: Verify config.js wiring**

**Location:** `frontend/src/config.js` (or wherever your API config is)

Should contain:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default API_BASE_URL;
```

### **Step 2.3: Commit Frontend Code**

```powershell
cd C:\Users\Surya\Desktop\Agro\frontend
git add .
git commit -m "Frontend ready for Vercel deployment"
git push origin main
```

### **Step 2.4: Create Vercel Project**

1. **Go to:** https://vercel.com/dashboard
2. **Click:** "Add New" → "Project"
3. **Select:** GitHub repo (agra or agro-2)
4. **Fill in:**
   - **Project Name:** `agro-frontend` (or your choice)
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### **Step 2.5: Set Environment Variables (Vercel)**

In Vercel project settings:
- **Click:** Settings → Environment Variables
- **Add:**
  - **Name:** `VITE_API_URL`
  - **Value:** `https://agro-2.onrender.com/api`
  - **Scope:** Production
- **Click:** Save

### **Step 2.6: Deploy**

1. **Click:** "Deploy" button
2. **Wait** 1-2 minutes for build
3. **Once done**, you get a live URL like: `https://agro-frontend.vercel.app`

---

## **PART 3: VERIFY END-TO-END**

### **Test 1: Backend Health Check**
```
curl https://agro-2.onrender.com/api/health
```
Expected: `{ "status": "AgroGuardian API Running", "version": "1.0.0" }`

### **Test 2: Frontend Loads**
1. Open your Vercel URL in browser
2. **Right-click** → Inspect → Console (F12)
3. Should **NOT** show errors

### **Test 3: API Connectivity**
1. Try logging in / any API call
2. Check Console → Network tab
3. Requests should go to `https://agro-2.onrender.com/api/...`
4. Response status should be **2xx or 3xx** (not 4xx/5xx)

---

## **PART 4: TROUBLESHOOTING**

### **Problem: Backend still failing on Render**

**Solution:**
```powershell
# Check if package.json is correct
type C:\Users\Surya\Desktop\Agro\backend\package.json

# Reinstall dependencies locally
cd C:\Users\Surya\Desktop\Agro\backend
rm -r node_modules
npm install

# Commit
git add .
git commit -m "Reinstall dependencies"
git push

# Then manually deploy on Render
```

### **Problem: Frontend shows 404 on API calls**

**Solution:**
1. Verify `.env` in Vercel has `VITE_API_URL`
2. Redeploy Vercel with: **Deployments** → **... menu** → **Redeploy**
3. Check that `config.js` uses `import.meta.env.VITE_API_URL`

### **Problem: CORS error**

**Solution:**
Update `index.js` CORS origins:
```javascript
const allowedOrigins = [
    'https://agro-frontend.vercel.app',  // Add your Vercel URL
    'http://localhost:5173',
    'http://localhost:4173'
].filter(Boolean);
```

Then commit, push, and redeploy on Render.

---

## **Files to Update/Create**

| File | Location | Action |
|------|----------|--------|
| `.env` | `backend/` | Create with secrets |
| `package.json` | `backend/` | Update with build script |
| `vite.config.js` | `frontend/` | Verify exists |
| `config.js` | `frontend/src/` | Verify API_BASE_URL wiring |
| `.gitignore` | `backend/` | Ensure `.env` is ignored |

---

## **Final Checklist Before Going Live**

- [ ] Backend `.env` has `JWT_SECRET`
- [ ] Backend deployed on Render (status: Ready ✅)
- [ ] Frontend deployed on Vercel with `VITE_API_URL` set
- [ ] `/api/health` returns 200
- [ ] Frontend loads without console errors
- [ ] API calls hit correct backend URL
- [ ] Login/auth works end-to-end
- [ ] Data fetches work end-to-end

---

## **Quick Links**

- **Vercel Frontend:** https://agro-2-wip0jram8-surya390d-glitchs-projects.vercel.app
- **Render Backend:** https://agro-2.onrender.com
- **Health Check:** https://agro-2.onrender.com/api/health

---

**Status:** Ready for production deployment ✅
