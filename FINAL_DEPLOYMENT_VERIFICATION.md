# 🚀 AGRO FULL-STACK DEPLOYMENT - FINAL VERIFICATION & FIXES

## **Status Overview**
- ✅ **Backend:** Deployed on Render at `https://agro-2.onrender.com`
  - Service ID: `srv-d76c28uslomc738fmrsg`
  - Health Check: `/api/health`
- ⏳ **Frontend:** Needs Vercel environment variable configuration
  - API Config: Uses `VITE_API_URL` environment variable
  - Fallback: `http://localhost:5000/api` (for local dev)

---

## **STEP 1: Verify Backend is Running** ✅

Open in your browser:
```
https://agro-2.onrender.com/api/health
```

**Expected Response:**
```json
{
    "status": "AgroGuardian API Running",
    "version": "1.0.0"
}
```

**Status:** ✅ CONFIRMED (from Render dashboard)

---

## **STEP 2: Configure Frontend Environment Variables on Vercel**

### **2.1 Find Your Vercel Project**
1. Go to: https://vercel.com/dashboard
2. Look for your frontend project (likely named `agro-2` or `agro-frontend`)
3. Click on it

### **2.2 Add Environment Variable**
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **"Add New"** button

**Fill in these fields:**
```
Name: VITE_API_URL
Value: https://agro-2.onrender.com/api
Environments: Production, Preview, Development (select all)
```

4. Click **"Save"**

### **2.3 Check if More Variables Needed**
If your backend expects CORS to validate origin, also add:
```
Name: FRONTEND_URL
Value: https://<your-vercel-project-name>.vercel.app
```

To find your Vercel URL:
- Go to Vercel dashboard
- Find your project
- Look for a URL that looks like: `agro-2-wip0jram8-surya390d-glitchs-projects.vercel.app`
- Copy that and use it above

---

## **STEP 3: Redeploy Frontend on Vercel**

After setting environment variables, the frontend needs to rebuild:

### **Option A: Auto-Redeploy via Git (Easiest)**
```powershell
cd C:\Users\Surya\Desktop\Agro\frontend
git add .
git commit -m "Update: Configure Render API endpoint"
git push
```

Vercel will automatically redeploy when you push to GitHub.

### **Option B: Manual Redeploy in Vercel**
1. Go to Vercel dashboard → your project
2. Click **"Deployments"** tab (top)
3. Find the latest deployment
4. Click **"..."** menu → **"Redeploy"**

---

## **STEP 4: Verify Frontend Loads**

1. Open your Vercel frontend URL (something like `https://agro-2-....vercel.app`)
2. Page should load without errors
3. Right-click → **Inspect** → **Console** tab (F12)
4. Should **NOT** show red errors

---

## **STEP 5: Test Frontend → Backend Connectivity**

### **Test 5.1: Check Network Requests**
1. Open your Vercel frontend URL
2. Press **F12** to open Developer Tools
3. Click **Network** tab
4. Try any action that calls the API (login, fetch data, etc.)
5. Look for requests like:
   - `https://agro-2.onrender.com/api/auth/login`
   - `https://agro-2.onrender.com/api/crop`
   - etc.

**Status checks:**
- ✅ Requests showing? Good!
- ✅ Response status 200-299? Good!
- ❌ 404? → Check API route exists on backend
- ❌ 403? → CORS issue (see troubleshooting)
- ❌ No requests at all? → `VITE_API_URL` not set

### **Test 5.2: Quick API Test in Browser Console**
Open browser console (F12 → Console tab) and run:

```javascript
fetch('https://agro-2.onrender.com/api/health')
    .then(r => r.json())
    .then(d => console.log(d))
```

Should log:
```
{ status: "AgroGuardian API Running", version: "1.0.0" }
```

---

## **STEP 6: Test Critical User Flows**

### **Test Auth Flow (if you have login)**
1. Visit frontend
2. Try to login with test credentials
3. Check Network tab for `/api/auth/login` request
4. Should get 200 response + token

### **Test Data Fetch (if you have data)**
1. Navigate to any page that loads data
2. Check Network tab for `/api/crop`, `/api/weather`, etc.
3. Should get 200 response + data

### **Test Image Uploads (if applicable)**
1. Try uploading a file
2. Check Network tab for POST request to `/uploads`
3. Should get 200 response + file URL

---

## **TROUBLESHOOTING**

### **Problem: CORS Error in Console**

**Error message looks like:**
```
Access to XMLHttpRequest at 'https://agro-2.onrender.com/api/...' from origin 
'https://agro-2-xxx.vercel.app' has been blocked by CORS policy
```

**Solution:**
Update backend `index.js` to allow Vercel URL:

```javascript
// Around line 24 in index.js
const allowedOrigins = [
    'https://agro-2-wip0jram8-surya390d-glitchs-projects.vercel.app',  // <- Add your Vercel URL
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL  // This reads from .env
].filter(Boolean);
```

Then:
```powershell
git add .
git commit -m "Fix CORS: Add Vercel frontend URL"
git push
# Render auto-redeploys
```

---

### **Problem: 404 Error on API Calls**

**Symptoms:**
- Network tab shows 404 status
- Error: "Endpoint not found"

**Check:**
1. Is the route defined in backend? (e.g., `/api/crop` route)
2. Is backend running? (`https://agro-2.onrender.com/api/health` should work)
3. Is the frontend calling the correct URL? (should be `https://agro-2.onrender.com/api/...`)

---

### **Problem: 500 Error from Backend**

**Symptoms:**
- Network tab shows 500 status
- Error: "Internal server error"

**Check:**
1. Go to Render dashboard → Logs
2. Look for error messages
3. Common issues:
   - Database connection failed
   - Missing environment variable (e.g., JWT_SECRET)
   - Route handler crashed

---

### **Problem: Frontend Still Points to Localhost**

**Symptoms:**
- Network tab shows requests to `http://localhost:5000/api`
- But you're on Vercel URL (production)

**Fix:**
1. Verify `VITE_API_URL` is set in Vercel dashboard
2. Redeploy frontend
3. Check that `config.js` uses `import.meta.env.VITE_API_URL`

---

## **Final Checklist Before Going Live**

- [ ] Backend health check works: `https://agro-2.onrender.com/api/health`
- [ ] Frontend URL loads without console errors
- [ ] `VITE_API_URL` environment variable is set in Vercel
- [ ] Network requests go to `https://agro-2.onrender.com/api/...`
- [ ] At least one API endpoint returns correct data
- [ ] Login/auth works (if applicable)
- [ ] No CORS errors in console
- [ ] All critical user flows work end-to-end

---

## **Quick Reference Links**

| Service | URL | Status |
|---------|-----|--------|
| Backend | https://agro-2.onrender.com | ✅ Live |
| Health Check | https://agro-2.onrender.com/api/health | ✅ Live |
| Frontend | https://agro-2-wip0jram8-surya390d-glitchs-projects.vercel.app | ⏳ Needs config |
| GitHub (agra) | https://github.com/surya390d-glitch/agra | - |

---

## **Summary: 3 Actions Required**

1. **Set `VITE_API_URL` in Vercel** → Settings → Environment Variables
   - Value: `https://agro-2.onrender.com/api`

2. **Redeploy frontend** → Either via `git push` or manual redeploy

3. **Test** → Open frontend, check Network tab for API calls

**Expected result:** Frontend talks to backend seamlessly ✅

---

**Need help?** Run each test step and share the results. I'll diagnose any remaining issues! 🚀
