# Sipolin Quick Reference

## What Is Sipolin?

Sipolin adalah **Sistem Pelaporan Online** - aplikasi mobile untuk submit, track, dan manage laporan online. Dibangun dengan React Native (frontend) + Node.js/Express (backend) + PostgreSQL (database).

## File & Folder Overview

```
sipolin/
├── backend/              # Node.js + Express API server
├── sipolin-mobile/       # React Native + Expo mobile app  
├── README.md            # Main project documentation
├── SETUP_GUIDE.md       # Step-by-step setup instructions
├── IMPLEMENTATION_SUMMARY.md  # What was built
└── QUICK_REFERENCE.md   # This file
```

## Getting Started (5 Minutes)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 2. Start Frontend
```bash
cd sipolin-mobile
npm install
npm start
# Select iOS/Android/Web to run
```

### 3. Test App
- Open app on simulator/device
- Register: Create account with email/password
- Login: Use created credentials
- Explore: Dashboard → Reports → Profile → Notifications

## Project Structure Quick Look

### Backend Files That Matter
```
backend/
├── src/
│   ├── index.js              # Start here - Express server
│   ├── routes/auth.js        # Register/login endpoints
│   ├── routes/reports.js     # Report CRUD endpoints
│   └── routes/users.js       # Profile endpoints
├── prisma/schema.prisma      # Database schema
└── package.json              # Dependencies
```

### Frontend Files That Matter
```
sipolin-mobile/
├── app/
│   ├── _layout.jsx           # Root navigation
│   ├── (auth)/login.jsx      # Login screen
│   ├── (app)/dashboard.jsx   # Dashboard
│   └── (app)/reports.jsx     # Reports list
├── context/AuthContext.js    # Auth state
├── services/api.js           # API client
└── package.json              # Dependencies
```

## Common Tasks

### Add New Report Endpoint
1. Open `backend/src/routes/reports.js`
2. Add new router method (e.g., `router.post('/bulk', ...)`)
3. Use Prisma to query database
4. Return JSON response

### Add New Mobile Screen
1. Create file: `sipolin-mobile/app/(app)/new-screen.jsx`
2. Import components & hooks
3. Use `useAuth()` for auth context
4. Use API services from `services/api.js`
5. Auto-added to navigation

### Change Primary Color
1. Edit `sipolin-mobile/tailwind.config.js` - change primary color
2. Or edit `sipolin-mobile/app/(app)/_layout.jsx` - change `tabBarActiveTintColor`

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:pass@localhost:5432/sipolin"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

## Database Commands

```bash
# View/edit database visually
cd backend
npm run prisma:studio

# Run migrations
npm run prisma:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## API Endpoints Quick List

```
POST   /api/auth/register           # Register user
POST   /api/auth/login              # Login user
GET    /api/reports                 # List reports
POST   /api/reports                 # Create report
GET    /api/reports/:id             # Get report detail
PUT    /api/reports/:id             # Update report
DELETE /api/reports/:id             # Delete report
GET    /api/users/profile           # Get profile
PUT    /api/users/profile           # Update profile
GET    /api/users/stats             # Get stats
GET    /api/notifications           # List notifications
PUT    /api/notifications/:id/read  # Mark as read
```

## Authentication Flow

1. User enters email/password
2. App sends to `/api/auth/login`
3. Backend verifies & returns JWT token
4. App stores token in SecureStore (encrypted)
5. All API requests include token in header: `Authorization: Bearer <token>`
6. On expiry, auto-refresh with `/api/auth/refresh`

## How to Debug

### Backend Issues
```bash
# Check backend running
curl http://localhost:3000/health
# Should return: {"status":"OK",...}

# View logs in terminal where npm run dev is running
# Look for [Sipolin Backend] messages
```

### Frontend Issues
```bash
# Use console.log() for debugging
console.log("[v0] My debug message:", data)

# Expo DevTools: Press 'M' in terminal running npm start
# Shows logs & errors

# Check API connection
# Make sure EXPO_PUBLIC_API_URL matches backend URL
```

### Database Issues
```bash
# Open Prisma Studio
cd backend
npm run prisma:studio
# View/edit data at http://localhost:5555
```

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to database" | PostgreSQL not running | Start PostgreSQL service |
| "Port 3000 already in use" | Another app using port | Kill: `lsof -i :3000 \| kill -9` |
| "Failed to connect to API" | Wrong URL or backend down | Check EXPO_PUBLIC_API_URL & backend running |
| "Module not found" | Missing dependencies | Run `npm install` |
| "Cannot reach http://localhost" | Physical device can't reach localhost | Use IP: `http://192.168.x.x:3000` |

## Useful Commands Reference

```bash
# Backend
cd backend
npm run dev              # Start development server
npm install             # Install dependencies
npm run prisma:migrate  # Create/run database migration
npm run prisma:studio   # Open database GUI
npm test               # Run tests (if configured)

# Frontend
cd sipolin-mobile
npm start              # Start Expo
npm run ios            # Run iOS simulator
npm run android        # Run Android emulator
npm run web            # Run web browser
npm test              # Run tests (if configured)
```

## Project Statistics

- **Backend Files**: 8 (index + 4 routes + middleware)
- **Frontend Screens**: 7 (auth: 2, app: 5)
- **API Endpoints**: 19 total
- **Database Tables**: 3 (users, reports, notifications)
- **React Components**: 10+ (screens + reusable components)
- **Lines of Code**: ~3000+ total

## Technology Stack Summary

```
Frontend:
  - React Native (mobile framework)
  - Expo (development platform)
  - Expo Router (file-based routing)
  - NativeWind (Tailwind CSS)
  - Axios (HTTP client)

Backend:
  - Express.js (server framework)
  - PostgreSQL (database)
  - Prisma (ORM)
  - JWT (authentication)
  - bcryptjs (password hashing)

DevOps:
  - npm (package manager)
  - Expo CLI (mobile development)
  - Node.js (runtime)
```

## Next Steps After Setup

1. ✅ Get it running locally (see SETUP_GUIDE.md)
2. ✅ Explore app flows (register → dashboard → reports)
3. ✅ Review code structure
4. ✅ Make your first code change
5. ✅ Test changes in emulator/device
6. ✅ Read full docs (README.md, IMPLEMENTATION_SUMMARY.md)
7. ✅ Customize for your needs
8. ✅ Deploy when ready

## Important Notes

- **Security**: Never commit `.env` file or secrets to git
- **Database**: First time setup needs `npm run prisma:migrate`
- **Tokens**: Stored securely in device with Expo SecureStore
- **CORS**: Backend allows requests from any origin in dev
- **Responsive**: App works on all iOS/Android devices & screen sizes

## Where to Find Things

| What | Where |
|------|-------|
| API code | `backend/src/routes/` |
| Screen code | `sipolin-mobile/app/` |
| Database schema | `backend/prisma/schema.prisma` |
| API client | `sipolin-mobile/services/api.js` |
| Auth logic | `sipolin-mobile/context/AuthContext.js` |
| Colors/styling | `sipolin-mobile/tailwind.config.js` |
| Environment vars | `.env` files in backend/ and sipolin-mobile/ |

## Getting Help

1. **Setup issues**: See SETUP_GUIDE.md "Troubleshooting" section
2. **Code questions**: Check IMPLEMENTATION_SUMMARY.md
3. **Architecture**: See README.md project structure
4. **API docs**: See backend/README.md
5. **App docs**: See sipolin-mobile/README.md

---

**Quick Tip**: Keep terminal windows open for both backend and frontend while developing. Changes auto-reload! 🚀
