# Sipolin Setup Guide

Panduan lengkap untuk setup dan menjalankan Sipolin (Backend API + React Native Mobile App).

## Prerequisites

### Untuk Backend
- Node.js 16+ (Download dari [nodejs.org](https://nodejs.org))
- PostgreSQL 12+ (Download dari [postgresql.org](https://www.postgresql.org/download/))
- npm atau yarn package manager

### Untuk Frontend Mobile
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- Untuk iOS development: Xcode (Mac only)
- Untuk Android development: Android Studio + Android SDK
- Physical device atau emulator untuk testing

## Step-by-Step Setup

### 1. Clone/Download Repository

```bash
# Navigate ke folder project
cd /path/to/sipolin
```

### 2. Setup PostgreSQL Database

#### Mac (Using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Windows
- Download installer dari [postgresql.org](https://www.postgresql.org/download/windows/)
- Follow installation wizard

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Verify Installation
```bash
psql --version
psql -U postgres
```

### 3. Setup Backend API

#### 3.1 Navigate to backend folder
```bash
cd backend
```

#### 3.2 Install dependencies
```bash
npm install
```

#### 3.3 Create PostgreSQL database
```bash
psql -U postgres

# Inside psql shell:
CREATE DATABASE sipolin;
CREATE USER sipolinuser WITH PASSWORD 'your-password-here';
ALTER ROLE sipolinuser SET client_encoding TO 'utf8';
ALTER ROLE sipolinuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE sipolinuser SET default_transaction_deferrable TO on;
ALTER ROLE sipolinuser SET default_transaction_read_committed TO off;
GRANT ALL PRIVILEGES ON DATABASE sipolin TO sipolinuser;
\q
```

#### 3.4 Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` dengan database credentials:
```
DATABASE_URL="postgresql://sipolinuser:your-password-here@localhost:5432/sipolin"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3000
NODE_ENV=development
```

#### 3.5 Run database migration
```bash
npm run prisma:migrate

# Or initialize database
npx prisma migrate dev --name init
```

#### 3.6 Inspect database (optional)
```bash
npm run prisma:studio
# Opens Prisma Studio at http://localhost:5555
```

#### 3.7 Start backend server
```bash
npm run dev
```

Backend akan running di `http://localhost:3000`

### 4. Setup Frontend Mobile App

#### 4.1 Open new terminal, navigate to mobile folder
```bash
cd sipolin-mobile
```

#### 4.2 Install dependencies
```bash
npm install
```

#### 4.3 Setup environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

**Note:** Untuk testing di physical device, gunakan IP address machine Anda:
```
EXPO_PUBLIC_API_URL="http://192.168.x.x:3000"
```

#### 4.4 Start Expo development server
```bash
npm start
```

### 5. Run the Application

#### Option A: iOS Simulator (Mac only)
```bash
# In sipolin-mobile terminal
npm run ios
```

#### Option B: Android Emulator
```bash
# In sipolin-mobile terminal
npm run android
```

#### Option C: Web Browser
```bash
# In sipolin-mobile terminal
npm run web
```

#### Option D: Physical Device
1. Install Expo Go app dari App Store (iOS) atau Play Store (Android)
2. Scan QR code dari terminal output dengan Expo Go
3. App akan load di physical device

### 6. Test the Application

#### Test Login/Register
1. Open app di emulator/device
2. Register akun baru dengan email dan password
3. Login dengan credentials yang dibuat

#### Test Dashboard
- Lihat overview laporan dan statistik
- Check unread notifications counter

#### Test Reports
- Create new report
- View report list dengan filtering
- Edit draft report
- Delete report

#### Test Profile
- View user profile
- Edit profile information
- Logout

### 7. Development Workflow

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd sipolin-mobile
npm start
```

Setiap perubahan file akan otomatis reload (HMR).

## Environment Setup Details

### Backend Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/sipolin |
| JWT_SECRET | Secret key for JWT tokens | your-super-secret-key |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development, production |

### Frontend Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| EXPO_PUBLIC_API_URL | Backend API URL | http://localhost:3000 |

## Troubleshooting

### PostgreSQL Issues

**Error: "role postgres does not exist"**
```bash
# Mac
brew services stop postgresql@15

# Or manually reset
dropdb --if-exists sipolin
```

**Error: "database "sipolin" does not exist"**
```bash
# Recreate database
psql -U postgres -c "CREATE DATABASE sipolin;"
```

**Cannot connect to database**
```bash
# Check if PostgreSQL is running
# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# Windows:
# Check Services app
```

### Backend Issues

**Error: "Port 3000 already in use"**
```bash
# Kill process using port 3000
# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Error: "Cannot find module..."**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Error: "Failed to connect to API"**
1. Verify backend is running: `http://localhost:3000/health`
2. Check EXPO_PUBLIC_API_URL in .env
3. For physical device: use IP address instead of localhost
4. Check network connectivity

**Error: "Module not found in Babel"**
```bash
# Clear cache
expo cache:clear

# Reinstall
rm -rf node_modules
npm install

# Restart
npm start -c
```

**Emulator Issues**

iOS Simulator not starting:
```bash
# Kill any existing processes
pkill -9 com.apple.CoreSimulator

# Start again
npm run ios
```

Android Emulator not starting:
1. Open Android Studio
2. Go to AVD Manager
3. Create/Start emulator
4. Then run `npm run android`

## Database Schema

All tables and schema are auto-created with Prisma migration. View schema at `backend/prisma/schema.prisma`.

### Tables Created:
- `users` - User accounts
- `reports` - Report submissions
- `notifications` - User notifications

## API Health Check

```bash
# Test backend is running
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Getting Help

### Common Issues

1. **"Cannot reach API"** - Check backend running and URL is correct
2. **"Database connection failed"** - Check PostgreSQL running and credentials correct
3. **"Module errors"** - Clear cache: `expo cache:clear` and `npm install`

### Useful Commands

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio

# Frontend
cd sipolin-mobile
npm start              # Start Expo dev server
expo cache:clear       # Clear Expo cache
npm install           # Reinstall dependencies
```

## Next Steps

1. ✅ Setup complete! Start coding
2. Read main [README.md](./README.md) for project structure
3. Review backend [README.md](./backend/README.md) for API docs
4. Review mobile [README.md](./sipolin-mobile/README.md) for app docs

---

**Selamat! Sipolin siap untuk dikembangkan! 🚀**
