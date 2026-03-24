# Technical Requirements

This document outlines the technology stack, constraints, and deployment requirements.

---

## Tech Stack

### Frontend & Backend
| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Framework | Nuxt 3 | Latest | Full-stack Vue framework with SSR, file-based routing |
| UI Library | Vue 3 | 3.x | Reactive UI, composition API |
| Styling | Tailwind CSS | 3.x | Utility-first, rapid development |
| Package Manager | npm | Latest | Standard Node.js package manager |

### Image Processing
| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Image Library | Sharp | Latest | High-performance image processing, WebP support |

### Video Processing
| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Video Library | fluent-ffmpeg | Latest | FFmpeg wrapper for video frame extraction |
| System Dependency | FFmpeg | Latest | Required for video thumbnail generation (included in Docker image) |

### Database
| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Database | PostgreSQL | 16.x | Reliable, scalable relational database |
| ORM | Prisma | Latest | Type-safe database client, migrations |

### Storage
| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Object Storage | MinIO | Latest | S3-compatible, self-hosted, handles large files |
| SDK | @aws-sdk/client-s3 | Latest | Standard S3 API client |

### Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Containerization | Docker + Docker Compose | Consistent dev/prod environment |
| Reverse Proxy | Nginx (production) | SSL termination, routing |
| Process Manager | PM2 or Docker | Keep Nuxt running |

---

## Constraints

### File Handling
- **Maximum file size:** 500MB per file
- **Supported image formats:** JPG, JPEG, PNG, GIF, WEBP
- **Supported video formats:** MP4, MOV, WEBM
- **Storage:** Files stored in local filesystem (`./uploads/{eventId}/`)

### Media Optimization (Images)
- **Thumbnail generation:** 300px width, WebP + JPEG fallback
- **Preview generation:** 1200px width, WebP + JPEG fallback
- **Original files:** Preserved for download
- **WebP quality:** 80%
- **JPEG fallback quality:** 85%
- **Browser fallback:** Automatic WebP/JPEG based on Accept header

### Media Optimization (Videos)
- **Video thumbnail:** Frame extracted at 1 second, 300px width
- **Thumbnail formats:** WebP + JPEG fallback
- **Original videos:** Preserved (no transcoding)
- **System requirement:** FFmpeg must be installed on server

### Security
- **No authentication:** Access controlled by link tokens only
- **Token format:** 16-character URL-safe random string
- **No password protection:** Anyone with link can access
- **No watermarking:** Files served as-is

### Functionality
- **No bulk download:** Individual file downloads only
- **No user accounts:** No registration or login
- **No video transcoding:** Videos served as-is (images optimized only)

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mediagallery

# MinIO / S3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=media-gallery
S3_REGION=us-east-1

# Application
NUXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Project Structure

```
media-gallery/
├── nuxt.config.ts           # Nuxt configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .env                     # Environment variables (not committed)
├── .env.example             # Environment template
├── docker-compose.yml       # PostgreSQL + MinIO
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── server/
│   ├── api/                 # API routes (Nuxt server)
│   │   ├── events/          # Event CRUD
│   │   ├── gallery/         # Public gallery access
│   │   ├── upload/          # File upload endpoints
│   │   └── media/           # Media operations
│   └── utils/
│       ├── db.ts            # Prisma client singleton
│       └── storage.ts       # MinIO client & helpers
├── pages/
│   ├── index.vue            # Home / create event
│   ├── event/
│   │   └── [id].vue         # Photographer dashboard
│   ├── gallery/
│   │   └── [token].vue      # Public gallery view
│   └── upload/
│       └── [token].vue      # Guest upload page
├── components/
│   ├── MediaGrid.vue        # Photo/video grid
│   ├── MediaViewer.vue      # Lightbox component
│   ├── UploadZone.vue       # Drag & drop uploads
│   └── VideoPlayer.vue      # Video playback
├── composables/             # Vue composables
├── types/                   # TypeScript types
└── public/                  # Static assets
```

---

## Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: mediagallery
      POSTGRES_PASSWORD: mediagallery
      POSTGRES_DB: mediagallery
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console

volumes:
  postgres_data:
  minio_data:
```

---

## Development Workflow

1. **Start services:** `docker-compose up -d`
2. **Install dependencies:** `npm install`
3. **Generate Prisma client:** `npx prisma generate`
4. **Run migrations:** `npx prisma migrate dev`
5. **Start dev server:** `npm run dev`

---

## Production Deployment

### VPS Requirements
- **OS:** Ubuntu 22.04 LTS or similar
- **CPU:** 2+ cores
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** Depends on media volume (SSD recommended)

### Deployment Steps
1. Install Docker and Docker Compose
2. Clone repository
3. Configure environment variables
4. Run `docker-compose up -d` (or use production compose file)
5. Set up Nginx reverse proxy with SSL (Let's Encrypt)
6. Configure firewall (allow 80, 443)

### Nginx Configuration (Example)
```nginx
server {
    listen 80;
    server_name gallery.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gallery.example.com;

    ssl_certificate /etc/letsencrypt/live/gallery.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gallery.example.com/privkey.pem;

    client_max_body_size 500M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
