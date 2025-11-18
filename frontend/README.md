# NeuroLock - React Native App

This is a React Native mental health records management app with advanced security features.

## Setup Instructions

### 1. Install Dependencies

Open a terminal in the project directory and run:

```powershell
npm install
```

If you encounter issues, try:

```powershell
npm install --legacy-peer-deps
```

### 2. Install Expo CLI (if not already installed)

```powershell
npm install -g expo-cli
```

or

```powershell
npx expo install
```

### 3. Run the App

#### For Development:
```powershell
npm start
```

or

```powershell
npx expo start
```

This will open the Expo Dev Tools in your browser. You can:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator (Mac only)
- Scan the QR code with Expo Go app on your phone

#### For Specific Platforms:
```powershell
# Android
npm run android

# iOS (Mac only)
npm run ios

# Web
npm run web
```

## Project Structure

```
neurolock/
├── App.tsx                 # Main app with navigation
├── index.js               # Entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler configuration
├── components/
│   ├── WelcomeScreen.tsx         # Welcome/landing screen
│   ├── LoginScreen.tsx           # Login with password/biometric
│   ├── MFASelectionScreen.tsx    # Choose MFA method
│   ├── OTPVerificationScreen.tsx # OTP verification
│   ├── BiometricScreen.tsx       # Biometric authentication
│   └── PlaceholderScreens.tsx    # All other screens (to be implemented)
└── assets/                # Images, icons, fonts
```

## Features

✅ **Implemented:**
- React Navigation setup
- Welcome screen
- Login screen with biometric support
- MFA selection
- OTP verification
- Biometric verification
- React Native Paper UI components

⏳ **To Be Implemented:**
- All dashboard screens
- Patient management screens
- Therapy notes with end-to-end encryption
- Offline mode
- Settings
- Complete biometric integration
- Backend API integration

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **React Native Paper** - UI components
- **TypeScript** - Type safety
- **Expo Local Authentication** - Biometric auth

## Testing

### On Physical Device:
1. Install **Expo Go** from App Store or Play Store
2. Run `npm start`
3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### On Emulator:
- **Android**: Ensure Android Studio emulator is running, then `npm run android`
- **iOS**: Ensure Xcode simulator is running (Mac only), then `npm run ios`

## Notes

- The placeholder screens need to be fully implemented based on your requirements
- Biometric authentication requires a physical device or properly configured emulator
- Some features (like camera, push notifications) only work on physical devices

## Troubleshooting

If you see TypeScript errors about missing modules:
```powershell
npm install
```

If Metro bundler is cached:
```powershell
npx expo start --clear
```

If you have build errors:
```powershell
rm -rf node_modules
npm install
npx expo start --clear
```

## Next Steps

1. Run `npm install` to install all dependencies
2. Run `npm start` to launch the development server
3. Test the app on a device or emulator
4. Implement the placeholder screens with your business logic
5. Add backend API integration
6. Implement secure storage for patient data
7. Add proper error handling and validation
