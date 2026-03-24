-- CreateTable: guest_tokens (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "guest_tokens" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canUpload" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "mediaIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if they don't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "guest_tokens_token_key" ON "guest_tokens"("token");
CREATE INDEX IF NOT EXISTS "guest_tokens_eventId_idx" ON "guest_tokens"("eventId");
CREATE INDEX IF NOT EXISTS "guest_tokens_active_idx" ON "guest_tokens"("active");

-- Migrate data from old tables if they exist
DO $$
BEGIN
    -- Migrate from view_tokens if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'view_tokens') THEN
        INSERT INTO "guest_tokens" ("id", "eventId", "token", "name", "active", "canView", "canUpload", "canDelete", "mediaIds", "createdAt")
        SELECT
            "id",
            "eventId",
            "token",
            NULL as "name",
            "active",
            true as "canView",
            false as "canUpload",
            false as "canDelete",
            "mediaIds",
            "createdAt"
        FROM "view_tokens"
        ON CONFLICT ("id") DO NOTHING;
    END IF;

    -- Migrate from upload_tokens if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'upload_tokens') THEN
        INSERT INTO "guest_tokens" ("id", "eventId", "token", "name", "active", "canView", "canUpload", "canDelete", "mediaIds", "createdAt")
        SELECT
            "id",
            "eventId",
            "token",
            "name",
            "active",
            false as "canView",
            true as "canUpload",
            false as "canDelete",
            ARRAY[]::TEXT[] as "mediaIds",
            "createdAt"
        FROM "upload_tokens"
        ON CONFLICT ("id") DO NOTHING;
    END IF;

    -- Rename column in media table if old column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'uploadTokenId') THEN
        ALTER TABLE "media" RENAME COLUMN "uploadTokenId" TO "guestTokenId";
    END IF;

    -- Add guestTokenId column if it doesn't exist (for fresh databases)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'guestTokenId') THEN
        ALTER TABLE "media" ADD COLUMN "guestTokenId" TEXT;
    END IF;
END $$;

-- Drop old index and create new one
DROP INDEX IF EXISTS "media_uploadTokenId_idx";
CREATE INDEX IF NOT EXISTS "media_guestTokenId_idx" ON "media"("guestTokenId");

-- Add foreign key constraint for guest_tokens (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'guest_tokens_eventId_fkey') THEN
        ALTER TABLE "guest_tokens" ADD CONSTRAINT "guest_tokens_eventId_fkey"
            FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Update foreign key for media table
ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_uploadTokenId_fkey";
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_guestTokenId_fkey') THEN
        ALTER TABLE "media" ADD CONSTRAINT "media_guestTokenId_fkey"
            FOREIGN KEY ("guestTokenId") REFERENCES "guest_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Drop old tables if they exist
DROP TABLE IF EXISTS "view_tokens";
DROP TABLE IF EXISTS "upload_tokens";
