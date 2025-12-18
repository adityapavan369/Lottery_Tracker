# Quick Setup Guide

This guide will help you get the Lottery Tracker app running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm or yarn package manager
- Expo CLI: Install with `npm install -g expo-cli`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages for both the frontend (React Native) and backend (Node.js/Express).

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file and set a secure JWT secret:
```
PORT=3000
JWT_SECRET=your-very-secure-secret-key-here
```

### 3. Initialize Database

```bash
npm run db:migrate
```

This creates the SQLite database with all necessary tables.

### 4. Start the Backend Server

In one terminal window:
```bash
npm run backend
```

You should see: `Server running on port 3000`

### 5. Start the React Native App

In a new terminal window:
```bash
npm start
```

### 6. Run on a Device or Emulator

Once the Metro bundler starts, you have several options:

**For iOS (Mac only):**
- Press `i` to open in iOS Simulator
- Or scan the QR code with the Camera app on your iPhone

**For Android:**
- Press `a` to open in Android Emulator
- Or scan the QR code with the Expo Go app on your Android device

**For Web (testing only):**
- Press `w` to open in web browser

## First Time Usage

1. **Register an Account**
   - Open the app
   - Click "Don't have an account? Register"
   - Enter email and password
   - Click "Register"

2. **Add Your First Ticket Pack**
   - Go to the "Inventory" tab
   - Click the "+" button
   - Enter pack name (e.g., "Mega Millions")
   - Enter pack size (e.g., 100)
   - Click "Scan QR Code" or manually enter a QR code value
   - Click "Add Pack"

3. **Start Your First Sales Day**
   - Go to the "Sales" tab
   - Click "Start Day"
   - Select a ticket pack
   - The start number will be set automatically (or enter manually)
   - Click "Start Day"

4. **Close Your Sales Day**
   - After selling tickets throughout the day
   - Go to the "Sales" tab
   - Click "Close Day"
   - Scan the QR code of the last sold ticket (or enter the ticket number)
   - The app will automatically calculate tickets sold and revenue
   - Click "Close Day"

## Development Tips

### Changing Backend URL

If you need to connect from a physical device or different emulator:

Edit `src/services/api.js` and change the `API_BASE_URL`:

- **iOS Simulator**: `http://localhost:3000/api` (default)
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3000/api`
  - Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
  - Example: `http://192.168.1.100:3000/api`

### Resetting the Database

If you need to start fresh:

```bash
# Stop the backend server first
rm backend/lottery.db
npm run db:migrate
npm run backend
```

### Common Issues

**"Cannot connect to backend"**
- Ensure the backend server is running
- Check the API_BASE_URL in `src/services/api.js`
- Make sure your device and computer are on the same network

**"Camera not working"**
- Camera doesn't work in iOS Simulator - use a physical device
- Check camera permissions in device settings
- Grant permission when prompted by the app

**"Port 3000 already in use"**
- Another application is using port 3000
- Either stop that application or change the port in `.env`

## Project Structure Overview

```
Lottery_Tracker/
├── App.js                    # Main app entry point
├── package.json              # Dependencies and scripts
├── backend/
│   ├── database.js          # Database setup and schema
│   ├── server.js            # Express API server
│   └── lottery.db           # SQLite database (created on first run)
└── src/
    ├── screens/             # All app screens
    │   ├── LoginScreen.js
    │   ├── InventoryScreen.js
    │   ├── AddPackScreen.js
    │   ├── DailySalesScreen.js
    │   ├── StartDayScreen.js
    │   ├── CloseDayScreen.js
    │   └── SalesHistoryScreen.js
    └── services/
        └── api.js           # API communication layer
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Customize the UI to match your branding
- Add additional features as needed

## Getting Help

If you encounter issues:
1. Check the troubleshooting section in README.md
2. Verify all dependencies are installed correctly
3. Ensure both backend and frontend are running
4. Check console logs for error messages
5. Open an issue on GitHub with details
