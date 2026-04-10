# Building the AniKai Android APK

## Option 1: Build with EAS (Expo Application Services) - Recommended

This is the easiest method and doesn't require Android Studio.

### Prerequisites
1. Create an Expo account at https://expo.dev/signup
2. Install EAS CLI: `npm install -g eas-cli`
3. Login to EAS: `eas login`

### Build Steps

```bash
# Navigate to project
cd anikai-app

# Configure the project (one-time setup)
eas build:configure

# Build APK (preview profile)
eas build -p android --profile preview

# Or build production AAB for Play Store
eas build -p android --profile production
```

The build will run in the cloud and provide a download link when complete.

## Option 2: Local Build with Android Studio

### Prerequisites
- Android Studio installed
- Android SDK
- Java JDK 17+

### Steps

1. Prebuild the native project:
```bash
npx expo prebuild -p android
```

2. Open in Android Studio:
```bash
cd android
studio .
```

3. Build APK in Android Studio:
- Build → Build Bundle(s) / APK(s) → Build APK(s)

## Option 3: Build with Expo Development Build

For testing during development:

```bash
# Install Expo Go app on your Android device
# Then run:
npx expo start
```

Scan the QR code with Expo Go app to test.

## Troubleshooting

### Memory Issues
If you encounter memory errors during build:
```bash
export NODE_OPTIONS=--max_old_space_size=4096
```

### Clean Build
```bash
rm -rf node_modules android ios
npm install
npx expo prebuild --clean
```

### Network Issues with EAS
```bash
eas build -p android --profile preview --non-interactive
```

## APK Output Location

- **EAS Build**: Download link provided after build completes
- **Local Build**: `android/app/build/outputs/apk/release/app-release.apk`

## App Permissions

The app requires these Android permissions:
- `INTERNET` - For streaming content
- `ACCESS_NETWORK_STATE` - Check connectivity
- `WRITE_EXTERNAL_STORAGE` - For downloads
- `WAKE_LOCK` - Keep screen on while watching
- `RECEIVE_BOOT_COMPLETED` - For notifications
