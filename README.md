# Media Gallery

A media gallery application for event photographers to share photos and videos with guests. Built with Nuxt 3, PostgreSQL, and Prisma.

## Features

- Create and manage events
- Generate shareable upload links for guests
- Generate view-only gallery links
- QR code generation for easy sharing
- Support for photos and videos
- **Image optimization**: WebP + JPEG thumbnails and previews
- **Video optimization**: WebM/VP9 + MP4/H.264 compressed previews
- **Next-gen format support**: Browser auto-selects best format
- **Infinite scroll**: Paginated media loading
- **Responsive design**: Mobile-friendly layout with sticky footer

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, Tailwind CSS
- **Backend**: Nitro (Nuxt server)
- **Database**: PostgreSQL
- **ORM**: Prisma

## Prerequisites

- Node.js 22+
- Docker and Docker Compose

## Quick Start

### Using Docker (Recommended)

```bash
# Start PostgreSQL and the app
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at http://localhost:3000

### Local Development

```bash
# Start PostgreSQL only
docker compose up -d postgres

# Install dependencies
npm install

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/media_gallery"
```

## API Endpoints

All API responses follow a unified format:

```json
{
  "success": true,
  "traceId": "uuid",
  "timestamp": "ISO-8601",
  "data": { ... }
}
```

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Create a new event |
| GET | `/api/events/:id` | Get event details |

### Upload Tokens

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/:id/upload-tokens` | List upload tokens |
| POST | `/api/events/:id/upload-tokens` | Create upload token |
| PATCH | `/api/events/:id/upload-tokens/:tokenId/deactivate` | Deactivate token |

### View Tokens

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/:id/view-tokens` | List view tokens |
| POST | `/api/events/:id/view-tokens` | Create view token |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/:id/media` | List media for event |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home - Create new events |
| `/event/:id` | Event dashboard - Manage tokens and media |
| `/upload/:token` | Upload page for guests |
| `/gallery/:token` | View-only gallery for guests |

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run db:push    # Push Prisma schema to database
npm run db:studio  # Open Prisma Studio
```

## Docker Commands

```bash
docker compose up -d          # Start all services
docker compose up --build     # Rebuild and start
docker compose down           # Stop all services
docker compose logs -f app    # View app logs
docker compose logs -f postgres  # View database logs
```

## Project Structure

```
media-gallery/
├── pages/              # Vue pages
├── server/
│   ├── api/            # API routes
│   ├── middleware/     # Server middleware
│   ├── plugins/        # Server plugins
│   └── utils/          # Utilities (db, errors, response)
├── prisma/
│   └── schema.prisma   # Database schema
├── docker-compose.yml  # Docker services
├── Dockerfile          # App container
└── .env                # Environment variables
```

## Security

- **Path traversal protection**: Filename validation and directory boundary checks
- **Token-based access**: Cryptographically random 16-character tokens
- **Input validation**: Zod schemas for all API inputs
- **MIME type verification**: File type validation on upload

## License

MIT
