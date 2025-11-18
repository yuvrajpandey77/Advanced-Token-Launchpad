import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Load environment variables from .env file
 * This should be called at the start of CLI scripts
 */
export function loadEnv(): void {
  // Try to load .env file from project root
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    config({ path: envPath });
    console.log('✅ Loaded environment variables from .env file\n');
  } else {
    // Silently continue if .env doesn't exist
    // User can still use environment variables directly
  }
}

