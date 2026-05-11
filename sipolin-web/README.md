# Sipolin – Deployment Guide

---

## Directory Map

```
sipolin/
├── landing/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.ts
│       └── style.css
│
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── Procfile
│   ├── .env.example
│   └── prisma/
│       └── schema.prisma
│
└── mobile/
    ├── .env.example
    └── src/
        ├── services/
        │   └── api.js
        ├── hooks/
        │   └── useSocket.js
        └── app/
            └── _layout.jsx
```

---

## Part 1 – Landing Page (Vite + TS + Tailwind + GSAP)

```bash
cd landing
cp .env.example .env          # fill in values
npm install
npm run dev                   # http://localhost:5173
npm run build                 # output → dist/
```

### Deploy to Vercel
```bash
npm i -g vercel
cd landing
vercel --prod
# Set env vars in Vercel dashboard (VITE_*)
```

### Deploy to Netlify
```bash
# Build command: npm run build
# Publish directory: dist
# Add VITE_* env vars in Netlify UI
```

---

## Part 2 – Backend (Node.js + Express + Prisma)

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma generate
npx prisma migrate deploy     # run against your PostgreSQL
npm run dev                   # http://localhost:5000
```

### Health check
```
GET /health → { status: "ok", ... }
```

### Deploy to Railway
1. Push backend to GitHub repo
2. New project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Railway auto-detects Node.js — it will run `npm start`
5. Add PostgreSQL plugin in Railway → copy `DATABASE_URL` to env vars

### Deploy to Render
1. New Web Service → connect GitHub repo
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start command: `node index.js`
4. Add environment variables in Render dashboard
5. Add PostgreSQL database → copy `DATABASE_URL` to env vars

### Deploy to Heroku
```bash
heroku create sipolin-backend
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production JWT_SECRET=your-secret CORS_ORIGINS=https://sipolin.com,...
git push heroku main
# Procfile handles: npx prisma migrate deploy && node index.js
```

---

## Part 3 – Mobile (Expo)

```bash
cd mobile
cp .env.example .env.local    # fill in API URLs
npm install
npx expo start
```

### Required packages (add to mobile/package.json)
```bash
npx expo install expo-router @react-native-async-storage/async-storage socket.io-client
```

### EAS Build (production)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios / all
eas submit                     # submit to stores
```

---

## Environment Variables Reference

### Landing (`landing/.env`)
| Key | Description |
|-----|-------------|
| `VITE_APP_NAME` | App name |
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_SOCKET_URL` | Socket.IO URL |
| `VITE_DOWNLOAD_ANDROID_URL` | Play Store link |
| `VITE_DOWNLOAD_IOS_URL` | App Store link |

### Backend (`backend/.env`)
| Key | Description |
|-----|-------------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Server port (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection (for migrations) |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `SOCKET_CORS_ORIGINS` | Comma-separated allowed socket origins |

### Mobile (`mobile/.env.local`)
| Key | Description |
|-----|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL |
| `EXPO_PUBLIC_SOCKET_URL` | Socket.IO URL |
