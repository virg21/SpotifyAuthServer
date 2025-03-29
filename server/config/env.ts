import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
  
  if (required && value === undefined) {
    throw new Error(`Required environment variable ${key} is missing`);
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
    'SPOTIFY_REDIRECT_URI'
  ];
  
  const missingVars = requiredVars.filter(key => !process.env[key]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file or environment variables.'
    );
  }
  
  console.log('✅ Environment variables validated successfully');
}
