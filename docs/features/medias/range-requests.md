# HTTP Range Request Support

**Description:** Enable efficient video streaming with seeking capability by supporting HTTP Range requests for partial content delivery.

---

## Problem Statement

Current file serving implementation sends the entire file for every request:

| Issue | Impact |
|-------|--------|
| No seeking support | User can't skip to 2:30 without downloading 0:00-2:30 |
| Full file transfer | 5GB video = 5GB download even for 30-second preview |
| No resume on interruption | Connection drop = download starts over |
| Poor mobile experience | Excessive data usage, slow loading |
| Browser buffering issues | May attempt to buffer entire file |

---

## Acceptance Criteria

### Server-Side
- [ ] Parse `Range` header from requests
- [ ] Return `206 Partial Content` for range requests
- [ ] Return `200 OK` with full file when no range specified
- [ ] Set `Accept-Ranges: bytes` header on all media responses
- [ ] Set correct `Content-Range` header for partial responses
- [ ] Handle invalid/malformed range requests gracefully
- [ ] Support single range requests (multi-range optional)
- [ ] Work with all video formats (MP4, WebM, MOV)
- [ ] Work with preview variants

### Client-Side
- [ ] HTML5 video player automatically uses range requests
- [ ] Seeking works instantly (no full download required)
- [ ] Progress bar reflects buffered ranges
- [ ] Download button still downloads full file

---

## Technical Specification

### HTTP Headers

#### Request Headers
```
GET /api/uploads/{eventId}/{filename}
Range: bytes=1000000-1999999
```

#### Response Headers (Partial Content)
```
HTTP/1.1 206 Partial Content
Accept-Ranges: bytes
Content-Range: bytes 1000000-1999999/5368709120
Content-Length: 1000000
Content-Type: video/mp4
```

#### Response Headers (Full Content)
```
HTTP/1.1 200 OK
Accept-Ranges: bytes
Content-Length: 5368709120
Content-Type: video/mp4
```

### Range Request Formats

| Format | Example | Meaning |
|--------|---------|---------|
| Start-End | `bytes=0-999` | First 1000 bytes |
| Start only | `bytes=1000-` | From byte 1000 to end |
| Suffix | `bytes=-500` | Last 500 bytes |

### Response Status Codes

| Code | When | Description |
|------|------|-------------|
| 200 | No Range header | Full file response |
| 206 | Valid Range header | Partial content response |
| 416 | Invalid range | Range Not Satisfiable |

---

## Implementation

### Updated File Serving Endpoint

```typescript
// server/api/uploads/[eventId]/[filename].get.ts

export default defineEventHandler(async (event) => {
  // ... existing validation code ...

  const stat = statSync(targetPath)
  const fileSize = stat.size
  const rangeHeader = getHeader(event, 'range')

  // Always advertise range support
  setHeader(event, 'Accept-Ranges', 'bytes')
  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')

  // Handle range request
  if (rangeHeader) {
    const range = parseRangeHeader(rangeHeader, fileSize)

    if (!range) {
      // Invalid range
      setResponseStatus(event, 416) // Range Not Satisfiable
      setHeader(event, 'Content-Range', `bytes */${fileSize}`)
      return ''
    }

    const { start, end } = range
    const chunkSize = end - start + 1

    setResponseStatus(event, 206) // Partial Content
    setHeader(event, 'Content-Range', `bytes ${start}-${end}/${fileSize}`)
    setHeader(event, 'Content-Length', chunkSize)

    const stream = createReadStream(targetPath, { start, end })
    return sendStream(event, stream)
  }

  // Full file request
  setHeader(event, 'Content-Length', fileSize)
  const stream = createReadStream(targetPath)
  return sendStream(event, stream)
})

/**
 * Parse Range header and return start/end bytes
 */
function parseRangeHeader(
  rangeHeader: string,
  fileSize: number
): { start: number; end: number } | null {
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/)
  if (!match) return null

  let start = match[1] ? parseInt(match[1], 10) : 0
  let end = match[2] ? parseInt(match[2], 10) : fileSize - 1

  // Handle suffix range (bytes=-500)
  if (!match[1] && match[2]) {
    start = fileSize - parseInt(match[2], 10)
    end = fileSize - 1
  }

  // Validate range
  if (start < 0 || end >= fileSize || start > end) {
    return null
  }

  return { start, end }
}
```

---

## Video Seeking Flow

```
User clicks at 2:30 mark
        │
        ▼
Browser calculates byte offset (~50MB for 720p)
        │
        ▼
GET /video.mp4
Range: bytes=52428800-
        │
        ▼
Server returns:
HTTP/1.1 206 Partial Content
Content-Range: bytes 52428800-104857599/524288000
        │
        ▼
Browser plays from 2:30
(only downloads from that point onwards)
```

---

## Browser Compatibility

All modern browsers support Range requests automatically:

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Automatic chunk requests |
| Firefox | ✅ Full | Automatic chunk requests |
| Safari | ✅ Full | Automatic chunk requests |
| Edge | ✅ Full | Automatic chunk requests |
| Mobile Safari | ✅ Full | Critical for iOS video |
| Mobile Chrome | ✅ Full | Critical for Android video |

**Note:** iOS Safari *requires* Range request support for video playback. Without it, videos may not play at all on iOS devices.

---

## Testing

### Manual Testing

```bash
# Test range request
curl -i -H "Range: bytes=0-999" http://localhost:3000/api/uploads/{eventId}/video.mp4

# Expected response:
# HTTP/1.1 206 Partial Content
# Accept-Ranges: bytes
# Content-Range: bytes 0-999/5368709120
# Content-Length: 1000
```

### Automated Tests

```typescript
describe('Range Request Support', () => {
  it('should return 206 for valid range request', async () => {
    const response = await fetch('/api/uploads/event-id/video.mp4', {
      headers: { 'Range': 'bytes=0-999' }
    })

    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toMatch(/bytes 0-999\/\d+/)
    expect(response.headers.get('Accept-Ranges')).toBe('bytes')
  })

  it('should return 200 for request without Range header', async () => {
    const response = await fetch('/api/uploads/event-id/video.mp4')

    expect(response.status).toBe(200)
    expect(response.headers.get('Accept-Ranges')).toBe('bytes')
  })

  it('should return 416 for invalid range', async () => {
    const response = await fetch('/api/uploads/event-id/video.mp4', {
      headers: { 'Range': 'bytes=9999999999-' }
    })

    expect(response.status).toBe(416)
  })

  it('should handle suffix range', async () => {
    const response = await fetch('/api/uploads/event-id/video.mp4', {
      headers: { 'Range': 'bytes=-500' }
    })

    expect(response.status).toBe(206)
    // Should return last 500 bytes
  })
})
```

---

## Performance Benefits

### Without Range Requests
```
5GB video, user watches 30 seconds:
- Downloaded: 5GB
- Time to start: ~30 seconds (buffering)
- Data used: 5GB
```

### With Range Requests
```
5GB video, user watches 30 seconds:
- Downloaded: ~50MB (compressed preview, partial)
- Time to start: < 2 seconds
- Data used: ~50MB
```

**Data savings: ~99% for typical viewing patterns**

---

## Integration with Nginx (Production)

For production, Nginx can handle range requests more efficiently:

```nginx
server {
    # ... SSL config ...

    location /api/uploads/ {
        # Let Nginx handle static file serving with range support
        alias /path/to/uploads/;

        # Enable range requests (default, but explicit)
        add_header Accept-Ranges bytes;

        # Cache headers
        add_header Cache-Control "public, max-age=31536000";

        # CORS if needed
        add_header Access-Control-Allow-Origin *;
    }

    location / {
        # Proxy other requests to Nuxt
        proxy_pass http://localhost:3000;
    }
}
```

Benefits of Nginx serving:
- Zero-copy file serving (sendfile)
- Kernel-level optimization
- Frees Node.js for application logic
- Built-in range request handling

---

## Security Considerations

- Range requests don't bypass authentication/authorization
- Validate file access before processing Range header
- Protect against range request DoS (many small ranges)
- Consider rate limiting per-file requests
- Log suspicious patterns (excessive range requests)

---

## Mobile Considerations

### iOS Safari
- **Requires** Range request support for video playback
- Uses byte-range requests for all video seeking
- Without this, videos fail to play on iOS

### Android Chrome
- Uses Range requests for efficient seeking
- Falls back to full download if not supported
- Better experience with Range support

### Data Saver Modes
- Range requests work well with data saver
- Prevents unnecessary data download
- Respects user bandwidth preferences

---

## Monitoring

Track these metrics to ensure Range request support is working:

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| 206 response rate | > 90% for videos | < 50% |
| Avg bytes per video request | < 10MB | > 50MB |
| iOS video play success | > 99% | < 95% |
| Time to first byte | < 200ms | > 1s |
