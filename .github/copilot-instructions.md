# ChulasArts Development Guidelines

Auto-generated from feature plans. Last updated: 2024

## Active Technologies

### Frontend
- **Framework:** Vite 5.0+ (build tool), React 18.2+ (UI framework)
- **Language:** TypeScript 5.3+ (strict mode enabled)
- **State Management:** Zustand (lightweight, minimal boilerplate)
- **Styling:** CSS Modules or Tailwind CSS (decision pending)
- **Testing:** Vitest (unit tests), React Testing Library (component tests), Playwright (E2E tests)

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4.18+
- **Language:** TypeScript 5.3+
- **Database:** MongoDB 6.0+ with Mongoose ODM
- **Authentication:** JWT with httpOnly cookies
- **Storage:** Azure Blob Storage for photos

### Shared
- **Type Definitions:** Shared TypeScript interfaces in `/shared/types/`
- **API Contracts:** OpenAPI 3.0 specifications in `/specs/*/contracts/`

## Project Structure

```
ChulasArts/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages (Album, Gallery, Profile)
│   │   ├── stores/          # Zustand state stores
│   │   ├── services/        # API client (fetch/axios wrapper)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # Frontend-specific types
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/          # API endpoint handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Business logic (Azure, image processing)
│   │   ├── utils/           # Helpers
│   │   └── types/           # Backend-specific types
│   └── package.json
├── shared/                   # Shared code between frontend/backend
│   └── types/               # Common TypeScript interfaces
├── specs/                    # Feature specifications
│   └── 001-art-portfolio-manager/
│       ├── spec.md          # Feature requirements
│       ├── plan.md          # Implementation plan
│       ├── data-model.md    # MongoDB schemas
│       └── contracts/       # OpenAPI API specs
└── .specify/                # SpecKit framework
```

## Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint check
npm run format       # Prettier format
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon (auto-reload on http://localhost:3000)
npm run build        # Compile TypeScript to dist/
npm start            # Production server
npm test             # Run Vitest tests
npm run test:e2e     # Playwright API tests
npm run lint         # ESLint + TypeScript check
```

### Database
```bash
mongosh mongodb://localhost:27017/chulasarts_dev  # Connect to MongoDB
npm run db:seed      # Seed test data (when implemented)
npm run db:reset     # Drop and recreate database
```

## Code Style

### TypeScript
- **Strict Mode:** Enabled (`strict: true` in tsconfig.json)
- **Naming:**
  - Interfaces: PascalCase (`User`, `Album`, `Photo`)
  - Types: PascalCase (`PhotoMetadata`, `ApiResponse`)
  - Functions: camelCase (`createAlbum`, `uploadPhoto`)
  - Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `JWT_EXPIRES_IN`)
- **Imports:** Use absolute imports via path aliases (`@/components/AlbumCard`)
- **Error Handling:** Always type errors, use custom error classes
- **Async/Await:** Preferred over `.then()` chains

### React
- **Components:** Functional components with TypeScript (`.tsx`)
- **Props:** Always define explicit prop interfaces
- **Hooks:** Extract complex logic to custom hooks
- **State:** Use Zustand stores for global state, `useState` for local
- **Effects:** Document side effects clearly, cleanup in `useEffect` return

### API Design
- **REST Principles:** Follow RESTful conventions
- **Status Codes:** 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
- **Response Format:** Consistent JSON structure with `data`, `error`, `message` fields
- **Validation:** Validate all inputs, return descriptive error messages
- **Authentication:** JWT in httpOnly cookies, include `userId` in all protected routes

### MongoDB/Mongoose
- **Schemas:** Define with TypeScript interfaces first, then Mongoose schemas
- **Indexes:** Add compound indexes for common queries (see `data-model.md`)
- **Validation:** Use Mongoose validators + custom validation functions
- **Transactions:** Use for operations that modify multiple collections
- **Denormalization:** Use counters (`photoCount`, `likeCount`) for performance

## Constitution Requirements

ChulasArts follows spec-driven development with quality-first principles:

### 1. Code Quality & Maintainability (REQUIRED)
- DRY: Extract reusable components/functions
- Single Responsibility: Each function/component does one thing
- Type Safety: No `any` types without explicit justification
- Error Handling: Handle all error cases, log appropriately

### 2. Best Practices & Standards (REQUIRED)
- ESLint: Zero warnings in CI/CD
- Prettier: Auto-format on save
- Git: Conventional commits (`feat:`, `fix:`, `docs:`)
- Testing: Write tests before or alongside implementation

### 3. UX Consistency (REQUIRED)
- Accessibility: WCAG 2.1 AA compliance (keyboard nav, screen readers, ARIA)
- Loading States: Show spinners/skeletons during async operations
- Error Messages: User-friendly, actionable error text
- Responsive: Mobile-first design, test on multiple screen sizes

### 4. Performance & Optimization (REQUIRED)
- **Budgets:**
  - Page Load: <3 seconds (TTI)
  - Interactions: <100ms response
  - API Latency: <200ms (p95)
  - Animations: 60fps (16ms frame budget)
- **Images:** Lazy load, use thumbnails, optimize with WebP
- **Code Splitting:** Lazy load routes, dynamic imports for heavy components
- **Database:** Use indexes, limit query results, paginate large datasets

### 5. Testing & Validation (REQUIRED)
- **Coverage:** >80% for critical paths (auth, upload, CRUD operations)
- **Unit Tests:** Test business logic, utilities, hooks
- **Integration Tests:** Test API endpoints with real database
- **E2E Tests:** Test complete user workflows (signup → upload → publish)

## Recent Changes

### Feature 001: Art Portfolio Manager (Current)
- **Added:** Complete art portfolio platform specification
- **Technologies:** Vite + React 18 + TypeScript 5.3, Node.js 20 + Express, MongoDB 6, Azure Blob Storage
- **Data Model:** 5 MongoDB collections (User, Album, Photo, Like, Bookmark)
- **API Endpoints:** Authentication, Album CRUD, Photo upload/management, Gallery browsing, Social interactions
- **Performance:** Implemented image optimization (thumbnails, medium size), denormalized counters for likes/bookmarks
- **Next Steps:** Implement frontend components, backend API routes, Azure Blob integration

<!-- MANUAL ADDITIONS START -->

## Development Workflow

1. **Create Feature Branch:** `git checkout -b feature/descriptive-name`
2. **Follow Spec:** Reference `/specs/001-art-portfolio-manager/spec.md` for requirements
3. **API Contracts:** Use `/specs/001-art-portfolio-manager/contracts/*.yaml` for endpoint definitions
4. **Data Model:** Follow schemas in `/specs/001-art-portfolio-manager/data-model.md`
5. **Test First:** Write failing test → implement → pass test → refactor
6. **Quality Checks:** Run `npm run lint && npm test` before committing
7. **Commit:** Use conventional commits (`feat: add album grid view`)
8. **PR Review:** Ensure constitution compliance before merging

## Key Considerations

- **Image Upload:** Use Azure Blob Storage with SAS tokens, generate thumbnails server-side
- **Authentication:** Store JWT in httpOnly cookies (not localStorage for XSS protection)
- **Pagination:** Default to 24 photos per page, implement infinite scroll in frontend
- **Performance:** Lazy load images, use React.memo for photo cards, debounce search inputs
- **Accessibility:** All interactive elements keyboard accessible, images have alt text
- **Error Handling:** Graceful degradation, show user-friendly messages, log errors to monitoring

<!-- MANUAL ADDITIONS END -->
