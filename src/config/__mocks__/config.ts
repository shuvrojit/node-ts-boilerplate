// Mock config for testing purposes
const config = {
  env: 'test',
  port: 3000,
  mongoose: {
    url: 'mongodb://localhost:27017/test-db',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: 'test-jwt-secret',
    accessExpirationMinutes: 30,
    refreshExpirationDays: 30,
  },
};

export default config;
