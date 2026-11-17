# FinWise Deployment Guide (Render + MongoDB Atlas)

This guide shows you how to deploy the **AI-Powered Personal Financial Planning Advisor (FinWise)** to the web for free.

---

## 1. Environment Variables Reference

Here is every setting needed for each of the three services:

### Service 1: Python ML Microservice (`finwise-ml`)
| Variable | Example Value | Where to Get It / What It Means |
|---|---|---|
| `PORT` | `8000` | Set automatically by Render (do not change) |
| `PYTHON_VERSION` | `3.11.8` | Tells Render which Python runtime to install |
| `ML_MODEL_VERSION` | `1.0.0` | Model version label for health and metrics |

---

### Service 2: Node.js API Backend (`finwise-api`)
| Variable | Example Value | Where to Get It / What It Means |
|---|---|---|
| `PORT` | `5000` | Set automatically by Render |
| `NODE_ENV` | `production` | Enables production cookies, caching, and security checks |
| `MONGODB_URI` | `mongodb+srv://finwise_user:SecretPass123@cluster0.abcde.mongodb.net/financial_advisor?retryWrites=true&w=majority` | From your MongoDB Atlas free cluster (Connection string) |
| `JWT_SECRET` | `a-very-long-random-string-at-least-32-characters-secure` | Any random string. Render can generate this automatically. |
| `JWT_ACCESS_EXPIRY` | `15m` | Lifetime of user login access token |
| `JWT_REFRESH_EXPIRY` | `7d` | Lifetime of refresh token in secure cookie |
| `CLIENT_URL` | `https://finwise-web.onrender.com` | Your deployed frontend static site URL (no trailing slash) |
| `CORS_ORIGIN` | `https://finwise-web.onrender.com` | Automatically matches `CLIENT_URL` |
| `ML_SERVICE_URL` | `https://finwise-ml.onrender.com` | The public URL of your deployed Python ML service |
| `ML_SERVICE_TIMEOUT` | `15000` | Timeout in milliseconds before falling back to rule engine |
| `GEMINI_API_KEY` | `AIzaSy...` (secret) | From [Google AI Studio](https://aistudio.google.com). Leave empty to run Fin in basic mode. |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Fast, free-tier Flash model for Fin AI Chatbot |
| `FEATURE_GEMINI_AI_CHAT` | `true` | Feature flag: set `false` to switch off AI bot and use rule-based Fin |
| `FEATURE_FUTURE_LIFE_PLAN` | `true` | Feature flag: enables Future Life Plan & Readiness Ladder |

---

### Service 3: React Frontend (`finwise-web`)
| Variable | Example Value | Where to Get It / What It Means |
|---|---|---|
| `VITE_API_URL` | `https://finwise-api.onrender.com` | The public URL of your deployed Node.js backend (no trailing slash) |

---

## 2. MongoDB Atlas Setup (Step-by-Step)

1. **Create an account:** Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. **Build a free cluster:**
   - Choose **M0 (Free)**.
   - Choose your nearest cloud region (e.g. AWS `ap-south-1` Mumbai).
   - Click **Create Deployment**.
3. **Create Database User:**
   - Username: `finwise_user`
   - Password: Click **Autogenerate Secure Password** or pick one.
   - ⚠️ **Important:** If your password has special symbols like `@`, `#`, `:`, `/`, or `%`, you **must URL-encode them** (for example `@` becomes `%40`, `#` becomes `%23`). If you do not want to encode, use only letters and numbers (like `FinwiseAtlas2026Pass`).
4. **Configure Network Access (IP Whitelist):**
   - In Atlas left sidebar, go to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. (Render free web services use changing IP addresses, so `0.0.0.0/0` is required).
5. **Copy the Connection String:**
   - Go to **Database** → Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the URI string:
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
   - Add your database name `/financial_advisor` right before the `?` mark:
     `mongodb+srv://finwise_user:YOUR_PASSWORD@cluster0.abcde.mongodb.net/financial_advisor?retryWrites=true&w=majority`
6. **Seed demo data into Atlas:**
   Run from your computer terminal:
   ```bash
   cd server
   MONGODB_URI="your-atlas-uri-here" npm run seed
   ```
   This populates the Saver, Balanced, and Overspender demo accounts with realistic Indian financial histories!

---

## 3. Render Deployment Order

Deploy in this exact order so each service can link to the one before it:

```mermaid
flowchart LR
    A["Step 1: Python ML Service<br/>(finwise-ml)"] --> B["Step 2: Node API Backend<br/>(finwise-api)"]
    B --> C["Step 3: React Static Site<br/>(finwise-web)"]
    C -.->|"Set CLIENT_URL & Redeploy"| B
```

### Step 1: Deploy ML Microservice (`finwise-ml`)
- In Render Dashboard, click **New +** → **Web Service**.
- Connect your GitHub repository: `ai-financial-planning-advisor`.
- Fill in the exact settings:
  - **Name:** `finwise-ml`
  - **Region:** Oregon (US West) or Frankfurt
  - **Root Directory:** `ml-service`
  - **Runtime:** `Python 3`
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Instance Type:** `Free` (512 MB RAM)
- Add Environment Variable:
  - `PYTHON_VERSION` = `3.11.8`
- Click **Create Web Service**.
- Wait 2–3 minutes until the logs show `All models loaded successfully`.
- Copy your ML URL (e.g. `https://finwise-ml.onrender.com`).

---

### Step 2: Deploy Node.js Backend API (`finwise-api`)
- Click **New +** → **Web Service**.
- Connect the same repository.
- Fill in the settings:
  - **Name:** `finwise-api`
  - **Region:** Same region as ML service
  - **Root Directory:** `server`
  - **Runtime:** `Node`
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`
  - **Instance Type:** `Free`
- Add Environment Variables:
  - `NODE_ENV` = `production`
  - `MONGODB_URI` = `(Your MongoDB Atlas connection string from Section 2)`
  - `JWT_SECRET` = `(Click 'Generate' in Render or enter 32 random characters)`
  - `ML_SERVICE_URL` = `(Your ML service URL from Step 1, e.g. https://finwise-ml.onrender.com)`
  - `ML_SERVICE_TIMEOUT` = `15000`
  - `CLIENT_URL` = `http://localhost:5173` *(Temporary placeholder; we update this after Step 3)*
- Click **Create Web Service**.
- Copy your API URL (e.g. `https://finwise-api.onrender.com`).

---

### Step 3: Deploy React Frontend (`finwise-web`)
- Click **New +** → **Static Site**.
- Connect the same repository.
- Fill in the settings:
  - **Name:** `finwise-web`
  - **Root Directory:** `client`
  - **Build Command:** `npm install && npm run build`
  - **Publish Directory:** `dist`
- Add Environment Variable:
  - `VITE_API_URL` = `(Your Node.js API URL from Step 2, e.g. https://finwise-api.onrender.com)`
- In **Redirects / Rewrites** tab:
  - Add Rule: `/*` → `/index.html` (Type: **Rewrite**)
  - *(This prevents 404 errors when refreshing React Router pages!)*
- Click **Create Static Site**.
- Copy your live frontend URL (e.g. `https://finwise-web.onrender.com`).

---

### Step 4: Final Connection (Connect Backend to Frontend)
- Go back to your **`finwise-api`** Web Service in Render.
- Click **Environment**.
- Update:
  - `CLIENT_URL` = `https://finwise-web.onrender.com`
  - `CORS_ORIGIN` = `https://finwise-web.onrender.com`
- Click **Save Changes** (Render will automatically redeploy the backend in 30 seconds).

🎉 **Your entire full-stack system is now live on the web!**

---

## 4. Alternative: Deploy with `render.yaml` (Blueprint)

The repository includes a ready-to-use `render.yaml` file:
1. In Render Dashboard, click **Blueprints** → **New Blueprint Instance**.
2. Select the repository.
3. Render reads `render.yaml` and prepares all three services together.
4. Fill in the prompted secret values (`MONGODB_URI` and `CLIENT_URL`), then click **Apply**.

---

## 5. Troubleshooting & "If Something Fails" Table

| Problem | Cause | How to Fix in 1 Minute |
|---|---|---|
| **CORS error in browser console** | `CLIENT_URL` on the backend does not match the frontend URL | Open Render `finwise-api` → Environment. Make sure `CLIENT_URL` exactly matches `https://your-app.onrender.com` with no slash `/` at the end. |
| **Login works, but refreshing logs out (cookie not saved)** | Cross-origin cookie blocked or `trust proxy` missing | We have fixed `app.set('trust proxy', 1)` in code. Verify your frontend connects over `https://` and `NODE_ENV=production` is set on the backend. |
| **"Could not connect to MongoDB"** | Atlas IP whitelist or password URL-encoding | 1. Go to Atlas → Network Access → Ensure `0.0.0.0/0` is active.<br/>2. If password has `@` or `#`, encode them (e.g. `@` → `%40`) or change password to plain letters and numbers. |
| **404 Not Found when reloading `/dashboard` or `/student`** | React Router client-side routing | Go to Render `finwise-web` → Settings → **Redirects/Rewrites**. Add rewrite rule from `/*` to `/index.html`. |
| **ML Service Out of Memory (OOM)** | Free instance limit is 512 MB RAM | The ML service runs inference-only (FastAPI + scikit-learn + joblib). It uses ~180 MB. Ensure training scripts are not run on the free web service. |
| **First request takes 50 seconds** | Render Free Web Services sleep after 15 minutes of inactivity | This is normal behavior for free hosting. The first ping wakes the service. Subsequent requests take less than 100 ms. |

---

## 6. Viva-Day Presentation Checklist

Before walking into your viva or final project presentation:

- [ ] **10 Minutes Before:** Open both `https://finwise-ml.onrender.com/health` and `https://finwise-api.onrender.com/health` in your browser. This wakes the free servers from sleep so the live presentation feels instantaneous.
- [ ] **Database Verification:** Verify demo accounts can log in (`saver.demo@finwise.com`, `balanced.demo@finwise.com`, `overspender.demo@finwise.com`).
- [ ] **Backup Offline Demo Mode:** If campus Wi-Fi drops, FinWise includes an automatic client-side demo mode that loads realistic persona records directly in the browser.
- [ ] **Local Backup Ready:** Keep a local copy running on your laptop (`npm run dev`) as the ultimate fallback in case venue internet fails.
