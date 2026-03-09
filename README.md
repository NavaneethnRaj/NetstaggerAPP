# SalarySync

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### Database Setup
1. Create a database named `salarysync`.
2. Import the schema found in `backend/schema.sql`.

### Backend Configuration
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on the environment variables needed (DB credentials).
4. Run in development: `npm run dev`.

### Frontend Configuration
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Run in development: `npm run dev`.

## 📁 Project Structure

```text
NetstaggerAPP/
├── backend/            # Express Server & DB Logic
│   ├── src/
│   │   ├── routes/     # API Endpoints
│   │   ├── services/   # Queue & Socket logic
│   │   └── index.js    # Entry point
│   └── uploads/        # Temporary file storage
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI pieces
│   │   ├── pages/      # Route components
│   │   └── context/    # Auth & State management
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5001

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=salarysync_user
DB_PASSWORD=your_database_password
DB_NAME=salarysync

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
```

