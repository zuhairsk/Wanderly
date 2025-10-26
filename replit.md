# Wanderly - Local Travel & Tourism Platform

## Overview

Wanderly is a full-stack web application designed to help users discover and explore local attractions, landmarks, and experiences. The platform enables users to browse attractions, read reviews, save favorites, and contribute their own experiences through ratings and reviews. Built with a modern tech stack, it features an interactive map view, comprehensive filtering options, and role-based access control for administrators to manage content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Styling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Tailwind CSS with custom design tokens for consistent styling
- Shadcn/ui component library (New York style) for pre-built, accessible UI components
- Wouter for lightweight client-side routing

**State Management**
- TanStack Query (React Query) for server state management, caching, and data synchronization
- Local state management using React hooks
- Custom hooks for authentication (`useAuth`) and UI interactions (`useToast`, `useIsMobile`)

**Key UI Features**
- Responsive design with mobile-first approach
- Interactive map integration using Leaflet.js with OpenStreetMap tiles
- Real-time search and filtering capabilities
- Modal-based authentication flow
- Toast notifications for user feedback

### Backend Architecture

**Server Framework**
- Express.js REST API with TypeScript
- Modular route structure separating authentication, users, attractions, and reviews
- Middleware-based request logging and error handling
- JWT-based authentication system with custom middleware

**Authentication & Authorization**
- JWT tokens for stateless authentication (7-day expiration)
- Password hashing using crypto (implementation details in auth.ts)
- Role-based access control (user/admin roles)
- Protected routes with `authenticateToken` and `requireAdmin` middleware
- Token storage in localStorage on the client side

**Data Layer**
- In-memory storage implementation (`MemStorage`) for development
- Drizzle ORM configured for PostgreSQL production deployment
- Schema-first approach with Zod validation
- Prepared for database migration using Drizzle Kit

### Database Schema

**Users Table**
- Fields: id (UUID), username, email, password (hashed), role (user/admin), favorites (JSON array), createdAt
- Unique constraints on username and email
- Favorites stored as array of attraction IDs

**Attractions Table**
- Fields: id, name, category, description, location (JSON with lat/lng/address), images (array), price, distance, hours, phone, website, amenities (array), averageRating, reviewCount, featured flag, timestamps
- Categories: nature, museum, adventure, dining, historic, shopping
- Price tiers: free, $, $$, $$$
- Location stored as JSON object with coordinates and address

**Reviews Table**
- Fields: id, attractionId, userId, rating (1-5), comment, timestamps
- Foreign keys to attractions and users tables
- Used to calculate attraction average ratings

### API Architecture

**Authentication Endpoints**
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - Login with credentials, returns JWT token
- `GET /api/auth/me` - Get current authenticated user

**Attraction Endpoints**
- `GET /api/attractions` - List all attractions
- `GET /api/attractions/:id` - Get single attraction details
- `POST /api/attractions` - Create attraction (admin only)
- `PUT /api/attractions/:id` - Update attraction (admin only)
- `DELETE /api/attractions/:id` - Delete attraction (admin only)

**Review Endpoints**
- `GET /api/reviews/:attractionId` - Get reviews for an attraction
- `POST /api/reviews` - Create a review (authenticated users)
- Review creation triggers automatic rating recalculation for attractions

**User Endpoints**
- `GET /api/users/:id/favorites` - Get user's favorite attractions
- `GET /api/users/:id/reviews` - Get user's submitted reviews
- `POST /api/users/:id/favorites` - Add attraction to favorites
- `DELETE /api/users/:id/favorites/:attractionId` - Remove from favorites

### External Dependencies

**Frontend Libraries**
- @radix-ui/* - Headless UI components for accessibility
- @tanstack/react-query - Server state management
- react-hook-form with @hookform/resolvers - Form handling and validation
- leaflet - Map rendering and interaction
- date-fns - Date formatting utilities
- class-variance-authority & clsx - Conditional styling utilities
- zod - Schema validation (shared with backend)

**Backend Libraries**
- express - Web server framework
- jsonwebtoken - JWT token generation and validation
- drizzle-orm - Type-safe ORM for PostgreSQL
- @neondatabase/serverless - PostgreSQL serverless driver
- drizzle-zod - Zod schema generation from Drizzle schemas
- zod - Runtime validation

**Development Tools**
- TypeScript - Type safety across the stack
- Vite - Fast development and optimized production builds
- tsx - TypeScript execution for development server
- esbuild - Production server bundling
- Replit-specific plugins for enhanced development experience

**Database**
- PostgreSQL (via Neon Database serverless)
- Drizzle Kit for schema migrations
- Connection via DATABASE_URL environment variable

**Map Services**
- Leaflet.js with OpenStreetMap tiles (no API key required)
- Client-side rendering of attraction markers
- Interactive popups and location display

**Environment Variables**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT signing (defaults to development key)
- `NODE_ENV` - Environment indicator (development/production)