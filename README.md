# Sipolin - Sistem Pelaporan Online

Sipolin adalah aplikasi mobile lengkap untuk manajemen laporan online dengan fitur authentication, report management, user profiles, dan real-time notifications.

## Arsitektur Project



const API_BASE_URL = 'http://192.168.0.105:3000';

Proyek ini adalah monorepo dengan dua bagian utama:

### 1. Backend API (`/backend`)
- **Stack**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Port**: 3000 (default)

### 2. Frontend Mobile (`/sipolin-mobile`)
- **Stack**: React Native + Expo
- **Routing**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **HTTP Client**: Axios

## Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan PostgreSQL connection string dan JWT_SECRET

# Run database migration
npm run prisma:migrate

# Start development server
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

### Frontend Setup

```bash
cd sipolin-mobile

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Pastikan EXPO_PUBLIC_API_URL sesuai dengan backend URL

# Start Expo development server
npm start

# Run on platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

## Project Structure

```
sipolin/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry point
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   └── routes/
│   │       ├── auth.js           # Authentication routes
│   │       ├── reports.js        # Report CRUD routes
│   │       ├── users.js          # User profile routes
│   │       └── notifications.js  # Notifications routes
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── package.json
│   └── README.md
│
├── sipolin-mobile/
│   ├── app/
│   │   ├── (auth)/               # Authentication screens
│   │   ├── (app)/                # Main app screens
│   │   └── _layout.jsx           # Root layout
│   ├── context/
│   │   └── AuthContext.js        # Auth context & hooks
│   ├── services/
│   │   └── api.js                # API client & services
│   ├── app.json                  # Expo config
│   ├── package.json
│   └── README.md
│
└── README.md                      # This file
```

## Key Features

### Authentication
- User registration dengan validasi email
- Login dengan email & password
- JWT token-based authentication
- Secure token storage di device
- Automatic token refresh

### Reports Management
- Create reports dengan title, description, category, priority
- List reports dengan filtering dan searching
- View detail laporan lengkap
- Update draft reports
- Delete reports
- Track report status (draft, submitted, reviewed, approved, rejected)

### User Profile
- View & edit profil user
- Manage personal information
- Role-based access control
- Account status tracking

### Dashboard
- Overview statistik laporan
- Recent reports preview
- Unread notifications counter
- Quick actions untuk create report

### Notifications
- Real-time notifications
- Mark as read/unread
- Delete notifications
- Notification types (report_update, approval, system)

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- email (Unique)
- password (Hashed)
- name
- phone (Optional)
- department (Optional)
- avatar (Optional)
- role (default: 'user')
- isActive (default: true)
- createdAt, updatedAt
```

### Reports Table
```sql
- id (UUID, Primary Key)
- title
- description
- category
- status (draft, submitted, reviewed, approved, rejected)
- priority (low, medium, high, critical)
- userId (Foreign Key)
- attachments (Array of file paths)
- comments
- reviewedBy (Optional)
- reviewedAt (Optional)
- createdAt, updatedAt
```

### Notifications Table
```sql
- id (UUID, Primary Key)
- title
- message
- type (report_update, approval, system)
- isRead (default: false)
- userId (Foreign Key)
- relatedReportId (Optional)
- createdAt
```

## API Endpoints

### Authentication
```
POST   /api/auth/register        # Register user
POST   /api/auth/login           # Login user
POST   /api/auth/refresh         # Refresh token
```

### Reports
```
POST   /api/reports              # Create report
GET    /api/reports              # List user reports (with filters)
GET    /api/reports/:id          # Get report detail
PUT    /api/reports/:id          # Update report
DELETE /api/reports/:id          # Delete report
```

### Users
```
GET    /api/users/profile        # Get user profile
PUT    /api/users/profile        # Update profile
GET    /api/users/stats          # Get user statistics
```

### Notifications
```
GET    /api/notifications        # List notifications
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/:id    # Delete notification
```

## Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd sipolin-mobile
npm start
```

### Making Changes

1. **Backend Changes**: Restart server automatically dengan `--watch` flag
2. **Frontend Changes**: HMR (Hot Module Replacement) akan auto-reload
3. **Database Changes**: Update schema dan run `npm run prisma:migrate`

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/sipolin"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

## Security Features

- Password hashing dengan bcryptjs
- JWT token authentication
- Secure token storage (Expo SecureStore)
- Input validation & sanitization
- Authorization checks per route
- CORS configuration
- Environment variables untuk sensitive data

## Performance Considerations

- Token caching & refresh strategy
- API response caching dengan axios
- Efficient database queries dengan Prisma
- Image optimization untuk attachments
- Pagination untuk reports list
- Lazy loading screens dengan React Router

## Testing

```bash
# Backend testing (setup needed)
cd backend
npm test

# Frontend testing (setup needed)
cd sipolin-mobile
npm test
```

## Deployment

### Backend Deployment (Example: Heroku)
```bash
cd backend
heroku create sipolin-api
git push heroku main
heroku config:set DATABASE_URL="your-postgresql-url"
heroku config:set JWT_SECRET="your-secret"
```

### Frontend Deployment (Expo)
```bash
cd sipolin-mobile
eas build --platform all
eas submit --platform all
```

## Troubleshooting

### Backend Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify JWT_SECRET is set
- Check API logs: `npm run dev`

### Frontend Issues
- Ensure backend is running
- Check EXPO_PUBLIC_API_URL
- Clear Expo cache: `expo cache:clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Issues
- Reset database: `npx prisma migrate reset`
- Inspect database: `npm run prisma:studio`
- Check connection: `psql $DATABASE_URL`

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes & test thoroughly
3. Commit with clear messages: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

## License

MIT License

## Support

Untuk masalah atau pertanyaan, buat issue di repository atau hubungi tim support.

---

**Selamat menggunakan Sipolin!** 🚀
