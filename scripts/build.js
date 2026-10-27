import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.resolve(rootDir, 'server');
const clientDir = path.resolve(rootDir, 'client');

// 1. Ensure DATABASE_URL is in environment
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
process.env.DATABASE_URL = databaseUrl;

// 2. Ensure server/.env exists so Prisma CLI finds it automatically
const serverEnvPath = path.resolve(serverDir, '.env');
if (!fs.existsSync(serverEnvPath)) {
  console.log('📝 Creating server/.env with default SQLite configuration...');
  const envContent = [
    `DATABASE_URL="${databaseUrl}"`,
    `JWT_SECRET="${process.env.JWT_SECRET || 'bookleaf-secret-key-production'}"`,
    `PORT=${process.env.PORT || 3001}`,
    `NODE_ENV=${process.env.NODE_ENV || 'production'}`,
    `OPENAI_API_KEY="${process.env.OPENAI_API_KEY || ''}"`,
  ].join('\n');
  fs.writeFileSync(serverEnvPath, envContent, 'utf-8');
}

const execOptions = {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
  },
};

console.log('📦 Step 1: Installing server dependencies...');
execSync('npm install', { ...execOptions, cwd: serverDir });

console.log('📦 Step 2: Installing client dependencies...');
execSync('npm install', { ...execOptions, cwd: clientDir });

console.log('🔨 Step 3: Building client with Vite...');
execSync('npm run build', { ...execOptions, cwd: clientDir });

console.log('🗄️ Step 4: Generating Prisma Client...');
execSync('npx prisma generate', { ...execOptions, cwd: serverDir });

console.log('🗄️ Step 5: Pushing Prisma Database Schema...');
execSync('npx prisma db push --accept-data-loss', { ...execOptions, cwd: serverDir });

console.log('🌱 Step 6: Seeding initial authors & books...');
execSync('node src/seed/index.js', { ...execOptions, cwd: serverDir });

console.log('✅ Build and database setup completed successfully!');
