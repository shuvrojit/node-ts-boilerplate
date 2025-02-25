# Node.js TypeScript Boilerplate

A production-ready Node.js boilerplate with TypeScript, Express, MongoDB, and comprehensive testing setup.

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
│   │   ├── db.ts        # Database connection
│   │   ├── logger.ts    # Winston logger setup
│   │   └── morgan.ts    # HTTP request logging
│   ├── app.ts           # Express app setup
│   └── index.ts         # Application entry point
├── tests/
│   ├── integration/     # Integration tests
│   └── unit/           # Unit tests
├── logs/               # Application logs
├── docker-compose.yml  # Base Docker composition
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.test.yml
└── ecosystem.config.json # PM2 configuration
```

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

### Testing

- Comprehensive test setup with Jest
- Unit tests and Integration tests separation
- Test coverage reporting
- Docker-based test environment

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

## License

MIT

## Author

Shuvrojit Biswas
