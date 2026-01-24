import dotenv from 'dotenv';

dotenv.config();

interface Config {
  env: string;
  port: number;
  apiVersion: string;
  mongodb: {
    uri: string;
    testUri: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  encryption: {
    key: string;
    algorithm: string;
  };
  plaid: {
    clientId: string;
    secret: string;
    env: 'sandbox' | 'development' | 'production';
    products: string[];
    countryCodes: string[];
    redirectUri: string;
    useMock: boolean;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  frontend: {
    url: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  session: {
    maxAge: number;
    cleanupInterval: number;
  };
  security: {
    bcryptRounds: number;
    maxLoginAttempts: number;
    lockTime: number;
  };
  cors: {
    origin: string;
  };
  logging: {
    level: string;
    filePath: string;
  };
  aws: {
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    s3Bucket?: string;
    cloudWatchLogGroup?: string;
  };
  features: {
    enable2FA: boolean;
    enableEmailVerification: boolean;
    enableAuditLogging: boolean;
    enableGDPR: boolean;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-banking',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/secure-banking-test',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'development_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'development_refresh_secret_change_in_production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'development_key_32_bytes_hex_change',
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  },
  
  plaid: {
    clientId: process.env.PLAID_CLIENT_ID || '',
    secret: process.env.PLAID_SECRET || '',
    env: (process.env.PLAID_ENV as 'sandbox' | 'development' | 'production') || 'sandbox',
    products: (process.env.PLAID_PRODUCTS || 'transactions,auth').split(','),
    countryCodes: (process.env.PLAID_COUNTRY_CODES || 'GB,US').split(','),
    redirectUri: process.env.PLAID_REDIRECT_URI || 'http://localhost:3000/oauth-redirect',
    useMock: process.env.USE_MOCK_PLAID === 'true',
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@yourbank.com',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  session: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000', 10),
    cleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '3600000', 10),
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockTime: parseInt(process.env.LOCK_TIME || '1800000', 10),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    cloudWatchLogGroup: process.env.AWS_CLOUDWATCH_LOG_GROUP,
  },
  
  features: {
    enable2FA: process.env.ENABLE_2FA === 'true',
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true',
    enableGDPR: process.env.ENABLE_GDPR_FEATURES === 'true',
  },
};

// Validate required configuration in production
if (config.env === 'production') {
  const required = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
    'MONGODB_URI',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Ensure secrets are strong enough
  if (config.jwt.accessSecret.length < 64) {
    throw new Error('JWT_ACCESS_SECRET must be at least 64 characters');
  }
  
  if (config.jwt.refreshSecret.length < 64) {
    throw new Error('JWT_REFRESH_SECRET must be at least 64 characters');
  }
}

export default config;