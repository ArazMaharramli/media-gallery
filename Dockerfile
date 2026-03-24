FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Separate stage for runtime dependencies (cached independently)
FROM base AS runtime-deps
WORKDIR /app
# Only copy what's needed to install these specific packages
RUN npm init -y && npm install --omit=dev sharp fluent-ffmpeg && rm package.json package-lock.json

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install ffmpeg for video thumbnail generation and su-exec for user switching
RUN apk add --no-cache ffmpeg su-exec

# Install prisma CLI (matching project version) for migrations
RUN npm install -g prisma@6

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copy runtime dependencies from cached stage (this layer is cached!)
COPY --from=runtime-deps /app/node_modules ./node_modules

# Copy built app
COPY --from=builder /app/.output ./.output

# Copy Prisma files for migrations
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY prisma ./prisma/

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create uploads directory with correct permissions
RUN mkdir -p /app/uploads && chown -R nuxtjs:nodejs /app

# Don't switch to nuxtjs yet - entrypoint will handle permissions and then switch
# USER nuxtjs

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["./docker-entrypoint.sh"]
