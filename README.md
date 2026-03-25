# GenAI Healthcare Assistant - Frontend

A modern, AI-powered healthcare platform frontend built with Next.js 16, TypeScript, and Tailwind CSS. This application provides dual interfaces for both patients and doctors with real-time AI chat capabilities, appointment management, and medical record tracking.

## Features

### Patient Features
- **AI Health Chat**: Real-time interaction with HealthBrain AI for health insights
- **Doctor Directory**: Browse and filter available doctors by specialty
- **Appointment Management**: Book, reschedule, and cancel appointments
- **Medical Records**: Upload and manage medical reports and documents
- **AI Analysis**: View AI-powered analysis of medical reports
- **Profile Management**: Keep your health information up-to-date

### Doctor Features
- **AI Consultation**: Chat with DoctorBrain AI for case analysis and recommendations
- **Appointment Management**: View, confirm, and manage patient appointments
- **Patient Directory**: Access comprehensive patient records and medical history
- **Profile Management**: Update professional information and availability
- **Patient Analytics**: Track patient data and consultation history

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios with custom interceptors
- **UI Components**: Custom components with shadcn/ui patterns
- **Authentication**: JWT-based with HTTP-only cookies

## Project Structure

```
app/
├── (auth)/                    # Authentication routes
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (main)/                    # Protected routes
│   ├── patient/              # Patient module
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── appointments/
│   │   ├── medical-records/
│   │   └── profile/
│   ├── doctor/               # Doctor module
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── appointments/
│   │   ├── patients/
│   │   └── profile/
│   └── layout.tsx
├── layout.tsx
└── page.tsx

components/
├── auth/                      # Authentication components
├── shared/                    # Shared components (Navbar, Sidebar)
└── ui/                       # Reusable UI components

lib/
├── api.ts                    # API client with interceptors
├── auth.ts                   # Authentication utilities
├── cookies.ts                # Cookie management
├── constants.ts              # API endpoints and constants
├── errors.ts                 # Error handling utilities
├── format.ts                 # Data formatting utilities
└── validation.ts             # Input validation utilities

contexts/
└── AuthContext.tsx           # Authentication context provider

types/
└── index.ts                  # TypeScript type definitions

hooks/
├── useAuth.ts               # Authentication hook
└── (other custom hooks)
```

## Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-assistant-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your backend API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` |

## API Integration

The frontend integrates with the following backend services:

- **Auth Service** (Port 3001): Authentication and user management
- **User Service** (Port 3002): Patient profile management
- **Doctor Service** (Port 3003): Doctor information and directory
- **Appointment Service** (Port 3004): Appointment scheduling
- **AI Service** (Port 3005): HealthBrain and DoctorBrain AI endpoints

### Key API Endpoints

**Authentication**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

**Patient Features**
- `POST /ai/chat` - HealthBrain AI chat (streaming)
- `GET /doctor/all` - Get all doctors
- `POST /appointment/create` - Create appointment
- `GET /appointment/my-appointments` - Get patient's appointments
- `POST /images/upload` - Upload medical report
- `GET /analysis/analysis` - Get medical analysis

**Doctor Features**
- `POST /doctor-ai/chat` - DoctorBrain AI chat (streaming)
- `GET /appointment/doctor/:doctorId` - Get doctor's appointments
- `PATCH /appointment/:id/status` - Update appointment status
- `GET /doctor/all` - Get patient directory

## Authentication Flow

1. User registers or logs in via `/login` or `/register`
2. Backend returns JWT token
3. Token stored in HTTP-only cookie via `setCookie('authToken', token)`
4. API client automatically includes token in Authorization header
5. Middleware protects routes based on authentication status
6. On logout, token is cleared and user redirected to login

## State Management

### Global State
- **Auth State**: Managed via `AuthContext` with user data and auth methods
- Provides: `user`, `isLoading`, `isAuthenticated`, `login()`, `register()`, `logout()`

### Local State
- Component-level state managed with `useState`
- API calls with loading/error states in custom hooks
- Form state managed locally with `useState`

## Error Handling

- API errors logged to console with context
- User-friendly error messages displayed in UI
- Network errors automatically trigger logout if 401
- Form validation errors shown per field
- Try-catch blocks in all async operations

## Performance Optimizations

- Code splitting via Next.js dynamic imports
- Image optimization for profile pictures
- API response caching where applicable
- Lazy loading of components
- Optimized bundle size with tree-shaking

## Security Features

- JWT authentication with HTTP-only cookies
- CORS configured for backend origin
- Input validation on client-side
- Protected routes via middleware
- Secure password handling (hashed on backend)
- XSS protection via React's built-in escaping

## Development

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## File Upload

Medical reports can be uploaded via the `/patient/medical-records` page:
- Supported formats: PDF, JPG, PNG
- Max file size: 10MB
- Max files per upload: 10
- Upload progress displayed with visual indicator

## Chat Features

Both patient and doctor chat interfaces support:
- Real-time message streaming from AI
- Auto-scrolling to latest message
- Loading indicators during response
- Error handling for failed requests
- Message history in session

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### API Connection Issues
1. Ensure backend services are running
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Verify CORS settings on backend
4. Check browser console for error messages

### Authentication Issues
1. Clear browser cookies and localStorage
2. Logout and login again
3. Verify JWT token in cookie (DevTools > Application > Cookies)

### Build Issues
1. Delete `.next` folder and rebuild
2. Clear node_modules and reinstall dependencies
3. Check Node.js version compatibility

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - GenAI Healthcare Assistant

## Support

For issues or questions, contact the development team or open an issue in the repository.
