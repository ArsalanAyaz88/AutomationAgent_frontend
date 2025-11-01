# 🐛 Error Debugging Guide - 500 Error Fix

## Current Issue
Backend se 500 error aa raha hai jab frontend request bhejta hai.

## Improved Error Handling

Maine ab better error logging add kar di hai to see exact error:

### Frontend Changes
✅ Console me ab detailed logs dikhenge:
- Request data
- Response status  
- Actual error message from backend
- Stack trace

### How to Debug

#### Step 1: Check Console Logs
Browser console (F12) me ye dikhega:
```
🚀 API Call to: http://localhost:8000/api/agent1/audit-channel
📦 Request data: {
  "channel_urls": [],
  "user_query": "hi"
}
📡 Response status: 500 Internal Server Error
❌ Error response body: {"detail": "actual error message"}
```

#### Step 2: Check Backend Logs
Backend terminal me error dikhega:
```
INFO:     127.0.0.1:52240 - "POST /api/agent1/audit-channel HTTP/1.1" 500
ERROR:    Exception in ASGI application
Traceback...
```

---

## Common Causes & Solutions

### 1. Backend Not Running
**Error**: `Failed to fetch` or `NetworkError`

**Solution**:
```bash
cd d:/Mission/youtube/Backend
python -m uvicorn main:app --reload
```

### 2. Environment Variables Missing
**Error**: `Missing configuration for agent1`

**Solution**: Check `.env` file has:
```
GEMINI_BASE_URL=...
GEMINI_API_KEY=...
GEMINI_MODEL_NAME=...
YOUTUBE_API_KEY=...
```

### 3. MCP Server Path Issue
**Error**: `Cannot find module` or `ENOENT`

**Solution**: Verify path in `main.py`:
```python
"args": ["./channel_auditor_agent_1/youtube-mcp-server/dist/cli.js"]
```

### 4. Node Dependencies Missing
**Error**: `node: command not found` or module errors

**Solution**:
```bash
cd d:/Mission/youtube/Backend/channel_auditor_agent_1/youtube-mcp-server
npm install
```

### 5. Empty Input Handling
**Error**: Agent crashes on empty `channel_urls: []`

**Solution**: Backend ab empty arrays handle karega with conversation mode

---

## Testing Steps

### 1. Start Backend
```bash
cd d:/Mission/youtube/Backend
python -m uvicorn main:app --reload --log-level debug
```

### 2. Test Backend Directly
```bash
# Test with empty array (conversation mode)
curl -X POST http://localhost:8000/api/agent1/audit-channel \
  -H "Content-Type: application/json" \
  -d '{
    "channel_urls": [],
    "user_query": "What makes a successful YouTube channel?"
  }'

# Test with channel URL
curl -X POST http://localhost:8000/api/agent1/audit-channel \
  -H "Content-Type: application/json" \
  -d '{
    "channel_urls": ["https://youtube.com/@mrbeast"],
    "user_query": "Analyze this channel"
  }'
```

### 3. Start Frontend
```bash
cd d:/Mission/youtube/frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
npm run dev
```

### 4. Test in Browser
1. Open http://localhost:3000
2. Click Agent 1
3. Type: "hi"
4. Check browser console (F12)
5. Check backend terminal

---

## Expected Console Output

### Success Case
```
📍 Channel Auditor - Input: What makes a successful channel?
🔗 Extracted URLs: []
🚀 API Call to: http://localhost:8000/api/agent1/audit-channel
📦 Request data: {
  "channel_urls": [],
  "user_query": "What makes a successful channel?"
}
📡 Response status: 200 OK
✅ Success response: {
  "success": true,
  "result": "Great question! Successful channels...",
  "error": null
}
✅ Backend response: { success: true, result: "..." }
```

### Error Case
```
📍 Channel Auditor - Input: hi
🔗 Extracted URLs: []
🚀 API Call to: http://localhost:8000/api/agent1/audit-channel
📦 Request data: {
  "channel_urls": [],
  "user_query": "hi"
}
📡 Response status: 500 Internal Server Error
❌ Error response body: {"detail": "Missing environment variable: GEMINI_API_KEY"}
🔴 Backend error: Missing environment variable: GEMINI_API_KEY
```

---

## Quick Fixes

### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
cd d:/Mission/youtube/Backend
python -m uvicorn main:app --reload
```

### Fix 2: Check Environment
```bash
cd d:/Mission/youtube/Backend
cat .env  # or type .env on Windows
```

### Fix 3: Verify Dependencies
```bash
cd d:/Mission/youtube/Backend
pip install -r pyproject.toml
```

### Fix 4: Test Health Endpoint
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

---

## Error Messages Decoded

### `Failed to fetch`
→ Backend not running or wrong URL

### `API Error 500: Missing configuration`
→ Environment variables missing in `.env`

### `API Error 500: Cannot find module`
→ MCP server not installed or wrong path

### `API Error 500: ENOENT`
→ File or directory not found

### `API Error 500: YouTube API quota exceeded`
→ YouTube API daily limit reached

---

## Current Status

✅ **Improved Error Handling**
- Detailed console logs
- Actual error messages shown
- Better user feedback

✅ **User-Friendly Fallbacks**
- Helpful guidance when errors occur
- Examples of what to try
- Technical details for debugging

⚠️ **Next Step**: Run the app and check console for actual error!

---

## How to Get Support

1. **Check Console**: Browser F12 → Console tab
2. **Check Backend**: Backend terminal logs
3. **Copy Error**: Full error message from both
4. **Provide Context**: What were you trying to do?

---

## Test Now!

```bash
# Terminal 1: Backend
cd d:/Mission/youtube/Backend
python -m uvicorn main:app --reload

# Terminal 2: Frontend  
cd d:/Mission/youtube/frontend
npm run dev

# Browser: http://localhost:3000
# Click Agent 1 → Type "hi" → Check console
```

**Ab console me exact error dikhega! Copy karein aur batayein.** 🔍
