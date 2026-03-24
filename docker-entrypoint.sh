#!/bin/sh
set -e

# Fix permissions for uploads directory (volume mount may have root ownership)
chown -R nuxtjs:nodejs /app/uploads

echo "Running database migrations..."

# Run the custom migration SQL first (handles data migration from old tables)
# This is idempotent and safe to run multiple times
if [ -f ./prisma/migrations/20260324000000_merge_guest_tokens/migration.sql ]; then
    echo "Applying GuestToken migration..."
    # psql accepts DATABASE_URL directly via the connection string
    psql "$DATABASE_URL" -f ./prisma/migrations/20260324000000_merge_guest_tokens/migration.sql 2>&1 || echo "Migration SQL already applied or not needed"
fi

# Sync schema (this ensures schema matches Prisma, without data loss)
echo "Syncing database schema..."
prisma db push --schema=./prisma/schema.prisma --skip-generate

echo "Starting application..."
exec su-exec nuxtjs node .output/server/index.mjs
