# Sipolin Backend API

Backend API untuk aplikasi Sipolin dengan Express.js dan PostgreSQL.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup database:
```bash
cp .env.example .env
# Edit .env dengan database URL Anda
npm run prisma:migrate
```

3. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports` - Get all user reports
- `GET /api/reports/:id` - Get report detail
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
