# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Authentication system with secure login/signup functionality
  - JWT-based authentication
  - Auth controller with login/signup endpoints
  - Auth service with token management
  - Auth middleware for route protection
  - Auth validation schemas
- Complete user management system with CRUD operations
  - User model with bcrypt password hashing
  - User service layer with comprehensive business logic
  - User controllers with proper RESTful endpoints
  - User routes with validation and versioning
  - Organized index files for better module management
- Added Husky git hooks for code quality checks before commit

### Changed

- Replaced crypto-based password hashing with bcrypt for better security
- Organized project structure with index files for models, controllers, services, and validations
- Updated app.ts to include new user API routes
- Removed deprecated MongoDB connection options (`useNewUrlParser` and `useUnifiedTopology`) from database configuration as they are no longer needed in MongoDB Node.js Driver 4.0.0+

### Enhanced

- Improved code organization with better module exports
- Added comprehensive test coverage for all components:
  - User model tests
  - User service tests
  - User controller tests
  - User API integration tests
  - Auth service tests
  - Auth controller tests
  - Middleware tests (auth, validation, error handling)
