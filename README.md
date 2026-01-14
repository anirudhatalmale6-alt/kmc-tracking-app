# KMC Tracking App

A mobile application for monitoring Kangaroo Mother Care (KMC) hours for admitted neonates in NICU.

## Features

### Parent Features
- Login using mobile number + 4-digit PIN
- View baby details (Name, UHID, Bed No)
- Start/Stop KMC timer
- Automatic calculation of duration
- View daily & weekly KMC hours
- History of previous sessions

### Staff Features
- Staff login (username + password)
- Dashboard showing all babies
- View today's & weekly KMC hours
- Filter by bed / UHID / lowest KMC
- Identify mothers with low KMC hours

### Admin Features
- Add baby details
- Create parent accounts with auto-generated PIN
- Create staff accounts
- Grant admin access to staff

## Tech Stack
- React Native (Expo)
- Firebase (Firestore)
- React Navigation

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create the following collections:
   - `babies` - Store baby information
   - `parents` - Store parent accounts
   - `staff` - Store staff accounts
   - `sessions` - Store KMC session data

4. Get your Firebase configuration and update `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Set Firestore Security Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Note: For production, implement proper authentication rules.

### 2. Create Initial Admin Account

After setting up Firebase, manually add a staff document in Firestore:

```json
{
  "name": "Admin",
  "username": "admin",
  "password": "admin123",
  "isAdmin": true,
  "createdAt": "<timestamp>"
}
```

### 3. Run the App

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 4. Build APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

## App Theme
- Primary Color: Pink (#E91E63)
- Light Pink: #F8BBD9
- Background: Lavender Blush (#FFF0F5)

## Data Structure

### Babies Collection
```json
{
  "name": "Baby Name",
  "uhid": "UHID123",
  "bedNo": "B-01",
  "createdAt": "<timestamp>"
}
```

### Parents Collection
```json
{
  "motherName": "Mother Name",
  "mobile": "9876543210",
  "pin": "1234",
  "babyId": "<baby_document_id>",
  "createdAt": "<timestamp>"
}
```

### Sessions Collection
```json
{
  "parentId": "<parent_document_id>",
  "babyId": "<baby_document_id>",
  "startTime": "<timestamp>",
  "endTime": "<timestamp>",
  "duration": 3600000,
  "isActive": false
}
```

## License
Private - All rights reserved
