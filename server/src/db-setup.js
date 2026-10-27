import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');

// Load environment variables if .env exists
dotenv.config({ path: path.resolve(serverDir, '.env') });

// Guarantee DATABASE_URL exists with fallback to SQLite
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
process.env.DATABASE_URL = databaseUrl;

// Also ensure server/.env exists so Prisma CLI's internal loader finds it
const envFile = path.resolve(serverDir, '.env');
if (!fs.existsSync(envFile)) {
  fs.writeFileSync(envFile, `DATABASE_URL="${databaseUrl}"\n`, 'utf-8');
}

console.log(`🗄️ Setting up database with DATABASE_URL=${databaseUrl}`);

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    cwd: serverDir,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  console.log('Pushing database schema...');
  execSync('npx prisma db push --accept-data-loss', {
    cwd: serverDir,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
