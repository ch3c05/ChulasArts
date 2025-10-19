/**
 * Photo Type Definitions
 * Shared between frontend and backend
 */

export interface Photo {
  _id: string;
  albumId: string;
  userId: string;
  title: string;
  description?: string;
  originalUrl: string;
  mediumUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  tags: string[];
  published: boolean;
  likeCount: number;
  bookmarkCount: number;
  viewCount: number;
  capturedAt?: Date;
  location?: string;
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePhotoRequest {
  albumId: string;
  title: string;
  description?: string;
  tags?: string[];
  published?: boolean;
  metadata?: {
    capturedAt?: string;
    location?: string;
    camera?: string;
    lens?: string;
    focalLength?: number;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
  };
}

export interface UpdatePhotoRequest {
  title?: string;
  description?: string;
  tags?: string[];
  published?: boolean;
  metadata?: {
    capturedAt?: string;
    location?: string;
    camera?: string;
    lens?: string;
    focalLength?: number;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
  };
}

export interface PhotoResponse {
  data: Photo;
}

export interface PhotoListResponse {
  data: Photo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
