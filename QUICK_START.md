# Quick Start Guide 🚀

## Current Setup

✅ **Default Backend:** `https://automation-agent-backend.vercel.app` (Production)  
✅ **API Client:** Fully configured in `src/lib/api.ts`  
✅ **Health Check:** Automatic monitoring every 30 seconds  

## Switch Between Local & Production

### Option 1: Test Locally (Recommended for Development)

**Step 1 - Create .env.local:**
```bash
copy env.local.example .env.local
```

**Step 2 - Edit .env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 3 - Start Dev Server:**
```bash
npm run dev
```

✅ **Your frontend now connects to local backend at http://localhost:8000**

---

### Option 2: Use Production Backend

**Remove .env.local (if it exists):**
```bash
del .env.local
```

**Start Dev Server:**
```bash
npm run dev
```

✅ **Your frontend now connects to production at https://automation-agent-backend.vercel.app**

---

## Quick Commands Reference

```bash
# SWITCH TO LOCAL BACKEND
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
npm run dev

# SWITCH TO PRODUCTION BACKEND  
del .env.local
npm run dev

# CHECK CURRENT BACKEND URL
# Look at top-right corner of app - API status indicator
# OR check browser console for API calls
```

---

## Workflow for Testing

### 1️⃣ **Local Development & Testing**
```bash
# Terminal 1: Start Backend (in Backend directory)
cd d:/Mission/youtube/Backend
python -m uvicorn main:app --reload

# Terminal 2: Start Frontend with LOCAL backend
cd d:/Mission/youtube/frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
npm run dev
```

Visit: http://localhost:3000  
Backend: http://localhost:8000

---

### 2️⃣ **Test with Production Backend**
```bash
cd d:/Mission/youtube/frontend
del .env.local
npm run dev
```

Visit: http://localhost:3000  
Backend: https://automation-agent-backend.vercel.app

---

### 3️⃣ **Deploy to Production**
```bash
# Make sure .env.local is deleted (not committed)
git add .
git commit -m "Ready for deployment"
git push
```

When deployed, it will automatically use the production backend URL.

---

## Verify Connection

1. Open http://localhost:3000
2. Check top-right corner for API status:
   - 🟢 **API: ONLINE** = Connected
   - 🔴 **API: OFFLINE** = Disconnected
   - 🟠 **API: CHECKING** = Testing connection

3. Open browser console (F12) to see API calls

---

## Files You Can Safely Ignore in Git

`.env.local` is already gitignored, so you can:
- ✅ Create/delete it freely
- ✅ Switch between local and production
- ✅ It won't be committed to Git

---

## Need Help?

- **Full Documentation:** See `BACKEND_INTEGRATION.md`
- **API Examples:** See `BACKEND_INTEGRATION.md` (Agent Functions section)
- **Environment Config:** See `env.local.example`
