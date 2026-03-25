# Frontend Setup Guide

## Prerequisites
- Node.js 18+ and npm/pnpm
- The GenAI Healthcare Assistant backend services running

## Installation

```bash
# Install dependencies
npm install

# Or if using pnpm
pnpm install
```

## Configuration

### Environment Variables

Update `.env.local` with your backend API configuration:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

The backend services use the following ports:
- **Auth Service**: 3001
- **User Service**: 3002
- **Appointment Service**: 3003
- **Doctor Service**: 3004
- **AI Service**: 3005

## Running the Frontend

### Development Mode
```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Backend Configuration

Before using the frontend, ensure your backend services are configured:

1. **MongoDB Connection**: Configure MongoDB connection strings in each backend service's `.env` file
2. **Environment Variables**: Set up required API keys for AI services, Cloudinary, etc.
3. **Service Startup**: Start each backend service on its designated port

## Frontend Architecture

### Key Features
- **Role-based Authentication**: Patient and Doctor login/registration
- **Real-time AI Chat**: HealthBrain for patients, DoctorBrain for doctors
- **Appointment Management**: Book, view, and manage appointments
- **Medical Records**: Upload and manage medical reports
- **Doctor Directory**: Browse and filter doctors
- **User Profiles**: Edit and manage user information

### Project Structure
```
app/                  # Next.js App Router pages
├── (auth)/          # Authentication pages (login, register)
└── (main)/          # Protected pages
    ├── patient/     # Patient module
    └── doctor/      # Doctor module

components/         # React components
├── auth/           # Authentication components
└── shared/         # Shared components

contexts/           # React contexts
lib/                # Utility functions and API client
types/              # TypeScript type definitions
```

## Troubleshooting

### "Cannot connect to backend"
- Ensure backend services are running on the correct ports
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend CORS settings allow frontend domain

### "Invalid token error"
- Clear browser cookies
- Log out and log back in
- Check if backend session tokens are properly configured

### "Page not found after login"
- Verify backend authentication endpoints are responding correctly
- Check middleware configuration in `middleware.ts`
- Ensure user roles are correctly set during registration

## Deployment

The frontend can be deployed to:
- **Vercel**: Simply connect your Git repository
- **Other platforms**: Run `npm run build` and `npm start`

The `.vercelignore` file ensures only the frontend is deployed, not the backend services.
