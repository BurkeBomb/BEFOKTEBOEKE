# Afrikaans Book Collection Manager

## Overview
BURKEBOOKS is a full-stack web application designed for managing an Afrikaans book collection. Its main purpose is to allow users to catalog, search, and manage their books, maintain a wishlist, and benefit from AI-powered genre predictions. The project aims to be a comprehensive commercial social platform for Afrikaans book collectors, generating revenue through subscriptions, advertising, and affiliate commissions. Key capabilities include advanced social features, AI-powered recommendations, professional-grade inventory management, literary events discovery, AI camera and barcode scanning, social media sharing with custom graphics, and multi-language support.

## User Preferences
Preferred communication style: Simple, everyday language.
UI preferences: Less intense/crazy colors, more user-friendly and less technical interface.
Authentication need: Multi-user system where friends can create their own accounts and book shelves.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components, Radix UI primitives
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Replit Auth integration

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM (using Neon Database)
- **Validation**: Zod schemas (shared client/server)
- **AI Integration**: OpenAI API for genre prediction
- **Authentication**: Replit OpenID Connect with Passport.js

### Build System
- **Frontend Bundler**: Vite
- **Server Bundling**: esbuild
- **Development**: tsx

### Core System Design
- **Data Layer**: PostgreSQL with Drizzle ORM; `books`, `advertisements`, `ad_clicks`, `ad_impressions`, `achievements`, `user_achievements`, `reading_activities` tables.
- **API Structure**: Comprehensive REST API for book management, authentication, statistics, wishlist, advertisement tracking, and gamification system. Includes admin endpoints for revenue analytics and achievement management.
- **Storage Strategy**: User data, book collections, achievements, reading progress, and sessions stored in PostgreSQL.
- **UI/UX Decisions**: Features a warm orange/brown theme that's user-friendly and non-technical. Clean design with BURKEBOOKS branding. Focus on responsive design and mobile optimization. Includes tabbed interface with Collection, Reading Progress, and Achievements panels. Components for book display, search/filters, statistics, gamification features, and achievement system.
- **Feature Specifications**:
    - **Book Management**: Add books with AI genre prediction, search, filter, sort, toggle wishlist status.
    - **Statistics**: Real-time collection metrics (total, wishlist, rare, genre distribution).
    - **Export**: CSV export of collection.
    - **Advertisement System**: Supports multiple ad placements (banner, sidebar, inline, footer) with click/impression tracking and comprehensive revenue analytics.
    - **PWA Capabilities**: Offline support and mobile installation.
    - **AI Recommendations**: ML-powered book suggestions based on user collection.
    - **Social Features**: Book reviews, ratings, book clubs, reading challenges, user badges, community leaderboards.
    - **Advanced Book Management**: Inventory tracking, lending, condition monitoring, valuation.
    - **Referral Marketing**: User referral system.
    - **Price Drop Notifications**: User-configurable alerts.
    - **Literary Events System**: Management and discovery of events with registration and alerts.
    - **AI Camera Scanner**: Computer vision for book identification and cover image storage via device camera.
    - **ISBN Barcode Scanner**: ISBN lookup via camera, integrating multiple book data APIs.
    - **Social Media Sharing**: Canvas-based custom quote graphics generator with templates, branding, and one-click sharing.
    - **Multi-Language Support**: Full i18n for Afrikaans, English, Dutch with language selector and persistence.
    - **Gamification System**: Complete reading progress tracker with achievement badges, user levels, points system, reading streaks, and progress tracking for individual books.

## External Dependencies

### AI Integration
- **OpenAI API**: For intelligent genre prediction.

### Database
- **Neon Database**: Serverless PostgreSQL provider.

### UI Libraries
- **Radix UI**: Headless UI components.
- **Lucide React**: Icon library.
- **class-variance-authority**: Component variant management.
- **date-fns**: Date manipulation utilities.

### Third-Party Integrations
- **Google Books API**: For ISBN barcode scanning.
- **Open Library API**: For ISBN barcode scanning.
- **Replit Auth**: User authentication.