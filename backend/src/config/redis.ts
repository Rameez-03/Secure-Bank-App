import { createClient, RedisClientType } from 'redis';
import config from './index';
import logger from '../utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Session management utilities
export const sessionManager = {
  async createSession(userId: string, refreshToken: string, metadata: any): Promise<string> {
    const sessionId = `session:${userId}:${Date.now()}`;
    const sessionData = {
      userId,
      refreshToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + config.session.maxAge,
      ...metadata,
    };
    
    await redisClient.setEx(
      sessionId,
      config.session.maxAge / 1000,
      JSON.stringify(sessionData)
    );
    
    return sessionId;
  },

  async getSession(sessionId: string): Promise<any | null> {
    const data = await redisClient.get(sessionId);
    return data ? JSON.parse(data) : null;
  },

  async deleteSession(sessionId: string): Promise<void> {
    await redisClient.del(sessionId);
  },

  async deleteUserSessions(userId: string): Promise<void> {
    const keys = await redisClient.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  },

  async updateSessionExpiry(sessionId: string): Promise<void> {
    await redisClient.expire(sessionId, config.session.maxAge / 1000);
  },
};

// Rate limiting utilities
export const rateLimiter = {
  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, window);
    }
    
    return current <= limit;
  },

  async getRemaining(key: string, limit: number): Promise<number> {
    const current = await redisClient.get(key);
    return limit - (current ? parseInt(current) : 0);
  },

  async reset(key: string): Promise<void> {
    await redisClient.del(key);
  },
};

// Cache utilities
export const cache = {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, data);
    } else {
      await redisClient.set(key, data);
    }
  },

  async get(key: string): Promise<any | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  },

  async clear(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  },
};