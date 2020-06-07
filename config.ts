import * as dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

export const REDIS_LOGIN_ATTEMPTS_DB = parseInt(process.env.REDIS_LOGIN_ATTEMPTS_DB);
export const REDIS_BANNED_IPS_DB = parseInt(process.env.REDIS_BANNED_IPS_DB);

export const MAX_ATTEMPTS = parseInt(process.env.MAX_ATTEMPTS);
export const TIME_INTERVAL = parseInt(process.env.TIME_INTERVAL);
export const MAX_ATTEMPTS_EXCEEDED_PENALTY = parseInt(process.env.MAX_ATTEMPTS_EXCEEDED_PENALTY);
