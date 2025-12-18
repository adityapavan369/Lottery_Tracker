# Lottery Tracker

A React Native mobile application for tracking lottery ticket sales with backend API and SQL database.

## Features

### Authentication
- Email/password login and registration
- JWT-based authentication
- Secure password hashing with bcrypt

### Inventory Management
- Scan QR codes to add new ticket packs
- Input pack name and size
- View all ticket packs
- Track pack details and history

### Daily Sales Flow
- Auto-set start ticket number from previous day's end number
- Start new sales day with selected pack
- Scan last sold ticket QR code to close day
- Automatic calculation of tickets sold and total revenue

### Revenue Tracking
- Auto-calculate tickets sold based on start/end ticket numbers
- Calculate total revenue (assumes $1 per ticket)
- View sales history
- Track daily, weekly, and monthly sales

## Tech Stack

### Frontend
- **React Native** with Expo
- **React Navigation** for routing
- **React Native Paper** for UI components
- **Expo Camera & Barcode Scanner** for QR code scanning
- **AsyncStorage** for local data persistence
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **SQLite3** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## Installation

### Prerequisites
- Node.js 14+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode and iOS Simulator
- For Android: Android Studio and Android Emulator

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/adityapavan369/Lottery_Tracker.git
cd Lottery_Tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

4. **Initialize the database**
```bash
npm run db:migrate
```

5. **Start the backend server**
```bash
npm run backend
```
The backend will run on `http://localhost:3000`

6. **Start the React Native app** (in a new terminal)
```bash
npm start
```

7. **Run on device/emulator**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Project Structure

```
Lottery_Tracker/
├── backend/
│   ├── database.js       # Database schema and initialization
│   ├── migrate.js        # Database migration script
│   └── server.js         # Express API server
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── InventoryScreen.js
│   │   ├── AddPackScreen.js
│   │   ├── DailySalesScreen.js
│   │   ├── StartDayScreen.js
│   │   ├── CloseDayScreen.js
│   │   └── SalesHistoryScreen.js
│   ├── services/
│   │   └── api.js        # API service functions
│   └── components/       # Reusable components (if needed)
├── App.js                # Main app component with navigation
├── package.json
└── app.json             # Expo configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Inventory
- `GET /api/inventory/packs` - Get all ticket packs (authenticated)
- `POST /api/inventory/add-pack` - Add new ticket pack (authenticated)

### Sales
- `POST /api/sales/start-day` - Start new sales day (authenticated)
- `GET /api/sales/previous-end-number` - Get previous day's end number (authenticated)
- `POST /api/sales/close-day` - Close current sales day (authenticated)
- `GET /api/sales/today` - Get today's sale (authenticated)
- `GET /api/sales/history` - Get sales history (authenticated)

## Database Schema

### Users Table
- id (PRIMARY KEY)
- email (UNIQUE)
- password (hashed)
- created_at

### Ticket Packs Table
- id (PRIMARY KEY)
- name
- pack_size
- qr_code (UNIQUE)
- added_at
- user_id (FOREIGN KEY)

### Daily Sales Table
- id (PRIMARY KEY)
- sale_date
- start_ticket_number
- end_ticket_number
- tickets_sold (calculated)
- total_revenue (calculated)
- pack_id (FOREIGN KEY)
- user_id (FOREIGN KEY)
- status (open/closed)
- created_at
- closed_at

## Usage

### First Time Setup
1. Register a new account using email and password
2. Add ticket packs by scanning QR codes
3. Input pack name and size for each pack

### Daily Operations
1. **Start Day**: 
   - Select a ticket pack
   - System automatically sets start number from previous day's end
   - Or manually input start ticket number
   
2. **Sell Tickets**: 
   - Sell lottery tickets throughout the day
   
3. **Close Day**: 
   - Scan the last sold ticket's QR code
   - Or manually input the end ticket number
   - System automatically calculates tickets sold and revenue

### View History
- Access sales history to see past daily sales
- View total revenue and tickets sold per day

## Configuration

### Backend URL
Update the API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

For development:
- iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical Device: `http://YOUR_COMPUTER_IP:3000/api`

### Camera Permissions
The app requires camera permissions for QR code scanning. Permissions are requested automatically when accessing scanner features.

## Security Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` file for production
2. **HTTPS**: Use HTTPS for production API endpoints
3. **Password Policy**: Implement stronger password requirements as needed
4. **Rate Limiting**: Consider adding rate limiting to API endpoints
5. **Input Validation**: Additional validation can be added for enhanced security

## Troubleshooting

### Backend Connection Issues
- Ensure backend server is running
- Check API_BASE_URL in `src/services/api.js`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure device and computer are on same network

### Camera Not Working
- Check camera permissions in device settings
- Ensure `expo-camera` is properly installed
- For iOS simulator, camera is not available (use physical device)

### Database Issues
- Delete `backend/lottery.db` and run `npm run db:migrate` again
- Check write permissions in backend directory

## Future Enhancements

- [ ] Add ticket price configuration per pack
- [ ] Support multiple currencies
- [ ] Export sales data to CSV/PDF
- [ ] Dashboard with charts and analytics
- [ ] Push notifications for daily reminders
- [ ] Multi-user support with roles
- [ ] Offline mode with sync
- [ ] Barcode generation for tickets
- [ ] Receipt printing integration

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.