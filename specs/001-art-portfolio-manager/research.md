# Technical Research: Art Portfolio Management Platform

**Feature**: 001-art-portfolio-manager  
**Date**: 2025-10-18  
**Status**: Complete

## Research Summary

This document consolidates technology decisions and best practices for building the art portfolio platform with Vite, React, TypeScript, MongoDB, and Azure Blob Storage.

## Technology Stack Decisions

### Frontend Framework: React 18 with TypeScript

**Decision**: Use React 18.2+ with TypeScript 5.3+ and Vite 5 as build tool

**Rationale**:
- React 18: Concurrent rendering improves responsiveness for image-heavy UI
- TypeScript: Type safety prevents runtime errors, especially important for complex photo metadata
- Vite: Fast HMR (<50ms) and optimized production builds, better than CRA or Webpack
- Large ecosystem for image handling, drag-drop, and responsive layouts

**Alternatives Considered**:
- Vue 3: Rejected - Team has React experience, better TypeScript integration in React ecosystem
- Next.js: Rejected - Over-engineered for SPA needs, SSR not required for this use case
- Svelte: Rejected - Smaller ecosystem, fewer developers familiar with it

**Best Practices**:
- Use functional components with hooks (no class components)
- Custom hooks for reusable logic (useDragDrop, useZoom, useInfiniteScroll)
- React.memo for expensive grid item components
- Code splitting with React.lazy for detail views and modals
- Zustand for lightweight state management (simpler than Redux)

### Backend: Node.js with Express

**Decision**: Node.js 20 LTS with Express 4.18+ and TypeScript

**Rationale**:
- JavaScript/TypeScript full-stack consistency reduces context switching
- Express mature, lightweight, extensive middleware ecosystem
- Excellent MongoDB driver support
- Native Azure SDK support
- Non-blocking I/O ideal for file upload/download operations

**Alternatives Considered**:
- Fastify: Rejected - Marginally faster but less mature middleware ecosystem
- NestJS: Rejected - Too opinionated and heavy for straightforward CRUD API
- Python Flask/FastAPI: Rejected - Different language breaks full-stack TypeScript advantage

**Best Practices**:
- Express middleware for auth, validation, error handling
- Route handlers delegate to service layer (separation of concerns)
- Async/await throughout (no callbacks)
- helmet.js for security headers
- express-rate-limit for API protection
- morgan for logging

### Database: MongoDB 6

**Decision**: MongoDB 6.0+ hosted (MongoDB Atlas or self-hosted)

**Rationale**:
- Flexible schema ideal for evolving photo metadata (tags, custom fields)
- Native JSON/BSON matches JavaScript object model
- Horizontal scaling if user base grows
- Geospatial indexes could support future location-based features
- Change streams enable real-time updates for social features

**Alternatives Considered**:
- PostgreSQL: Rejected - JSONB can handle flexible data, but relational model adds complexity for deeply nested metadata
- MySQL: Rejected - JSON support weaker than MongoDB, no native geospatial
- Firebase Firestore: Rejected - Vendor lock-in, less control over queries

**Best Practices**:
- Mongoose ODM for schema validation and relationships
- Indexes on frequently queried fields (userId, albumId, published status, createdAt)
- Compound indexes for complex queries (userId + albumId)
- Connection pooling (default 100 connections)
- No N+1 queries (use populate/aggregate)
- TTL indexes for session management

**Schema Design**:
```javascript
// User collection
{
  _id: ObjectId,
  email: string (unique, indexed),
  passwordHash: string,
  name: string,
  createdAt: Date,
  updatedAt: Date
}

// Album collection
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  title: string,
  date: Date (indexed),
  sortOrder: number,
  createdAt: Date,
  updatedAt: Date
}

// Photo collection
{
  _id: ObjectId,
  albumId: ObjectId (indexed),
  userId: ObjectId (indexed),
  title: string,
  description: string,
  tags: [string],
  blobUrl: string (Azure Blob Storage URL),
  thumbnailUrl: string,
  dimensions: { width: number, height: number },
  fileSize: number,
  mimeType: string,
  published: boolean (indexed),
  createdAt: Date (indexed),
  updatedAt: Date,
  likeCount: number,
  bookmarkCount: number
}

// Like collection
{
  _id: ObjectId,
  userId: ObjectId (compound index with photoId),
  photoId: ObjectId,
  createdAt: Date
}

// Bookmark collection (same structure as Like)
```

### Photo Storage: Azure Blob Storage

**Decision**: Azure Blob Storage with CDN

**Rationale**:
- Scalable object storage (petabyte scale)
- Cost-effective ($0.018/GB/month for hot tier)
- Built-in image transformation via Azure CDN
- SAS tokens provide secure, time-limited access
- Geo-redundancy for reliability
- Integrates with Azure Application Insights for monitoring

**Alternatives Considered**:
- AWS S3: Rejected - Azure chosen for unified ecosystem if scaling other services
- Cloudinary: Rejected - More expensive ($0.10/GB/month), vendor lock-in
- Local filesystem: Rejected - Not scalable, complex backup/redundancy

**Best Practices**:
- Container per environment (dev, staging, prod)
- Folder structure: `{userId}/{albumId}/{photoId}-{original|thumbnail|medium}.{ext}`
- Generate SAS URLs with 1-hour expiry for frontend access
- Use Azure CDN for image delivery (lower latency)
- Store multiple sizes: original, thumbnail (400x400), medium (1200x1200)
- Block public access, all access via SAS tokens
- Enable soft delete (7-day retention)
- Use Azure Storage SDK v12 for Node.js

**Image Processing**:
- Sharp library for server-side resizing/optimization
- WebP format with JPEG fallback for compatibility
- Compress on upload (quality: 85)
- Generate thumbnails asynchronously

### UI Library: Minimal Custom Components

**Decision**: Build custom component library, no heavy UI framework

**Rationale**:
- Requirement for "minimal libraries" in spec
- Full control over design and behavior
- Smaller bundle size (Material-UI adds ~300KB)
- Learning opportunity for team
- Custom masonry grid needed anyway

**Alternatives Considered**:
- Material-UI: Rejected - Heavy (300KB), opinionated styling
- Ant Design: Rejected - Even heavier, Chinese design language
- Chakra UI: Rejected - Still 150KB, not minimal

**Custom Components to Build**:
- Button, Input, Modal, Dropdown
- Grid system with CSS Grid
- Drag-and-drop with HTML5 Drag API or react-beautiful-dnd (lightweight)
- Image zoom with CSS transforms or react-zoom-pan-pinch

### Responsive Design Strategy

**Decision**: Mobile-first CSS with CSS Grid and Flexbox

**Rationale**:
- CSS Grid ideal for masonry layout
- Flexbox for component internals
- No Bootstrap overhead
- Custom breakpoints match design needs

**Breakpoints**:
- Mobile: 320px - 767px (1-2 columns)
- Tablet: 768px - 1023px (2-3 columns)
- Desktop: 1024px - 1919px (3-4 columns)
- Large Desktop: 1920px+ (4-5 columns)

**Best Practices**:
- CSS modules for scoped styling
- CSS custom properties for design tokens (colors, spacing)
- clamp() for fluid typography
- Intersection Observer for lazy loading
- matchMedia for JS breakpoint detection

### Authentication Strategy

**Decision**: JWT with httpOnly cookies

**Rationale**:
- Stateless tokens scale horizontally
- httpOnly cookies prevent XSS attacks
- Refresh token rotation for security
- Simple to implement with jsonwebtoken library

**Alternatives Considered**:
- Sessions in MongoDB: Rejected - Doesn't scale as well, database lookup per request
- OAuth only: Rejected - Added complexity, users want simple email/password

**Implementation**:
- Access token: 15-minute expiry, stored in httpOnly cookie
- Refresh token: 7-day expiry, stored in httpOnly cookie
- CSRF protection with sameSite=strict
- Password hashing with bcrypt (cost factor: 12)
- Optional: Add OAuth (Google, GitHub) in Phase 2

### Testing Strategy

**Decision**: Vitest + React Testing Library + Playwright

**Rationale**:
- Vitest: Fast, Vite-native, Jest-compatible API
- RTL: Best practices for React testing (test behavior, not implementation)
- Playwright: Cross-browser E2E, better than Cypress for parallel execution

**Test Coverage Goals**:
- Unit: >80% for services and utilities
- Integration: All API endpoints with contract tests
- E2E: Critical paths (signup → create album → upload photo → publish → view gallery)

### Performance Optimization

**Image Loading Strategy**:
```typescript
// Lazy load with Intersection Observer
// Load thumbnail first, then full resolution on demand
// Use responsive images with srcset
<img
  src={thumbnailUrl}
  data-src={fullUrl}
  srcset={`${smallUrl} 400w, ${mediumUrl} 800w, ${largeUrl} 1200w`}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  alt={photo.title}
/>
```

**Bundle Optimization**:
- Code splitting: Separate chunks for dashboard, gallery, detail views
- Tree shaking: Import only needed lodash functions
- Dynamic imports: Load heavy libraries on demand (zoom, drag-drop)
- Vite's automatic chunking for node_modules

**API Optimization**:
- Pagination: Default 24 photos per page (4 rows × 6 columns avg)
- Cursor-based pagination for infinite scroll
- ETags for client-side caching
- Compression middleware (gzip/brotli)
- MongoDB lean queries (plain objects, no Mongoose overhead)

## Risk Mitigation

### Large File Uploads

**Risk**: Users upload 50MB+ images causing timeout/memory issues

**Mitigation**:
- Client-side validation: Reject files >20MB before upload
- Multipart upload for files >10MB
- Progress tracking with axios onUploadProgress
- Backend streaming instead of buffering entire file

### Concurrent Album Reordering

**Risk**: Two users (or same user in two tabs) reorder albums simultaneously

**Mitigation**:
- Optimistic UI updates
- Last-write-wins strategy (acceptable for non-critical reordering)
- Optional: Add version field to Album schema for optimistic concurrency control

### Azure Blob Storage Costs

**Risk**: Storage costs balloon with high-resolution originals

**Mitigation**:
- Compress on upload (Sharp: quality 85, WebP)
- Archive old unpublished photos to cool tier after 90 days
- Monitor storage metrics with Azure Cost Management
- Consider user quotas (e.g., 10GB free, then paid tiers)

## Dependencies List

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "@azure/storage-blob": "^12.17.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.1.0",
  "morgan": "^1.10.0",
  "sharp": "^0.33.0",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "zustand": "^4.4.7",
  "axios": "^1.6.2",
  "react-beautiful-dnd": "^13.1.1" // lightweight drag-drop
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.3.3",
  "vite": "^5.0.8",
  "@vitejs/plugin-react": "^4.2.1",
  "vitest": "^1.0.4",
  "@testing-library/react": "^14.1.2",
  "@testing-library/user-event": "^14.5.1",
  "@playwright/test": "^1.40.1",
  "eslint": "^8.55.0",
  "@typescript-eslint/eslint-plugin": "^6.14.0",
  "@typescript-eslint/parser": "^6.14.0",
  "prettier": "^3.1.1",
  "husky": "^8.0.3",
  "lint-staged": "^15.2.0",
  "commitlint": "^18.4.3"
}
```

## Next Steps

Proceed to Phase 1:
1. Generate data-model.md with complete entity schemas
2. Generate OpenAPI contracts for all API endpoints
3. Create quickstart.md with setup instructions and test scenarios
4. Update agent context with tech stack information
