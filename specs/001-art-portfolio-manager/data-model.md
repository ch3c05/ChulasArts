# Data Model: Art Portfolio Management Platform

**Feature**: 001-art-portfolio-manager  
**Date**: 2025-10-18  
**Database**: MongoDB 6.0+

## Overview

This document defines the data model for the art portfolio platform, including MongoDB collections, schemas, relationships, indexes, and validation rules.

## Entity Relationship Diagram

```
User (1) ─────< (N) Album
              │
              └─────< (N) Photo
                       │
                       ├─────< (N) Like
                       └─────< (N) Bookmark
```

## Collections

### User Collection

**Purpose**: Store user accounts and authentication information

**Schema**:
```typescript
interface User {
  _id: ObjectId;                    // MongoDB generated ID
  email: string;                    // Unique email address
  passwordHash: string;             // bcrypt hashed password
  name: string;                     // Display name
  bio?: string;                     // Artist bio (optional)
  avatarUrl?: string;               // Profile picture URL (optional)
  createdAt: Date;                  // Account creation timestamp
  updatedAt: Date;                  // Last update timestamp
}
```

**Indexes**:
```javascript
{ email: 1 } // Unique index for login lookup
{ createdAt: -1 } // For admin queries
```

**Validation Rules**:
- `email`: Required, valid email format, unique, max 255 characters
- `passwordHash`: Required, min 60 characters (bcrypt hash length)
- `name`: Required, min 2 characters, max 100 characters
- `bio`: Optional, max 1000 characters
- `avatarUrl`: Optional, valid URL format

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "artist@example.com",
  "passwordHash": "$2b$12$KIXxLVQp4...",
  "name": "Jane Artist",
  "bio": "Digital artist specializing in landscapes",
  "avatarUrl": "https://storage.azure.com/avatars/507f1f77.jpg",
  "createdAt": ISODate("2025-01-15T10:30:00Z"),
  "updatedAt": ISODate("2025-01-15T10:30:00Z")
}
```

---

### Album Collection

**Purpose**: Store album metadata and organization

**Schema**:
```typescript
interface Album {
  _id: ObjectId;                    // MongoDB generated ID
  userId: ObjectId;                 // Reference to User._id
  title: string;                    // Album title
  description?: string;             // Album description (optional)
  date: Date;                       // Album date (for sorting)
  sortOrder: number;                // Custom sort order (for drag-drop)
  photoCount: number;               // Cached count of photos (denormalized)
  coverPhotoId?: ObjectId;          // Reference to Photo._id for cover
  createdAt: Date;                  // Creation timestamp
  updatedAt: Date;                  // Last update timestamp
}
```

**Indexes**:
```javascript
{ userId: 1, date: -1 }           // Composite index for user's albums by date
{ userId: 1, sortOrder: 1 }       // For custom sort order
{ _id: 1, userId: 1 }             // For ownership verification
```

**Validation Rules**:
- `userId`: Required, valid ObjectId
- `title`: Required, min 1 character, max 200 characters
- `description`: Optional, max 2000 characters
- `date`: Required, valid date, not in future
- `sortOrder`: Required, non-negative integer
- `photoCount`: Required, non-negative integer, default 0
- `coverPhotoId`: Optional, valid ObjectId

**Business Rules**:
- Albums cannot be nested (enforced at application level)
- Default sort order is by date (newest first)
- Custom sort order preserved when user reorders albums
- Photo count updated automatically on photo add/delete

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "title": "Urban Landscapes 2025",
  "description": "Collection of cityscapes from my travels",
  "date": ISODate("2025-03-01T00:00:00Z"),
  "sortOrder": 0,
  "photoCount": 24,
  "coverPhotoId": ObjectId("507f1f77bcf86cd799439013"),
  "createdAt": ISODate("2025-03-01T10:00:00Z"),
  "updatedAt": ISODate("2025-10-18T14:30:00Z")
}
```

---

### Photo Collection

**Purpose**: Store photo metadata and publication status

**Schema**:
```typescript
interface Photo {
  _id: ObjectId;                    // MongoDB generated ID
  albumId: ObjectId;                // Reference to Album._id
  userId: ObjectId;                 // Reference to User._id (denormalized)
  title: string;                    // Photo title
  description?: string;             // Photo description (optional)
  tags: string[];                   // Searchable tags
  
  // Azure Blob Storage URLs
  blobUrl: string;                  // Original file URL
  thumbnailUrl: string;             // Thumbnail (400x400) URL
  mediumUrl: string;                // Medium size (1200x1200) URL
  
  // File metadata
  dimensions: {
    width: number;                  // Original width in pixels
    height: number;                 // Original height in pixels
  };
  fileSize: number;                 // Size in bytes
  mimeType: string;                 // e.g., "image/jpeg"
  
  // Publication and social
  published: boolean;               // Visibility in public gallery
  likeCount: number;                // Cached like count (denormalized)
  bookmarkCount: number;            // Cached bookmark count (denormalized)
  
  // Timestamps
  creationDate?: Date;              // When photo was taken (optional)
  createdAt: Date;                  // Upload timestamp
  updatedAt: Date;                  // Last update timestamp
}
```

**Indexes**:
```javascript
{ albumId: 1, createdAt: -1 }                // Photos in album by upload date
{ userId: 1, published: 1, createdAt: -1 }  // User's published photos
{ published: 1, createdAt: -1 }             // Public gallery (all published)
{ tags: 1 }                                  // Tag search
{ published: 1, likeCount: -1 }             // Popular photos in gallery
```

**Validation Rules**:
- `albumId`: Required, valid ObjectId
- `userId`: Required, valid ObjectId
- `title`: Required, min 1 character, max 200 characters
- `description`: Optional, max 5000 characters
- `tags`: Array of strings, max 20 tags, each tag max 50 characters
- `blobUrl`, `thumbnailUrl`, `mediumUrl`: Required, valid URL format
- `dimensions.width`, `dimensions.height`: Required, positive integers
- `fileSize`: Required, positive integer, max 20971520 (20MB)
- `mimeType`: Required, one of ["image/jpeg", "image/png", "image/webp", "image/gif"]
- `published`: Required, boolean, default false
- `likeCount`, `bookmarkCount`: Required, non-negative integer, default 0
- `creationDate`: Optional, valid date, not in future

**Business Rules**:
- New photos default to unpublished (private)
- Like/bookmark counts updated automatically on like/bookmark actions
- Deleting photo removes associated likes and bookmarks
- Published photos appear in public gallery
- Tags converted to lowercase for consistency

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "albumId": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "title": "Brooklyn Bridge at Sunset",
  "description": "Captured during golden hour with dramatic cloud formations",
  "tags": ["urban", "sunset", "bridge", "new york"],
  "blobUrl": "https://storage.azure.com/photos/507f...original.jpg",
  "thumbnailUrl": "https://storage.azure.com/photos/507f...thumb.webp",
  "mediumUrl": "https://storage.azure.com/photos/507f...medium.webp",
  "dimensions": {
    "width": 4032,
    "height": 3024
  },
  "fileSize": 8388608,
  "mimeType": "image/jpeg",
  "published": true,
  "likeCount": 42,
  "bookmarkCount": 15,
  "creationDate": ISODate("2025-03-15T18:30:00Z"),
  "createdAt": ISODate("2025-03-16T10:00:00Z"),
  "updatedAt": ISODate("2025-10-18T09:15:00Z")
}
```

---

### Like Collection

**Purpose**: Track user likes on photos

**Schema**:
```typescript
interface Like {
  _id: ObjectId;                    // MongoDB generated ID
  userId: ObjectId;                 // Reference to User._id
  photoId: ObjectId;                // Reference to Photo._id
  createdAt: Date;                  // When like was created
}
```

**Indexes**:
```javascript
{ userId: 1, photoId: 1 }  // Compound unique index (user can like photo once)
{ photoId: 1, createdAt: -1 }  // Likes for a photo
```

**Validation Rules**:
- `userId`: Required, valid ObjectId
- `photoId`: Required, valid ObjectId
- Compound unique constraint on (userId, photoId)

**Business Rules**:
- User can like a photo only once
- Liking published or unpublished photos allowed
- Deleting a photo cascades to delete its likes
- Incrementing/decrementing Photo.likeCount on insert/delete

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "userId": ObjectId("507f1f77bcf86cd799439999"),
  "photoId": ObjectId("507f1f77bcf86cd799439013"),
  "createdAt": ISODate("2025-10-18T14:20:00Z")
}
```

---

### Bookmark Collection

**Purpose**: Track user bookmarks for curated collections

**Schema**:
```typescript
interface Bookmark {
  _id: ObjectId;                    // MongoDB generated ID
  userId: ObjectId;                 // Reference to User._id
  photoId: ObjectId;                // Reference to Photo._id
  createdAt: Date;                  // When bookmark was created
}
```

**Indexes**:
```javascript
{ userId: 1, photoId: 1 }          // Compound unique index
{ userId: 1, createdAt: -1 }       // User's bookmarks by date
{ photoId: 1 }                      // Bookmarks for a photo
```

**Validation Rules**:
- `userId`: Required, valid ObjectId
- `photoId`: Required, valid ObjectId
- Compound unique constraint on (userId, photoId)

**Business Rules**:
- User can bookmark a photo only once
- Bookmarks work for any photo (published or not) if user has access
- Deleting a photo cascades to delete its bookmarks
- Incrementing/decrementing Photo.bookmarkCount on insert/delete

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "userId": ObjectId("507f1f77bcf86cd799439999"),
  "photoId": ObjectId("507f1f77bcf86cd799439013"),
  "createdAt": ISODate("2025-10-18T15:45:00Z")
}
```

---

## Relationships

### User → Album (One-to-Many)
- One user owns many albums
- Cascade delete: Deleting user deletes all their albums
- Query: `db.albums.find({ userId: user._id })`

### Album → Photo (One-to-Many)
- One album contains many photos
- Cascade delete: Deleting album deletes all its photos
- Query: `db.photos.find({ albumId: album._id })`

### User → Photo (One-to-Many, Denormalized)
- User ID stored on Photo for ownership checks and gallery queries
- Avoids join through Album for performance
- Query: `db.photos.find({ userId: user._id, published: true })`

### Photo → Like (One-to-Many)
- One photo can have many likes
- Cascade delete: Deleting photo deletes all its likes
- Query: `db.likes.find({ photoId: photo._id })`

### Photo → Bookmark (One-to-Many)
- One photo can have many bookmarks
- Cascade delete: Deleting photo deletes all its bookmarks
- Query: `db.bookmarks.find({ photoId: photo._id })`

### User → Like/Bookmark (One-to-Many)
- One user can like/bookmark many photos
- Query user's likes: `db.likes.find({ userId: user._id })`
- Query user's bookmarks: `db.bookmarks.find({ userId: user._id })`

## Data Integrity

### Cascade Deletes

**Delete User**:
1. Delete all albums where `userId = deletedUserId`
2. Delete all photos where `userId = deletedUserId`
3. Delete all likes where `userId = deletedUserId`
4. Delete all bookmarks where `userId = deletedUserId`

**Delete Album**:
1. Delete all photos where `albumId = deletedAlbumId`
2. For each deleted photo:
   - Delete all likes where `photoId = deletedPhotoId`
   - Delete all bookmarks where `photoId = deletedPhotoId`

**Delete Photo**:
1. Delete all likes where `photoId = deletedPhotoId`
2. Delete all bookmarks where `photoId = deletedPhotoId`
3. Delete Azure Blob Storage files (original, thumbnail, medium)
4. Decrement Album.photoCount

### Denormalized Counters

To avoid expensive count() queries, maintain cached counts:

**Album.photoCount**:
- Increment on photo upload
- Decrement on photo delete
- Recalculate: `db.photos.countDocuments({ albumId: album._id })`

**Photo.likeCount**:
- Increment on like creation
- Decrement on like deletion
- Recalculate: `db.likes.countDocuments({ photoId: photo._id })`

**Photo.bookmarkCount**:
- Increment on bookmark creation
- Decrement on bookmark deletion
- Recalculate: `db.bookmarks.countDocuments({ photoId: photo._id })`

### Transaction Support

Use MongoDB transactions for operations requiring atomicity:

**Like Photo**:
```javascript
session.startTransaction();
try {
  await Like.create([{ userId, photoId, createdAt }], { session });
  await Photo.updateOne(
    { _id: photoId },
    { $inc: { likeCount: 1 } },
    { session }
  );
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

## Query Patterns

### Common Queries

**User's albums sorted by date**:
```javascript
db.albums.find({ userId: ObjectId("...") })
  .sort({ date: -1 })
  .limit(50);
```

**Photos in album (with pagination)**:
```javascript
db.photos.find({ albumId: ObjectId("...") })
  .sort({ createdAt: -1 })
  .skip(page * pageSize)
  .limit(pageSize);
```

**Public gallery (published photos)**:
```javascript
db.photos.find({ published: true })
  .sort({ createdAt: -1 })
  .skip(page * pageSize)
  .limit(pageSize);
```

**Popular photos in gallery**:
```javascript
db.photos.find({ published: true })
  .sort({ likeCount: -1, createdAt: -1 })
  .limit(24);
```

**User's bookmarked photos**:
```javascript
// Aggregation pipeline for join
db.bookmarks.aggregate([
  { $match: { userId: ObjectId("...") } },
  { $sort: { createdAt: -1 } },
  { $lookup: {
    from: "photos",
    localField: "photoId",
    foreignField: "_id",
    as: "photo"
  }},
  { $unwind: "$photo" },
  { $skip: page * pageSize },
  { $limit: pageSize }
]);
```

**Check if user liked/bookmarked photo**:
```javascript
db.likes.findOne({ userId: ObjectId("..."), photoId: ObjectId("...") });
```

## Migration Strategy

### Initial Schema Creation

```javascript
// Run once on new database
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });

db.createCollection("albums");
db.albums.createIndex({ userId: 1, date: -1 });
db.albums.createIndex({ userId: 1, sortOrder: 1 });

db.createCollection("photos");
db.photos.createIndex({ albumId: 1, createdAt: -1 });
db.photos.createIndex({ userId: 1, published: 1, createdAt: -1 });
db.photos.createIndex({ published: 1, createdAt: -1 });
db.photos.createIndex({ published: 1, likeCount: -1 });

db.createCollection("likes");
db.likes.createIndex({ userId: 1, photoId: 1 }, { unique: true });
db.likes.createIndex({ photoId: 1, createdAt: -1 });

db.createCollection("bookmarks");
db.bookmarks.createIndex({ userId: 1, photoId: 1 }, { unique: true });
db.bookmarks.createIndex({ userId: 1, createdAt: -1 });
db.bookmarks.createIndex({ photoId: 1 });
```

### Schema Evolution

Future migrations tracked in `backend/migrations/` directory using migrate-mongo or similar tool.
