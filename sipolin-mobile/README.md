# Sipolin Mobile App

Aplikasi mobile untuk Sipolin (Sistem Pelaporan Online) dibangun dengan React Native dan Expo.

## Prerequisites

- Node.js 16 atau lebih tinggi
- npm atau yarn package manager
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (untuk development iOS)
- Android: Android Studio dan Android SDK (untuk development Android)

## Setup

1. Install dependencies:
```bash
cd sipolin-mobile
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env dengan API_URL Anda
```

3. Start development server:
```bash
npm start
```

4. Run on platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
sipolin-mobile/
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── (app)/               # Main app screens
│   │   ├── dashboard.jsx
│   │   ├── reports.jsx
│   │   ├── profile.jsx
│   │   └── reports/
│   │       ├── create.jsx
│   │       └── [id].jsx
│   └── _layout.jsx          # Root layout
├── context/
│   └── AuthContext.js       # Authentication context
├── services/
│   └── api.js               # API service layer
└── package.json
```

## Key Features

- **Authentication**: Login & Registration dengan JWT
- **Dashboard**: Overview laporan dan statistik
- **Reports Management**: Create, list, view, update, delete laporan
- **Profile Management**: Edit profil pengguna
- **Notifications**: Receive dan manage notifikasi
- **Responsive Design**: NativeWind untuk styling Tailwind CSS

## API Integration

Aplikasi terhubung dengan backend API di `http://localhost:3000` (default).

Set `EXPO_PUBLIC_API_URL` di file `.env` untuk mengubah API endpoint.

### Endpoints yang digunakan:
- `/api/auth/*` - Authentication
- `/api/reports/*` - Report management
- `/api/users/*` - User profile
- `/api/notifications/*` - Notifications

## Development

### Running on Emulator

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

### Debugging

- Use `console.log()` untuk debug
- Expo DevTools: Press `Shift + M` di terminal
- React Native Debugger untuk advanced debugging

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### API Connection Issues
- Ensure backend is running
- Check `EXPO_PUBLIC_API_URL` environment variable
- For physical device, use your machine's IP address instead of localhost

### Build Issues
- Clear cache: `expo r -c`
- Reinstall node_modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo cache:clear`

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Expo Router Documentation](https://expo.github.io/router/)
