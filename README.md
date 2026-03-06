# SalarySync - Payroll Management System

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
