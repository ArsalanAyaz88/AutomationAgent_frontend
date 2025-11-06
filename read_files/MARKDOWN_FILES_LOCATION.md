# 📝 Markdown Files Location Policy

## ⚠️ IMPORTANT: File Organization Rule

**All markdown documentation files MUST be created in the `read_files/` folder.**

---

## 📂 Where to Put Markdown Files

### ✅ Correct Location:
```
frontend/read_files/
├── YOUR_NEW_DOC.md          ✅ Create here
├── FEATURE_GUIDE.md         ✅ Create here
├── SETUP_INSTRUCTIONS.md    ✅ Create here
└── ...
```

### ❌ Wrong Location:
```
frontend/
├── YOUR_NEW_DOC.md          ❌ Don't create here
├── FEATURE_GUIDE.md         ❌ Don't create here
└── ...
```

### Exception:
```
frontend/
└── README.md                ✅ ONLY this file stays in root (for GitHub)
```

---

## 🎯 Why This Convention?

### 1. **Better Organization** ✅
- All documentation in one place
- Cleaner root directory
- Easier to find docs

### 2. **Reduced Deployment Size** ✅
- Documentation excluded from production builds
- Faster deployment times
- Smaller bundle size

### 3. **Consistency** ✅
- Matches backend structure (`Backend/readme_files/`)
- Clear separation of docs vs code
- Professional project structure

---

## 📋 Checklist for Creating New Docs

When creating a new markdown file:

- [ ] Navigate to `frontend/read_files/`
- [ ] Create your `.md` file there
- [ ] Update `read_files/README.md` with new file info
- [ ] **DO NOT** create `.md` files in frontend root (except README.md)

---

## 📁 Current File Organization

```
frontend/
├── read_files/              📚 All documentation here
│   ├── README.md
│   ├── AGENT_USAGE_GUIDE.md
│   ├── BACKEND_INTEGRATION.md
│   ├── CHATBOT_IMPLEMENTATION.md
│   ├── CONVERSATIONAL_AGENTS.md
│   ├── DYNAMIC_AGENTS_UPDATE.md
│   ├── QUICK_START.md
│   ├── RL_SYSTEM_INTEGRATION.md
│   └── TEST_ERROR_DEBUG.md
│
├── src/                     💻 Source code
├── public/                  🖼️  Static assets
├── package.json            📦 Dependencies
├── README.md               ✅ Main readme (only MD in root)
└── ...
```

---

## 🔧 For Developers

### Creating Documentation:
```bash
# Navigate to read_files
cd frontend/read_files

# Create your documentation
# (Use your editor or command line)
echo "# My New Feature" > MY_FEATURE.md
```

### Updating Docs:
```bash
# Edit existing docs in read_files
cd frontend/read_files
# Edit the file
```

---

## 🚫 What NOT to Do

### Don't:
- ❌ Create `.md` files in `frontend/` root
- ❌ Create documentation folders elsewhere
- ❌ Scatter docs across multiple locations

### Do:
- ✅ Create all docs in `frontend/read_files/`
- ✅ Keep one centralized documentation folder
- ✅ Follow the organization pattern

---

## 🎉 Benefits

### For You:
- ✅ Easy to find all documentation
- ✅ Clean project structure
- ✅ Professional organization

### For Team:
- ✅ Consistent location for all docs
- ✅ No confusion about where to look
- ✅ Better onboarding experience

### For Deployment:
- ✅ Smaller production builds
- ✅ Faster deployment
- ✅ Optimized bundle size

---

## 📚 Quick Reference

**Question:** Where do I create a new `.md` file?  
**Answer:** In `frontend/read_files/`

**Question:** Can I create `.md` in the root?  
**Answer:** No, except `README.md` which is already there.

**Question:** Where are all the docs?  
**Answer:** In `frontend/read_files/`

---

## ✅ Summary

**Rule:** All markdown files go in `read_files/`  
**Exception:** `README.md` stays in root  
**Reason:** Organization, consistency, optimization  

---

**Remember: `read_files/` for all documentation!** 📚

*Last Updated: November 6, 2025*
