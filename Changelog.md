# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Authentication system with secure login/register/logout/refresh functionality
  - JWT-based authentication (access and refresh tokens)
  - Cookie-based refresh token handling (HTTP-only)
  - Auth controller with register, login, logout, refresh, and profile endpoints
  - Auth service with token generation, verification, and refresh logic
  - Auth middleware (`authenticate`, `authorize`) for route protection and RBAC
  - Auth validation schemas using Zod
- Complete user management system with CRUD operations
  - User model with bcrypt password hashing
  - User service layer with comprehensive business logic
  - User controllers with proper RESTful endpoints
  - Role-Based Access Control (RBAC) implemented in user routes and controllers (admin vs. user permissions)
  - User routes with validation and versioning
  - Organized index files for better module management
- Added Husky git hooks for code quality checks before commit
- AI integration utility (`AIRequest.ts`) using OpenAI SDK (configured for Gemini endpoint).
- Rate limiting middleware (`express-rate-limit`) applied to API routes.
- Cookie parsing middleware (`cookie-parser`).
- Environment variable validation using Zod (`env.validation.ts`).

### Changed

- Replaced crypto-based password hashing with bcrypt for better security
- Organized project structure with index files for models, controllers, services, and validations
- Updated `app.ts` to include auth routes, cookie parser, rate limiter, and improved error handling setup.
- Removed deprecated MongoDB connection options (`useNewUrlParser` and `useUnifiedTopology`) from database configuration as they are no longer needed in MongoDB Node.js Driver 4.0.0+
- Updated `user.controller.ts` to implement access checks based on user roles.
- Updated `user.route.ts` to apply authentication and authorization middleware.
- Updated environment configuration (`config.ts`, `env.validation.ts`, `.env.example`) to include settings for OpenAI, cookies, and rate limiting.

### Enhanced

- Improved code organization with better module exports
- Added comprehensive test coverage for all components:
  - User model tests
  - User service tests
  - User controller tests
  - User API integration tests
  - Auth service tests
  - Auth controller tests (implicitly covered via integration tests)
  - Middleware tests (auth, validation, error handling)
  - Configuration tests (env validation, db, logger, morgan)
  - Utility tests (ApiError)
  - Improved error handling with `ApiError` class and dedicated middleware (`errorConverter`, `errorHandler`, `notFound`).
  - Added `asyncHandler` middleware to simplify async route handling.
