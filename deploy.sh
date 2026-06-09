#!/bin/bash
# Pizarra Libertadores de Marlboro - Deploy Script
# Run this after unzipping pizarra-src.zip

set -e

echo "🐴 Instalando dependencias..."
npm install

echo "🔨 Construyendo..."
npm run build

echo "🚀 Deploying a Vercel..."
npx vercel --prod

echo "✅ Listo!"
