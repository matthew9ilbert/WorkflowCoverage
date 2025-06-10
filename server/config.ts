import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

export const environment = process.env.NODE_ENV || 'development';

export const config = {
  db: {
    url: process.env.DATABASE_URL!
  },
  server: {
    port: parseInt(process.env.PORT || '3000')
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!
  }
};

// Validate required configurations
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}
