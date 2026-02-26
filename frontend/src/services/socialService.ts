/**
 * Social Service
 * API calls for likes and bookmarks
 */

import apiClient from './api';

export interface SocialStatus {
  liked: string[];
  bookmarked: string[];
}

/**
 * Like a photo
 */
export async function likePhoto(photoId: string): Promise<{ liked: boolean; likeCount: number }> {
  const response = await apiClient.post(`/photos/${photoId}/like`);
  return response.data.data;
}

/**
 * Unlike a photo
 */
export async function unlikePhoto(photoId: string): Promise<{ liked: boolean; likeCount: number }> {
  const response = await apiClient.delete(`/photos/${photoId}/like`);
  return response.data.data;
}

/**
 * Bookmark a photo
 */
export async function bookmarkPhoto(
  photoId: string
): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
  const response = await apiClient.post(`/photos/${photoId}/bookmark`);
  return response.data.data;
}

/**
 * Remove bookmark from photo
 */
export async function unbookmarkPhoto(
  photoId: string
): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
  const response = await apiClient.delete(`/photos/${photoId}/bookmark`);
  return response.data.data;
}

/**
 * Get social status for multiple photos
 */
export async function getSocialStatus(photoIds: string[]): Promise<SocialStatus> {
  const response = await apiClient.post('/photos/social-status', { photoIds });
  return response.data.data;
}

import type { Photo } from '../../../shared/types/photo';

/**
 * Get user's bookmarked photos
 */
export async function getBookmarkedPhotos(
  page: number = 1,
  limit: number = 24
): Promise<{
  photos: Photo[];
  pagination: { page: number; limit: number; total: number; hasMore: boolean };
}> {
  const response = await apiClient.get('/photos/bookmarks', {
    params: { page, limit },
  });
  return {
    photos: response.data.data,
    pagination: response.data.pagination,
  };
}
