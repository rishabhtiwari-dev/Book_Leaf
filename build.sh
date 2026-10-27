#!/usr/bin/env bash
set -e

echo "📦 Installing server dependencies..."
npm --prefix server install

echo "📦 Installing client dependencies..."
npm --prefix client install

echo "🔨 Building frontend with Vite..."
npm --prefix client run build

echo "🗄️ Setting up SQLite database and Prisma client..."
cd server
npx prisma generate
npx prisma db push
node src/seed/index.js
cd ..

echo "✅ Build and seed completed successfully!"
