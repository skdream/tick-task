# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a family task and reward management system called "打卡鸭" (Tick Duck). It helps parents manage children's daily tasks through a star reward system. The application supports multiple families with data isolation, distinct parent/child roles, and features like task management, star tracking, and celebratory animations.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Tech Stack
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS for styling
- Supabase for backend (PostgreSQL database)
- LocalStorage for session persistence (30-day expiry)

### Key Directories
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `contexts/` - React Context for global state (AppContext)
- `lib/` - Database and API utilities
- `types/` - TypeScript type definitions
- `config/` - Route configurations

### State Management
The application uses a centralized `AppContext` (`contexts/AppContext.tsx`) for global state. Key features:
- User authentication and session management
- Task and star data management
- Role-based permissions (parent vs child)
- Loading states for operations

### Data Flow
1. **Authentication**: Users login with family email, PIN, password, and role
2. **Data Isolation**: All data queries filter by `familyId` for multi-family support
3. **Role Permissions**:
   - **Parents**: Can create/delete tasks, manage children, view all family stats
   - **Children**: Can complete tasks, view own stats only
4. **Session Persistence**: Login state stored in localStorage with 30-day expiry

### Database Schema (Supabase)
Key tables:
- `families` - Family records with email and PIN
- `users` - Family members with role (parent/child)
- `tasks` - Tasks with assignment, stars, and status
- `star_logs` - Star earning history

### Component Structure
- `LayoutWrapper` - Main layout with navigation
- `AuthGuard` - Route protection based on role
- `TaskPage` - Task management with child switching (parents)
- `StarPage` - Star statistics and logs
- `LoginPage`/`RegisterPage` - Authentication
- `CelebrationEffect`/`StarEffect` - Animation components

### Routing
Routes defined in `config/routes.ts` with role-based access:
- `/` - Home/Login redirect
- `/tasks` - Task management (both roles)
- `/stars` - Star statistics (both roles)
- `/login` - Login page
- `/register` - Family registration

### Styling
- Tailwind CSS with custom primary/secondary colors
- Mobile-first responsive design
- Fixed bottom navigation for mobile

## Development Notes

### Authentication Flow
1. Family registration creates a family record and first user
2. Login requires family email, PIN, password, and role
3. PIN is shared across family members
4. Session persists for 30 days via localStorage

### Data Operations
All database operations go through `lib/db.ts` which:
- Handles Supabase client creation
- Enforces role-based permissions
- Filters data by familyId automatically
- Returns typed API responses

### Animation System
- `StarEffect` - Shows star animation when tasks are completed
- `CelebrationEffect` - Triggers when all tasks are completed

### Role-Based UI
Components check `currentUser.role` to show/hide features:
- Parents see "Add Task", "Delete Task", "Manage Children"
- Children only see "Complete Task" buttons

### Error Handling
- Database errors logged to console
- User-friendly error messages in UI
- Loading states prevent double submissions

### Testing Considerations
- Mock data available in `lib/mockData.ts`
- Supabase client configuration in `lib/supabase/`
- Environment variables needed for Supabase connection