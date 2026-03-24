#!/bin/sh
set -e

# Fix permissions for uploads directory (volume mount may have root ownership)
chown -R nuxtjs:nodejs /app/uploads

echo "Running database migrations..."
prisma db push --schema=./prisma/schema.prisma --skip-generate

echo "Starting application..."
exec su-exec nuxtjs node .output/server/index.mjs
