import { env, validateEnv } from './env.validation';

// Initialize env if not already done
if (!env) {
  validateEnv();
}

const config = {
  // Application
  env: env.NODE_ENV,
  port: env.PORT,

  // API
  apiVersion: env.API_VERSION,
  rateLimit: env.API_RATE_LIMIT,

  // Logging
  logs: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },

  // JWT (for future use)
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
};

export default config;
