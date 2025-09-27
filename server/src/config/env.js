const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the project root .env file.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Centralized configuration object for the application.
 * Keeps all environment-backed values in a single place so that the rest
 * of the codebase can rely on sensible defaults and avoid accessing
 * process.env directly.
 */
const parseOrigins = (value, fallbacks = []) => {
  const entries = (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...entries, ...fallbacks]));
};

const defaultClientOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
];

const clientOrigins = parseOrigins(process.env.CLIENT_URL, defaultClientOrigins);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: clientOrigins[0],
  clientOrigins,

  // Database configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event-management',
  mongodbName: process.env.DB_NAME || 'event-management',

  // JWT secrets & expiration windows
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    accessTtl: process.env.JWT_EXPIRE || '24h',
    refreshTtl: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Email transport
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },

  // Blockchain service configuration
  blockchain: {
    host: process.env.BLOCKCHAIN_HOST || 'localhost',
    port: Number(process.env.BLOCKCHAIN_PORT) || 8000,
    persistencePath: process.env.BLOCKCHAIN_STORE || path.resolve(process.cwd(), '.dist/blockchain-chain.json'),
  },

  // Third-party integrations
  integrations: {
    google: {
      calendarClientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
      calendarClientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
      calendarRedirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${clientOrigins[0]}/api/integrations/google/callback`,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${clientOrigins[0]}/api/integrations/linkedin/callback`,
    },
  },
};

if (!env.jwt.accessSecret) {
  throw new Error('JWT_SECRET is required. Please define it in your .env file.');
}

module.exports = env;
