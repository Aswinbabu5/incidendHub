# IncidentHub

IncidentHub is a full-stack MERN application for managing and tracking incidents.

## Features

- User registration and login
- Role-based access for Admin, Engineer and Viewer
- Create and update incidents
- Assign incidents to engineers
- Search, filter, sort and pagination
- SLA tracking
- Activity timeline
- File upload, download and delete
- Dashboard with incident statistics
- Incident analytics and charts
- Global error handling

## Tech Stack

**Frontend:** React, TypeScript, Axios, React Router, Recharts

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT

## Run Locally

### Backend

```bash
cd backend
npm install
node your_file_name.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` files using the provided `.env.example` files.

Backend:

```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
```

Frontend:

```env
VITE_API_URL=URL
```