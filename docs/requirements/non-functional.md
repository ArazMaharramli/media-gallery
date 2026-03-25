# Non-Functional Requirements

This document outlines performance, security, scalability, reliability, and deployment requirements.

---

## 1. Performance

### Response Times
| Operation | Target | Maximum |
|-----------|--------|---------|
| Page load (initial) | < 2s | 5s |
| API response (read) | < 200ms | 500ms |
| API response (write) | < 500ms | 2s |
| File upload start | < 1s | 3s |
| Thumbnail generation | < 3s | 10s |

### Upload/Download
| Metric | Target |
|--------|--------|
| Upload throughput | Limited by network, not application |
| Download throughput | Limited by network, not application |
| Concurrent uploads per event | 3 parallel |
| Max file size | 500 MB |

### Client-Side Performance
| Metric | Target |
|--------|--------|
| Lighthouse Performance Score | > 80 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |

### Optimization Strategies
- Lazy loading for media grid (load on scroll)
- Image thumbnails for grid view (not full resolution)
- Chunked file uploads for large files
- Browser caching for static assets
- Presigned URLs for direct S3 downloads (bypass server)

---

## 2. Security

### Access Control
| Aspect | Approach |
|--------|----------|
| Authentication | None (link-based access only) |
| Authorization | Token validation for gallery/upload links |
| Event dashboard | Anyone with event ID can access (MVP) |

### Token Security
| Requirement | Specification |
|-------------|---------------|
| Token length | 16 characters |
| Character set | URL-safe alphanumeric (A-Za-z0-9-_) |
| Entropy | ~96 bits (cryptographically random) |
| Uniqueness | Enforced by database constraint |
| Expiration | None (MVP) |

### Input Validation
| Input | Validation |
|-------|------------|
| Event name | 1-100 chars, sanitized |
| Description | 0-500 chars, sanitized |
| File uploads | MIME type verification, size limits |
| UUIDs | Format validation |
| Tokens | Length and character validation |

### File Security
| Aspect | Approach |
|--------|----------|
| File type validation | Check MIME type AND file extension |
| Malicious files | Scan file headers, not just extension |
| Storage isolation | Files stored with generated names, not user input |
| Path traversal | Filename validation + resolved path verification |
| Directory escape | Verify file paths stay within upload directory |

### Headers & Transport
| Header/Feature | Value |
|----------------|-------|
| HTTPS | Required in production |
| HSTS | Strict-Transport-Security: max-age=31536000 |
| Content-Type | Always set correctly for downloads |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| CSP | Appropriate policy for Nuxt app |

### Known Limitations (MVP)
- No rate limiting
- No CAPTCHA for uploads
- No abuse detection
- Event IDs are guessable (UUIDs, but no access control)

---

## 3. Scalability

### Capacity Targets (MVP)
| Metric | Target |
|--------|--------|
| Concurrent users | 50-100 |
| Events | 1,000+ |
| Media per event | 500+ |
| Total storage | Limited by VPS disk/MinIO |

### Database Scaling
| Strategy | When |
|----------|------|
| Connection pooling | Default via Prisma |
| Read replicas | Not needed for MVP |
| Partitioning | Not needed for MVP |
| Indexes | On foreign keys, tokens, timestamps |

### Storage Scaling
| Strategy | When |
|----------|------|
| MinIO on same VPS | MVP |
| Dedicated MinIO server | When storage > VPS capacity |
| Cloud S3 | When self-hosted becomes burden |

### Application Scaling
| Strategy | When |
|----------|------|
| Single Nuxt instance | MVP |
| PM2 cluster mode | When CPU-bound |
| Multiple servers + LB | When single server insufficient |

### Growth Considerations
- Storage will grow linearly with uploads
- Monitor disk usage, set alerts at 80%
- Consider retention policies for old events

---

## 4. Reliability

### Availability Target
| Environment | Target |
|-------------|--------|
| Development | Best effort |
| Production | 99% (allows ~7h downtime/month) |

### Backup Strategy
| Component | Strategy | Frequency |
|-----------|----------|-----------|
| PostgreSQL | pg_dump to backup location | Daily |
| MinIO | mc mirror to backup location | Daily |
| Application code | Git repository | Continuous |

### Recovery
| Scenario | Recovery Time | Recovery Point |
|----------|---------------|----------------|
| Application crash | < 5 min (auto-restart) | No data loss |
| Database corruption | < 1 hour | Last backup |
| Storage failure | < 2 hours | Last backup |
| Full server failure | < 4 hours | Last backup |

### Monitoring (Recommended)
| What | Tool |
|------|------|
| Server uptime | UptimeRobot, Pingdom |
| Resource usage | htop, Netdata, Grafana |
| Application errors | Console logs, Sentry (optional) |
| Disk space | df alerts |

### Error Handling
| Scenario | Behavior |
|----------|----------|
| Upload failure | Show error, allow retry |
| Database unavailable | 503 Service Unavailable |
| Storage unavailable | 503 Service Unavailable |
| Invalid token | 404 Not Found |
| File not found | 404 Not Found |

---

## 5. Deployment

### Environment Requirements

#### Development
| Component | Requirement |
|-----------|-------------|
| Node.js | 18.x or 20.x LTS |
| Docker | Latest stable |
| npm | Latest stable |

#### Production VPS
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage (OS) | 20 GB SSD | 40 GB SSD |
| Storage (Media) | Depends on usage | Start with 100 GB, expand |
| Bandwidth | Unmetered preferred | - |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Deployment Architecture

```
                    [Internet]
                        │
                        ▼
                    [Nginx]
                  (SSL, Proxy)
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
        [Nuxt App]  [PostgreSQL]  [MinIO]
        (Port 3000) (Port 5432)  (Ports 9000/9001)
```

### Container Strategy
| Service | Containerized |
|---------|---------------|
| PostgreSQL | Yes (Docker) |
| MinIO | Yes (Docker) |
| Nuxt App | Optional (can run with PM2) |
| Nginx | Can be host-level or Docker |

### SSL/TLS
| Requirement | Solution |
|-------------|----------|
| Certificate | Let's Encrypt (free) |
| Auto-renewal | certbot with cron |
| Minimum TLS | 1.2 |

### Deployment Checklist
- [ ] VPS provisioned and secured
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured (allow 80, 443, SSH)
- [ ] Domain DNS configured
- [ ] SSL certificate obtained
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] MinIO bucket created
- [ ] Nginx configured as reverse proxy
- [ ] Application started and healthy
- [ ] Backups scheduled
- [ ] Monitoring configured

---

## 6. Maintainability

### Code Quality
| Aspect | Standard |
|--------|----------|
| TypeScript | Strict mode enabled |
| Linting | ESLint with recommended rules |
| Formatting | Prettier |
| Testing | Unit tests for utils (optional for MVP) |

### Documentation
| Document | Location |
|----------|----------|
| Requirements | `/docs/requirements/` |
| API docs | `/docs/requirements/api.md` |
| Setup guide | `README.md` |

### Logging
| Log Type | Content |
|----------|---------|
| Access logs | HTTP requests (via Nginx) |
| Application logs | Errors, warnings, info |
| Audit logs | Not required for MVP |

### Updates & Maintenance
| Task | Frequency |
|------|-----------|
| Security updates (OS) | Monthly or as needed |
| Dependency updates | Monthly |
| Database vacuum | Weekly (automated) |
| Log rotation | Automated via logrotate |
| Backup verification | Monthly |
