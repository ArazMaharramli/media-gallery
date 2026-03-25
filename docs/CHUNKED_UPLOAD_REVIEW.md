# Chunked Upload Implementation Review

**Project:** media-gallery
**Date:** 2026-03-25
**Reviewer:** Claude Code

---

## Executive Summary

The chunked upload implementation uses the TUS protocol with `tus-js-client` (frontend) and `@tus/server` (backend). The implementation covers core functionality well but has several areas requiring attention before production deployment.

| Category | Rating | Notes |
|----------|--------|-------|
| Protocol Choice | Excellent | TUS is industry standard for resumable uploads |
| Resumability | Good | Client-side resume works, but UI state not persisted |
| Error Handling | Needs Work | Some silent catches, missing retry context |
| Security | Needs Work | CORS too permissive, missing size validation |
| Production Readiness | Medium | In-memory context cache is blocking issue |

---

## Files Reviewed

| File | Type | Purpose |
|------|------|---------|
| `composables/useChunkedUpload.ts` | Frontend | TUS client wrapper with pause/resume |
| `composables/useUploadStrategy.ts` | Frontend | Strategy selection (standard vs chunked) |
| `composables/useMediaUpload.ts` | Frontend | High-level upload orchestration |
| `server/api/tus/index.ts` | API | TUS root endpoint (POST, OPTIONS) |
| `server/api/tus/[id].ts` | API | TUS upload endpoint (HEAD, PATCH, DELETE) |
| `server/features/tus/tus.server.ts` | Backend | TUS server configuration |
| `server/features/tus/tus.service.ts` | Backend | Upload finalization logic |
| `server/features/tus/tus.types.ts` | Backend | TypeScript type definitions |
| `server/features/tus/tus.validation.ts` | Backend | Metadata and auth validation |
| `server/tasks/cleanup-stale-uploads.ts` | Backend | Scheduled cleanup of incomplete uploads |

---

## Strengths

### 1. TUS Protocol Adoption
- Uses battle-tested `@tus/server` and `tus-js-client` libraries
- Proper implementation of TUS extensions (creation, termination)
- Standard-compliant header handling

### 2. Retry Mechanism
```typescript
// useChunkedUpload.ts:39
retryDelays: [0, 1000, 3000, 5000, 10000]
```
Exponential backoff with 5 retry attempts - follows best practices.

### 3. Resume Support
```typescript
// useChunkedUpload.ts:104-108
const previousUploads = await upload.findPreviousUploads()
if (previousUploads.length > 0) {
  upload.resumeFromPreviousUpload(previousUploads[0])
}
```
Automatic resume from previous incomplete uploads.

### 4. Authorization Validation
```typescript
// tus.validation.ts:58-108
export async function validateUploadContext(...)
```
Validates both owner and guest token access before accepting uploads.

### 5. MIME Type Validation
Checks `isAllowedMediaType()` before accepting uploads, preventing arbitrary file uploads.

### 6. Cleanup Task
Scheduled task removes stale incomplete uploads after configurable threshold.

### 7. Temp-to-Final Workflow
Files written to temporary directory, moved to final location only after complete validation.

---

## Issues Found

### Critical

#### ISSUE-001: In-Memory Context Cache
**Severity:** Critical
**Location:** `server/features/tus/tus.server.ts:15`

```typescript
const uploadContexts = new Map<string, ValidatedUploadContext>()
```

**Problem:** Upload context (eventId, guestTokenId, permissions) stored in memory. Lost on:
- Server restart
- Process crash
- Horizontal scaling (different instance receives PATCH)

**Impact:** Uploads fail silently or become orphaned after server restart.

**Recommendation:** Persist context to:
- TUS info file (`.json` sidecar already created by FileStore)
- Redis/database for multi-instance deployments

---

### High

#### ISSUE-002: CORS Too Permissive
**Severity:** High
**Location:** `server/api/tus/index.ts:12`

```typescript
'Access-Control-Allow-Origin': '*'
```

**Problem:** Allows any origin to initiate uploads to your server.

**Impact:** Potential for CSRF attacks or unauthorized upload attempts.

**Recommendation:**
```typescript
'Access-Control-Allow-Origin': process.env.NUXT_PUBLIC_APP_URL || 'https://yourdomain.com'
```

---

#### ISSUE-003: Context Cleanup Race Condition
**Severity:** High
**Location:** `server/features/tus/tus.server.ts:86`

**Problem:** If `finalizeUpload()` throws after partial processing, context is deleted and cannot retry.

**Recommendation:** Only delete context on successful finalization:
```typescript
try {
  await finalizeUpload(...)
  uploadContexts.delete(upload.id) // Only after success
} catch (error) {
  // Retain context for retry
  console.error('Finalization failed, context retained:', error)
  throw error
}
```

---

### Medium

#### ISSUE-004: No Checksum Verification
**Severity:** Medium
**Location:** `composables/useChunkedUpload.ts`

**Problem:** No chunk integrity verification. Corrupted data could be accepted silently.

**Recommendation:** Enable TUS checksum extension:
```typescript
// Client
uploadDataDuringCreation: true,
// Server: Enable checksum extension in @tus/server config
```

---

#### ISSUE-005: No Upload Concurrency Limits
**Severity:** Medium
**Location:** Multiple

**Problem:** No limits on:
- Concurrent uploads per user/session
- Concurrent chunks per upload
- Total concurrent uploads server-wide

**Impact:** Resource exhaustion, DoS potential.

**Recommendation:** Implement rate limiting middleware and client-side queue.

---

#### ISSUE-006: No Progress Persistence Across Page Refresh
**Severity:** Medium
**Location:** `composables/useChunkedUpload.ts`

**Problem:** `uploads` Map lost on page refresh. TUS can resume, but UI shows no pending uploads.

**Recommendation:** Persist upload IDs to `localStorage`:
```typescript
// On upload start
localStorage.setItem('pendingUploads', JSON.stringify([...uploads.keys()]))

// On page load
const pending = JSON.parse(localStorage.getItem('pendingUploads') || '[]')
```

---

### Low

#### ISSUE-007: Silent Error Handling
**Severity:** Low
**Location:**
- `composables/useChunkedUpload.ts:109-111`
- `server/features/tus/tus.service.ts:45-47`

```typescript
} catch {
  // Ignore cleanup errors
}
```

**Problem:** Errors swallowed without logging.

**Recommendation:** Add debug logging:
```typescript
} catch (error) {
  console.debug('Cleanup failed (non-critical):', error)
}
```

---

#### ISSUE-008: Missing Upload-Length Validation
**Severity:** Low
**Location:** `server/features/tus/tus.validation.ts`

**Problem:** Declared `Upload-Length` not validated against configured max size before upload starts.

**Recommendation:** Early rejection of oversized uploads:
```typescript
if (uploadLength > config.maxUploadSize) {
  throw createError({ statusCode: 413, message: 'File too large' })
}
```

---

## Recommendations Summary

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | ISSUE-001: Persist context | Medium | Critical for production |
| 2 | ISSUE-002: Restrict CORS | Low | Security improvement |
| 3 | ISSUE-003: Fix cleanup race | Low | Reliability |
| 4 | ISSUE-004: Add checksums | Medium | Data integrity |
| 5 | ISSUE-005: Rate limiting | Medium | DoS protection |
| 6 | ISSUE-006: Persist UI state | Low | UX improvement |
| 7 | ISSUE-007: Add logging | Low | Debugging |
| 8 | ISSUE-008: Validate size early | Low | Resource efficiency |

---

## Action Items

- [ ] Persist upload context to file/Redis (ISSUE-001)
- [ ] Restrict CORS to application domain (ISSUE-002)
- [ ] Fix context cleanup race condition (ISSUE-003)
- [ ] Evaluate checksum extension (ISSUE-004)
- [ ] Implement upload rate limiting (ISSUE-005)
- [ ] Add localStorage for upload UI state (ISSUE-006)
- [ ] Add debug logging for catch blocks (ISSUE-007)
- [ ] Add early Upload-Length validation (ISSUE-008)

---

## References

- [TUS Protocol Specification](https://tus.io/protocols/resumable-upload)
- [@tus/server Documentation](https://github.com/tus/tus-node-server)
- [tus-js-client Documentation](https://github.com/tus/tus-js-client)
