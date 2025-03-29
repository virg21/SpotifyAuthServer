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
  
  // Log environment variable access for debugging
  console.log(`Accessing env var: ${key} = ${value || '(not set)'}`);
  
  if (!value && required) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value || '';
}

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnv(): void {
  const requiredVars = [
    'NODE_ENV'
  ];
  
  // Optional vars that we check but don't require
  const optionalVars = [
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SPOTIFY_REDIRECT_URI',
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'EVENTBRITE_API_KEY',
    'BANDSINTOWN_API_KEY',
    'TICKETMASTER_API_KEY'
  ];
  
  // Check required vars
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Log which optional vars are available
  const availableOptionalVars = optionalVars.filter(varName => process.env[varName]);
  const missingOptionalVars = optionalVars.filter(varName => !process.env[varName]);
  
  if (availableOptionalVars.length > 0) {
    console.log(`Available optional environment variables: ${availableOptionalVars.join(', ')}`);
  }
  
  if (missingOptionalVars.length > 0) {
    console.warn(`Missing optional environment variables: ${missingOptionalVars.join(', ')}`);
  }
}