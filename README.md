# ChulasArts

A full-stack art portfolio management platform where artists can create albums, upload artwork, and share their work with the world.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47a248)
![MUI](https://img.shields.io/badge/MUI-7.3-007FFF)

---

## Features

- **Authentication** — Signup, login, and profile management with JWT stored in httpOnly cookies
- **Album Management** — Create, edit, and delete albums; reorder them via drag-and-drop
- **Photo Upload** — Upload artwork to Azure Blob Storage with real-time progress tracking; images are automatically processed into thumbnail, medium, and full sizes
- **Responsive Grid** — Masonry-style layout (1–5 columns) that adapts to any screen size; hover interactions reveal title, edit, like, bookmark, and share controls
- **Full-Screen Viewer** — Zoom/pan controls, keyboard navigation (arrow keys, Escape), and publish/unpublish toggle on every photo
- **Public Gallery** — Browse published artwork from all artists; filter by tags, sort by date or popularity
- **Social Interactions** — Like and bookmark photos; view your saved collection on the Bookmarks page
- **Share** — Copy or share direct links to individual photos

---

## Tech Stack

| Layer                | Technologies                                                              |
| -------------------- | ------------------------------------------------------------------------- |
| **Frontend**         | React 18.2, Vite 5.4, TypeScript 5.3, MUI v7.3.4, Zustand, React Router 6 |
| **Backend**          | Node.js 20, Express 4.18, TypeScript 5.3, Mongoose 8                      |
| **Database**         | MongoDB 6.0                                                               |
| **Storage**          | Azure Blob Storage (photo hosting + CDN redirect)                         |
| **Auth**             | JWT (access + refresh tokens) in httpOnly cookies                         |
| **Image Processing** | Sharp (thumbnail, medium, full sizes on upload)                           |
| **Testing**          | Vitest, React Testing Library, Playwright                                 |

---

## Project Structure

```
ChulasArts/
├── frontend/           # React + Vite + MUI
│   └── src/
│       ├── components/ # AlbumCard, PhotoGrid, PhotoUpload, Header, etc.
│       ├── pages/      # Dashboard, AlbumView, Gallery, Bookmarks, Login, Signup
│       ├── stores/     # Zustand stores (auth, album, photo, social)
│       ├── services/   # Axios API wrappers
│       └── hooks/      # useAuth and other custom hooks
├── backend/            # Express + Mongoose
│   └── src/
│       ├── routes/     # REST API route handlers
│       ├── models/     # Mongoose schemas (User, Album, Photo, Like, Bookmark)
│       ├── services/   # Business logic (album, photo, auth, azure, social)
│       ├── middleware/ # Auth, validation, rate limiting, error handling
│       └── config/     # Database, Azure, CORS setup
├── shared/
│   └── types/          # Shared TypeScript interfaces
└── specs/              # Feature specifications and API contracts (OpenAPI 3.0)
```

---

## Getting Started

### Prerequisites

- Node.js 20 LTS
- MongoDB 6.0 running locally (`mongod`)
- An Azure Storage account with a Blob container named `photos` (and optionally `avatars`)

### Installation

```bash
git clone https://github.com/ch3c05/ChulasArts.git
cd ChulasArts
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

| Variable                          | Description                        | Default                                     |
| --------------------------------- | ---------------------------------- | ------------------------------------------- |
| `NODE_ENV`                        | `development` or `production`      | `development`                               |
| `PORT`                            | Backend port                       | `3000`                                      |
| `MONGODB_URI`                     | MongoDB connection string          | `mongodb://localhost:27017/chulasarts_dev`  |
| `AZURE_STORAGE_CONNECTION_STRING` | Full Azure connection string       | —                                           |
| `AZURE_STORAGE_CONTAINER`         | Blob container name for photos     | `photos`                                    |
| `JWT_SECRET`                      | Access token secret (≥32 chars)    | —                                           |
| `JWT_EXPIRES_IN`                  | Access token TTL                   | `15m`                                       |
| `JWT_REFRESH_SECRET`              | Refresh token secret (≥32 chars)   | —                                           |
| `JWT_REFRESH_EXPIRES_IN`          | Refresh token TTL                  | `7d`                                        |
| `CORS_ORIGIN`                     | Allowed frontend origin            | `http://localhost:5173`                     |
| `MAX_FILE_SIZE`                   | Max upload size in bytes           | `20971520` (20 MB)                          |
| `ALLOWED_MIME_TYPES`              | Comma-separated allowed MIME types | `image/jpeg,image/png,image/webp,image/gif` |

### Run in Development

```bash
npm run dev
```

This starts both servers concurrently:

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3000/api

---

## Available Scripts

Run from the project root unless noted otherwise.

| Command          | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start both frontend and backend in watch mode |
| `npm run build`  | Production build for all workspaces           |
| `npm test`       | Run unit tests in all workspaces              |
| `npm run lint`   | ESLint check across all workspaces            |
| `npm run format` | Prettier format all files                     |

Individual workspace commands (run from `frontend/` or `backend/`):

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm run build`    | Compile TypeScript / Vite production build |
| `npm start`        | Start production server (backend only)     |
| `npm test`         | Vitest unit tests                          |
| `npm run test:e2e` | Playwright end-to-end tests                |
| `npm run lint`     | ESLint check                               |

---

## API Overview

All endpoints are prefixed with `/api`.

| Group   | Prefix         | Description                                               |
| ------- | -------------- | --------------------------------------------------------- |
| Auth    | `/api/auth`    | Register, login, logout, refresh token, profile           |
| Albums  | `/api/albums`  | CRUD + drag-and-drop reorder                              |
| Photos  | `/api/photos`  | Upload, update metadata, publish/unpublish, delete        |
| Gallery | `/api/gallery` | Public feed, filter by tags/artist, search                |
| Social  | `/api/photos`  | Like, unlike, bookmark, unbookmark, bulk social status    |
| Images  | `/api/images`  | Signed redirect to Azure Blob (thumbnail / medium / full) |
| Users   | `/api/users`   | Public profile lookup                                     |

Full OpenAPI 3.0 contracts are in [`specs/001-art-portfolio-manager/contracts/`](specs/001-art-portfolio-manager/contracts/).

---

## Data Model

Five MongoDB collections:

- **User** — account credentials, avatar, social links
- **Album** — belongs to a user; stores `sortOrder` for drag-drop positioning
- **Photo** — belongs to a user + album; stores Azure Blob URLs, metadata, tags, `isPublished`, denormalized `likeCount` / `bookmarkCount`
- **Like** — user ↔ photo join with atomic counter sync on Photo
- **Bookmark** — user ↔ photo join with atomic counter sync on Photo

See [`specs/001-art-portfolio-manager/data-model.md`](specs/001-art-portfolio-manager/data-model.md) for full schema details.

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow the [code style guidelines](.github/copilot-instructions.md)
3. Run `npm run lint && npm test` before committing
4. Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
5. Open a pull request against `master`

---

## License

ISC
