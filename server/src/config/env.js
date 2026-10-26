import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration loaded from environment variables.
 */
const config = {
  /** Database connection URL */
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',

  /** Secret key for JWT token signing */
  jwtSecret: process.env.JWT_SECRET || 'bookleaf-jwt-secret-change-in-production',

  /** OpenAI API key for AI-powered features */
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  /** Server port */
  port: parseInt(process.env.PORT || '3001', 10),

  /** Node environment */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** Whether we're in production */
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
