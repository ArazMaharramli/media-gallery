# Media Gallery - Requirements Documentation

A simple media sharing platform for event photographers to share photos and videos with clients.

## Overview

This application allows photographers to:
- Create events and upload media (photos/videos)
- Share a view link with clients to browse and download media
- Share an upload link with event guests to contribute their own media

## Documents Index

| Document | Description |
|----------|-------------|
| [User Flows](./user-flows.md) | Detailed user journeys for photographers, clients, and guests |
| [Features](../features/) | Feature specifications by persona |
| [Technical](./technical.md) | Tech stack, constraints, and deployment requirements |
| [Data Model](./data-model.md) | Database schema and entity definitions |
| [API](./api.md) | API conventions and standards |
| [Non-Functional](./non-functional.md) | Performance, security, and scalability requirements |

## MVP Scope

### In Scope
- Event creation (name, description)
- Photo/video upload (photographer and guest)
- Media viewing (grid, lightbox, video player)
- Individual file download
- Link-based sharing (view link + upload link)

### Out of Scope (Future)
- User authentication / accounts
- Password-protected galleries
- Watermarking
- Bulk download (ZIP)
- Payment / monetization
- Media editing / cropping
- Comments / favorites
