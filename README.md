# Node.js TypeScript Boilerplate

A production-ready Node.js boilerplate with TypeScript, Express, MongoDB, and comprehensive testing setup using Test-Driven Development (TDD) approach.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Logging:** Winston + Morgan
- **Testing:** Jest with Supertest
- **Code Quality:** ESLint, Prettier, Husky
- **Process Manager:** PM2
- **Containerization:** Docker

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.ts    # Environment configuration
│   │   ├── db.ts        # Database connection
│   │   ├── logger.ts    # Winston logger setup
│   │   └── morgan.ts    # HTTP request logging
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   │   ├── asyncHandler.ts    # Async error wrapper
│   │   └── errorHandler.ts    # Global error handler
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   │   └── v1/        # API v1 routes
│   ├── services/       # Business logic
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   │   └── ApiError.ts # Custom error class
│   ├── app.ts         # Express app setup
│   └── index.ts       # Application entry point
├── tests/
│   ├── integration/   # Integration tests
│   │   └── app.test.ts
│   └── unit/         # Unit tests
│       ├── config/   # Configuration tests
│       ├── middlewares/
│       └── utils/    # Utility function tests
├── logs/            # Application logs
├── docker-compose.yml  # Base Docker composition
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.test.yml
└── ecosystem.config.json # PM2 configuration
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
- **Integration Tests:** Test component interactions
  - API endpoint tests
  - Database operations
  - Middleware chain tests

### Test Categories

1. **Config Tests**

   - Environment variable handling
   - Database configuration
   - Logger setup
   - Morgan configuration

2. **Middleware Tests**

   - Error handling
   - Async operation handling
   - Request processing

3. **Utility Tests**
   - Custom error handling
   - Helper functions

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

## Features

### Logging System

- Production-grade logging with Winston
- Daily rotating log files
- Different log levels for development and production
- HTTP request logging with Morgan
- Separate error logs and combined logs

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

### Docker Support

- Multi-environment Docker compositions
- Production-ready Dockerfile
- Development and testing environments
- MongoDB container integration

## Available Scripts

- `yarn start` - Start production server with PM2
- `yarn dev` - Start development server with nodemon
- `yarn build` - Build TypeScript code
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn coverage` - Generate test coverage report
- `yarn lint` - Run ESLint
- `yarn format` - Run Prettier check
- `yarn docker:prod` - Run production Docker environment
- `yarn docker:dev` - Run development Docker environment
- `yarn docker:test` - Run test Docker environment

## Environment Variables

Required environment variables:

- `NODE_ENV`: Application environment (development/production)
- `MONGODB_URL`: MongoDB connection URL
- `PORT`: Application port (default: 8000)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables:

   - Copy `.env.example` to `.env` (if provided)
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

## Testing

Run all tests:

```bash
yarn test
```

Generate coverage report:

```bash
yarn coverage
```

Watch mode for TDD:

```bash
yarn test:watch
```

## License

MIT

## Author

Shuvrojit Biswas
