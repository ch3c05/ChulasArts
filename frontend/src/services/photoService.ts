/**
 * Photo API Service
 * Client-side API calls for photo management
 */

import api from './api';

interface Photo {
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
  createdAt: Date;
  updatedAt: Date;
}

interface PhotoListResponse {
  data: Photo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Upload a photo to an album
 */
export async function uploadPhoto(
  albumId: string,
  file: File,
  data?: {
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
  },
  onProgress?: (progress: number) => void
) {
  const formData = new FormData();
  formData.append('photo', file);

  if (data?.title) formData.append('title', data.title);
  if (data?.description) formData.append('description', data.description);
  if (data?.tags) formData.append('tags', JSON.stringify(data.tags));
  if (data?.published !== undefined) formData.append('published', String(data.published));
  if (data?.metadata) formData.append('metadata', JSON.stringify(data.metadata));

  const response = await api.post(`/albums/${albumId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data.data;
}

/**
 * Fetch photos for an album
 */
export async function fetchAlbumPhotos(
  albumId: string,
  page: number = 1,
  limit: number = 24
): Promise<PhotoListResponse> {
  const response = await api.get(`/albums/${albumId}/photos`, {
    params: { page, limit },
  });

  return response.data;
}

/**
 * Get single photo by ID
 */
export async function getPhotoById(photoId: string): Promise<Photo> {
  const response = await api.get(`/photos/${photoId}`);
  return response.data.data;
}

/**
 * Update photo metadata
 */
export async function updatePhoto(
  photoId: string,
  data: {
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
): Promise<Photo> {
  const response = await api.patch(`/photos/${photoId}`, data);
  return response.data.data;
}

/**
 * Delete a photo
 */
export async function deletePhoto(photoId: string): Promise<void> {
  await api.delete(`/photos/${photoId}`);
}

/**
 * Reorder photos in an album
 */
export async function reorderPhotos(albumId: string, photoIds: string[]): Promise<void> {
  await api.post('/photos/reorder', { albumId, photoIds });
}

/**
 * Toggle photo published status
 */
export async function publishPhoto(photoId: string, published: boolean): Promise<Photo> {
  const response = await api.patch(`/photos/${photoId}/publish`, { published });
  return response.data.data;
}
