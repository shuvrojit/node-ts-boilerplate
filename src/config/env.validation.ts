import { z } from 'zod';

/**
 * Environment variable schema with validation rules
 * Add all application environment variables here
 */
export const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3000),

  // Database
  MONGODB_URL: z.string().url({
    message: 'Invalid MongoDB connection string',
  }),
  DB_NAME: z.string().default('simple-auth'),

  // Logging (optional with defaults)
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z
    .enum(['combined', 'common', 'dev', 'short', 'tiny'])
    .default('dev'),

  // Security (for future use)
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('1d'),

  // API Configuration
  API_VERSION: z.string().default('v1'),
  API_RATE_LIMIT: z.coerce.number().positive().default(100),
});

export type EnvVars = z.infer<typeof envSchema>;

/**
 * Global environment variables instance
 * Use this to access validated env vars throughout the application
 */
export let env: EnvVars;

/**
 * Validates and sanitizes environment variables
 * @throws {Error} if validation fails
 */
export const validateEnv = (): EnvVars => {
  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((issue) => {
        return `${issue.path.join('.')}: ${issue.message}`;
      });
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
};
