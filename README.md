# Node.js TypeScript Boilerplate

A production-ready Node.js boilerplate with TypeScript, Express, MongoDB, and comprehensive testing setup using Test-Driven Development (TDD) approach.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (Access & Refresh Tokens) + bcrypt + Cookies (HttpOnly)
- **Validation:** Zod for schema validation (Requests & Environment Variables)
- **Logging:** Winston + Morgan
- **Testing:** Jest with Supertest
- **Code Quality:** ESLint, Prettier, Husky
- **Process Manager:** PM2
- **Containerization:** Docker
- **Rate Limiting:** Express Rate Limit
- **AI Integration:** OpenAI SDK (configured for Gemini)

## User Management System

The application includes a complete user management system with the following features:

- **User Model**: MongoDB schema with secure password hashing using bcrypt
- **User Service**: Comprehensive business logic layer with CRUD operations
- **User Controllers**: RESTful API endpoints with proper status codes
- **Role-Based Access Control (RBAC)**: Differentiates permissions between 'admin' and 'user' roles.
- **User Validation**: Zod schemas for request validation
- **User Routes**: Structured API routes with versioning

### API Endpoints

#### Authentication

```
POST /api/v1/auth/register   - Register a new user
POST /api/v1/auth/login      - Login user and get JWT token
POST /api/v1/auth/logout     - Logout user (clears refresh token cookie)
POST /api/v1/auth/refresh    - Refresh JWT tokens using refresh token cookie
GET /api/v1/auth/profile     - Get authenticated user's profile
```

#### User Management

```
POST /api/v1/users           - Create a new user (Admin only)
GET /api/v1/users            - Get all users (Admin only, with filtering and pagination)
GET /api/v1/users/:userId    - Get a specific user (Admin or Owner)
PATCH /api/v1/users/:userId  - Update a user (Admin or Owner)
DELETE /api/v1/users/:userId - Delete a user (Admin only)
```

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.ts     # Application configuration derived from environment
│   │   ├── db.ts         # Database connection
│   │   ├── env.validation.ts # Zod schema for environment variables
│   │   ├── logger.ts     # Winston logger setup
│   │   └── morgan.ts     # HTTP request logging
│   ├── controllers/      # Route controllers
│   │   ├── index.ts      # Controller exports
│   │   ├── auth.controller.ts # Authentication controllers
│   │   └── user.controller.ts # User management controllers
│   ├── middlewares/       # Express middlewares
│   │   ├── asyncHandler.ts    # Async error wrapper
│   │   ├── auth.ts            # Authentication & Authorization (RBAC)
│   │   ├── validate.ts        # Request validation
│   │   └── errorHandler.ts    # Global error handling (converter, handler, notFound)
│   ├── models/           # Mongoose models
│   │   ├── index.ts      # Model exports
│   │   └── user.model.ts # User schema and methods
│   ├── routes/           # API routes
│   │   └── v1/           # API v1 routes
│   │       ├── index.ts   # Route registry
│   │       └── user.route.ts # User endpoints
│   │       └── auth.route.ts # Authentication endpoints
│   ├── services/         # Business logic
│   │   ├── index.ts      # Service exports
│   │   ├── auth.service.ts # Authentication operations
│   │   └── user.service.ts # User operations
│   ├── utils/           # Utility functions
│   │   └── ApiError.ts  # Custom error class
│   │   └── AIRequest.ts # Utility for making AI requests
│   ├── validations/     # Request validation schemas
│   │   ├── index.ts     # Validation exports
│   │   ├── auth.validation.ts # Auth validation schemas
│   │   └── user.validation.ts # User validation schemas
│   ├── app.ts          # Express app setup
│   └── index.ts        # Application entry point
├── tests/
│   ├── integration/     # Integration tests
│   │   ├── app.test.ts
│   │   └── routes/      # API route tests
│   │       └── user.route.test.ts # User API tests
│   ├── testEnv.ts       # Setup file for test environment variables
│   └── unit/           # Unit tests
│       ├── config/     # Configuration tests
│       ├── controllers/ # Controller tests
│       │   └── user.controller.test.ts
│       ├── middlewares/ # Middleware tests
│       ├── models/     # Database model tests
│       │   └── __mocks__/ # Mocks for models (if needed)
│       │   └── user.model.test.ts
│       ├── services/   # Service layer tests
│       │   └── user.service.ts
│       └── utils/      # Utility function tests
└── logs/            # Application logs
```

## Test-Driven Development (TDD)

This project follows TDD principles:

1. **Write failing tests first:** Create test cases before implementing features
2. **Write minimal code to pass:** Implement just enough code to make tests pass
3. **Refactor:** Improve code quality while maintaining test coverage

### Testing Architecture

- **Unit Tests:** Test individual components in isolation
  - Config module tests
  - Middleware tests
  - Utility function tests
  - Model tests
  - Service tests
  - Controller tests
- **Integration Tests:** Test component interactions
  - API endpoint tests
  - Database operations
  - Middleware chain tests

### Test Coverage

The project maintains high test coverage across all components:

- **User Model**: Password hashing, validation, methods
- **User Service**: CRUD operations, error handling, business logic
- **User Controller**: Request handling, response formatting, error management
- **Route Integration**: End-to-end API functionality tests
- **Auth Service/Middleware**: Token generation, verification, protection logic

## Error Handling

The project implements a robust error handling system:

1. **Custom Error Class (ApiError)**

   - Status code management
   - Error classification
   - Stack trace preservation

2. **Global Error Handler**

   - Centralized error processing
   - Environment-based error responses
   - Error logging integration

3. **Async Handler**

   - Promise rejection catching
   - Express middleware integration
   - Route handler wrapping

4. **Not Found Handler**
   - Catches requests to undefined routes.
   - Generates a 404 `ApiError`.

## Features

### Logging System

- Production-grade logging with Winston
- Daily rotating log files
- Different log levels for development and production
- HTTP request logging with Morgan
- Separate error logs and combined logs

### Authentication & Authorization

- Secure user registration and login.
- JWT-based access and refresh tokens.
- HttpOnly cookie for refresh token storage.
- Role-Based Access Control (RBAC) for differentiating user permissions.

### Database

- MongoDB integration with Mongoose
- Containerized database with Docker
- Environment-based configuration

### Development Tools

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for Git hooks
- Lint-staged for pre-commit checks

### AI Integration

- Utility function (`AIRequest.ts`) to interact with AI models via OpenAI SDK.
- Configurable for different models (defaults to Gemini via compatible endpoint).

### Docker Support

- Multi-environment Docker compositions
- Production-ready Dockerfile
- Development and testing environments
- MongoDB container integration

## Input Validation & Sanitization

### Environment Variables

Environment variables are validated and sanitized using Zod schemas. This ensures type safety and proper validation at runtime.

```typescript
// Example environment validation
const env = validateEnv();
console.log(env.NODE_ENV); // typed as 'development' | 'production' | 'test'
console.log(env.PORT); // typed as number
```

Required environment variables:

- `MONGODB_URL`: MongoDB connection URL (required, must be valid URL)
- `OPENAI_API_KEY`: API Key for the AI service (required).
- `JWT_SECRET`: Secret key for signing JWTs (required).

Optional environment variables (with defaults):

- `NODE_ENV`: Application environment ('development', 'production', 'test', defaults to 'development')
- `PORT`: Application port (defaults to 3000)
- See `src/config/env.validation.ts` for all variables and defaults (e.g., `COOKIE_SECRET`, `API_RATE_LIMIT`, `LOG_LEVEL`).

### Request Validation

The application includes a robust request validation middleware using Zod:

```typescript
// Example route with validation
app.post(
  '/users',
  validate({
    body: z.object({
      // Example schema
      name: z.string().min(3),
      email: z.string().email(),
    }),
    // Can also validate params, query, cookies
  }),
  userController.createUser
);
```

Features:

- Validate request body, query parameters, URL parameters, and cookies.
- Type-safe validation with TypeScript integration
- Detailed error messages
- Automatic request data parsing and transformation

## Available Scripts

- `yarn start` - Start production server with PM2
- `yarn dev` - Start development server with nodemon
- `yarn build` - Build TypeScript code
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn coverage` - Generate test coverage report
- `yarn coverage:coveralls` - Send coverage report to Coveralls (if configured)
- `yarn lint` - Run ESLint
- `yarn format` - Run Prettier check
- `yarn docker:prod` - Run production Docker environment
- `yarn docker:dev` - Run development Docker environment
- `yarn docker:test` - Run test Docker environment
- `yarn prepare` - Setup Husky git hooks

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Configure required environment variables

4. Start development server:
   ```bash
   yarn dev
   ```

### Using Docker

Development environment:

```bash
yarn docker:dev
```

Production environment:

```bash
yarn docker:prod
```

## License

MIT

## Author

Shuvrojit Biswas
