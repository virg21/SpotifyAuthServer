import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve('./server/.env') });

/**
 * Environment variable configuration
 * Safely get environment variables with validation
 * 
 * @param key Environment variable name
 * @param required Whether the variable is required 
 * @returns The environment variable value
 * @throws Error if required variable is missing
 */
export function getEnv(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (!value && required) {
    throw new Error(`Environment variable ${key} is required but not set.`);
  }
  
  return value || '';
}

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnv(): void {
  const requiredVars = [
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'REDIRECT_URI',
    'SESSION_SECRET'
  ];
  
  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}