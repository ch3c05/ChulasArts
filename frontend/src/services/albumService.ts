/**
 * Album API Service
 * API calls for album operations
 */

import apiClient, { ApiResponse } from './api';
import type { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../../../shared/types/album';

/**
 * Get all albums for current user
 */
export async function getAlbums(): Promise<Album[]> {
  const response = await apiClient.get<ApiResponse<Album[]>>('/albums');
  return response.data.data;
}

/**
 * Get single album by ID
 */
export async function getAlbum(albumId: string): Promise<Album> {
  const response = await apiClient.get<ApiResponse<Album>>(`/albums/${albumId}`);
  return response.data.data;
}

/**
 * Create new album
 */
export async function createAlbum(data: CreateAlbumRequest): Promise<Album> {
  const response = await apiClient.post<ApiResponse<Album>>('/albums', data);
  return response.data.data;
}

/**
 * Update album
 */
export async function updateAlbum(albumId: string, data: UpdateAlbumRequest): Promise<Album> {
  const response = await apiClient.patch<ApiResponse<Album>>(`/albums/${albumId}`, data);
  return response.data.data;
}

/**
 * Delete album
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  await apiClient.delete(`/albums/${albumId}`);
}

/**
 * Reorder albums
 */
export async function reorderAlbums(
  albums: Array<{ albumId: string; sortOrder: number }>
): Promise<void> {
  await apiClient.post('/albums/reorder', { albums });
}
