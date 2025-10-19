# ChulasArts - Art Portfolio Manager Quickstart

## Prerequisites

- **Node.js**: 20 LTS or higher
- **MongoDB**: 6.0+ (local or cloud)
- **Azure Account**: For Blob Storage (or use local development storage emulator)

## Setup Steps

### 1. Clone and Install

```bash
cd /Users/sergio/projects/AI-WORK/ChulasArts
npm install
```

### 2. MongoDB Setup

**Local Development:**
```bash
# Install MongoDB via Homebrew (macOS)
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Verify connection
mongosh mongodb://localhost:27017
```

**Database Initialization:**
```javascript
use chulasarts_dev
db.createCollection('users')
db.createCollection('albums')
db.createCollection('photos')
db.createCollection('likes')
db.createCollection('bookmarks')
```

### 3. Azure Blob Storage Setup

**Option A: Azure Portal**
1. Create Storage Account: `chulasarts-dev`
2. Create container: `photos` (Private access)
3. Navigate to "Access Keys" → Copy connection string

**Option B: Development (Azurite Emulator)**
```bash
npm install -g azurite
azurite --silent --location .azurite --debug .azurite/debug.log
```

### 4. Environment Configuration

Create `.env` in project root:

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chulasarts_dev

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=chulasarts-dev;AccountKey=YOUR_KEY;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER=photos

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

### 6. Verify Installation

**Backend Health Check:**
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

**Frontend:**
Open http://localhost:5173 in browser

## Test Scenarios

### User Story 1: Album Management (P1)

**Objective:** Create and organize photo albums by date/series

```bash
# 1. Sign up new user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Artist Name",
    "email": "artist@example.com",
    "password": "SecurePass123!"
  }'

# 2. Login (saves cookie)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt

# 3. Create album
curl -X POST http://localhost:3000/api/albums \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Summer Collection 2024",
    "description": "Watercolor landscapes from July trip",
    "date": "2024-07-15"
  }'

# 4. List albums
curl http://localhost:3000/api/albums -b cookies.txt
```

**Success Criteria:**
- ✅ User creates account without errors
- ✅ User logs in and receives auth cookie
- ✅ Album appears in list sorted by date
- ✅ Album shows photoCount: 0 initially

### User Story 2: Photo Grid View (P1)

**Objective:** View all photos in album as grid with thumbnails

```bash
# 1. Upload photo to album
curl -X POST http://localhost:3000/api/albums/{albumId}/photos \
  -b cookies.txt \
  -F "file=@/path/to/artwork.jpg" \
  -F "title=Sunset Over Mountains" \
  -F "description=Oil painting on canvas" \
  -F 'tags=["landscape","oil","mountains"]'

# 2. Upload more photos (test grid)
curl -X POST http://localhost:3000/api/albums/{albumId}/photos \
  -b cookies.txt \
  -F "file=@/path/to/artwork2.jpg" \
  -F "title=Forest Path"

# 3. Get photos grid
curl http://localhost:3000/api/albums/{albumId}/photos?limit=24 -b cookies.txt
```

**Success Criteria:**
- ✅ Photos upload successfully (<5s for 5MB file)
- ✅ Thumbnails generated (400x400 max)
- ✅ Grid loads with lazy loading
- ✅ photoCount increments in album

### User Story 3: Detail View (P2)

**Objective:** View full photo with metadata

```bash
# Get photo details
curl http://localhost:3000/api/photos/{photoId} -b cookies.txt
```

**Success Criteria:**
- ✅ Full resolution image loads
- ✅ Metadata displayed (title, description, tags, dimensions)
- ✅ Navigation to prev/next photo works
- ✅ Loading state shows during fetch

### User Story 4: Metadata Editing (P2)

**Objective:** Edit photo title, description, tags

```bash
# Update photo metadata
curl -X PATCH http://localhost:3000/api/photos/{photoId} \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Updated Title",
    "description": "Updated description with more details",
    "tags": ["landscape", "oil", "mountains", "sunset"]
  }'
```

**Success Criteria:**
- ✅ Changes save without page refresh
- ✅ Validation errors show for empty title
- ✅ Tags autocomplete from existing tags
- ✅ Undo/cancel works

### User Story 5: Public Gallery (P3)

**Objective:** Browse published photos from all users

```bash
# 1. Publish photo
curl -X PATCH http://localhost:3000/api/photos/{photoId} \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"published": true}'

# 2. Browse public gallery (no auth)
curl http://localhost:3000/api/gallery?sortBy=recent&limit=24

# 3. Get popular photos
curl http://localhost:3000/api/gallery?sortBy=popular&limit=24
```

**Success Criteria:**
- ✅ Published photos appear in gallery
- ✅ Unpublished photos excluded
- ✅ Gallery loads without authentication
- ✅ Artist attribution shown with each photo

### User Story 6: Social Features (P3)

**Objective:** Like and bookmark photos

```bash
# 1. Like photo
curl -X POST http://localhost:3000/api/photos/{photoId}/like \
  -b cookies.txt

# 2. Bookmark photo
curl -X POST http://localhost:3000/api/photos/{photoId}/bookmark \
  -b cookies.txt

# 3. View bookmarks
curl http://localhost:3000/api/users/{userId}/bookmarks -b cookies.txt

# 4. Unlike photo
curl -X DELETE http://localhost:3000/api/photos/{photoId}/like \
  -b cookies.txt
```

**Success Criteria:**
- ✅ Like count increments/decrements
- ✅ Bookmark persists across sessions
- ✅ User can view all bookmarks
- ✅ Double-like prevented (idempotent)

## Performance Validation

Run these checks to ensure constitution compliance:

```bash
# Frontend build size
cd frontend
npm run build
# Target: <500KB initial bundle

# API response times
curl -w "@curl-format.txt" http://localhost:3000/api/gallery
# Target: <200ms p95 latency

# Image optimization
ls -lh backend/uploads/thumbnails/
# Target: Thumbnails <100KB each
```

Create `curl-format.txt`:
```
time_namelookup:  %{time_namelookup}s\n
time_connect:     %{time_connect}s\n
time_total:       %{time_total}s\n
```

## Troubleshooting

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# Restart if needed
brew services restart mongodb-community@6.0
```

**Azure Blob Upload Fails:**
```bash
# Test connection string
node -e "console.log(require('@azure/storage-blob').BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING))"
```

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -ti:3000
# Kill process
kill -9 $(lsof -ti:3000)
```

## Next Steps

1. **Run Tests:** `npm test` in both frontend/ and backend/
2. **Check Coverage:** `npm run test:coverage` (target: >80%)
3. **Lint Code:** `npm run lint` (enforce standards)
4. **Review Plan:** See `plan.md` for architecture details
5. **Start Implementation:** Follow task breakdown in `tasks.md`

## Development Commands Reference

```bash
# Backend
npm run dev          # Start with nodemon (auto-reload)
npm run build        # Compile TypeScript
npm start            # Production server
npm test             # Run Vitest tests
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint check
npm run format       # Prettier format

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Vitest + React Testing Library
npm run test:e2e     # Playwright browser tests
npm run lint         # ESLint + TypeScript check

# Database
npm run db:seed      # Seed test data
npm run db:reset     # Drop and recreate DB
npm run db:migrate   # Run migrations (if added later)
```

## Configuration Files

- `.env` - Environment variables (DO NOT COMMIT)
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration
- `playwright.config.ts` - E2E test configuration
- `.eslintrc.json` - Linting rules (follows constitution)
- `.prettierrc` - Code formatting rules

## Architecture Overview

```
ChulasArts/
├── frontend/               # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand state management
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript interfaces
│   └── public/            # Static assets
├── backend/               # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Mongoose schemas
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helpers (Azure, image processing)
│   └── uploads/           # Temporary file storage
├── shared/                # Shared types between frontend/backend
│   └── types/
└── specs/                 # Specification documents
    └── 001-art-portfolio-manager/
```

## Resources

- **API Contracts:** See `contracts/*.yaml` for OpenAPI specs
- **Data Model:** See `data-model.md` for MongoDB schemas
- **Implementation Plan:** See `plan.md` for technical architecture
- **Constitution:** See `.specify/memory/constitution.md` for quality standards
