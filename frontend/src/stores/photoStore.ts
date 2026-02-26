/**
 * Photo Store
 * Global state management for photos using Zustand
 */

import { create } from 'zustand';
import * as photoService from '../services/photoService';

interface PhotoMetadata {
  capturedAt?: string;
  location?: string;
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
}

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

interface PhotoStore {
  // State
  photos: Photo[];
  currentPhoto: Photo | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: { [key: string]: number };

  // Actions
  uploadPhoto: (
    albumId: string,
    file: File,
    data?: {
      title?: string;
      description?: string;
      tags?: string[];
      published?: boolean;
      metadata?: PhotoMetadata;
    }
  ) => Promise<Photo>;
  uploadMultiplePhotos: (
    albumId: string,
    files: File[],
    data?: {
      title?: string;
      description?: string;
      tags?: string[];
      published?: boolean;
    }
  ) => Promise<Photo[]>;
  fetchAlbumPhotos: (albumId: string, page?: number, limit?: number) => Promise<void>;
  fetchPhotoById: (photoId: string) => Promise<void>;
  updatePhoto: (
    photoId: string,
    data: {
      title?: string;
      description?: string;
      tags?: string[];
      published?: boolean;
      metadata?: PhotoMetadata;
    }
  ) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  reorderPhotos: (albumId: string, photoIds: string[]) => Promise<void>;
  publishPhoto: (photoId: string, published: boolean) => Promise<void>;
  clearPhotos: () => void;
  clearError: () => void;
}

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  // Initial state
  photos: [],
  currentPhoto: null,
  isLoading: false,
  error: null,
  uploadProgress: {},

  // Upload single photo
  uploadPhoto: async (albumId, file, data) => {
    set({ isLoading: true, error: null });
    try {
      const photo = await photoService.uploadPhoto(albumId, file, data, (progress) => {
        set((state) => ({
          uploadProgress: {
            ...state.uploadProgress,
            [file.name]: progress,
          },
        }));
      });

      // Add to photos array
      set((state) => ({
        photos: [photo, ...state.photos],
        isLoading: false,
        uploadProgress: {
          ...state.uploadProgress,
          [file.name]: 100,
        },
      }));

      // Clear progress after 2 seconds
      setTimeout(() => {
        set((state) => {
          const newProgress = { ...state.uploadProgress };
          delete newProgress[file.name];
          return { uploadProgress: newProgress };
        });
      }, 2000);

      return photo;
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload photo',
        isLoading: false,
      });
      throw error;
    }
  },

  // Upload multiple photos
  uploadMultiplePhotos: async (albumId, files, data) => {
    set({ isLoading: true, error: null });
    try {
      const uploadPromises = files.map((file) =>
        photoService.uploadPhoto(albumId, file, data, (progress) => {
          set((state) => ({
            uploadProgress: {
              ...state.uploadProgress,
              [file.name]: progress,
            },
          }));
        })
      );

      const uploadedPhotos = await Promise.all(uploadPromises);

      // Add to photos array
      set((state) => ({
        photos: [...uploadedPhotos, ...state.photos],
        isLoading: false,
      }));

      // Clear progress after 2 seconds
      setTimeout(() => {
        set({ uploadProgress: {} });
      }, 2000);

      return uploadedPhotos;
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload photos',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch photos for an album
  fetchAlbumPhotos: async (albumId, page = 1, limit = 24) => {
    set({ isLoading: true, error: null });
    try {
      const result = await photoService.fetchAlbumPhotos(albumId, page, limit);
      set({ photos: result.data, isLoading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch photos',
        isLoading: false,
      });
    }
  },

  // Fetch single photo
  fetchPhotoById: async (photoId) => {
    set({ isLoading: true, error: null });
    try {
      const photo = await photoService.getPhotoById(photoId);
      set({ currentPhoto: photo, isLoading: false });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch photo',
        isLoading: false,
      });
    }
  },

  // Update photo
  updatePhoto: async (photoId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPhoto = await photoService.updatePhoto(photoId, data);

      // Update in photos array
      set((state) => ({
        photos: state.photos.map((p) => (p._id === photoId ? updatedPhoto : p)),
        currentPhoto: state.currentPhoto?._id === photoId ? updatedPhoto : state.currentPhoto,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update photo',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete photo
  deletePhoto: async (photoId) => {
    set({ isLoading: true, error: null });
    try {
      await photoService.deletePhoto(photoId);

      // Remove from photos array
      set((state) => ({
        photos: state.photos.filter((p) => p._id !== photoId),
        currentPhoto: state.currentPhoto?._id === photoId ? null : state.currentPhoto,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete photo',
        isLoading: false,
      });
      throw error;
    }
  },

  // Reorder photos
  reorderPhotos: async (albumId, photoIds) => {
    // Optimistic update
    const previousPhotos = get().photos;
    const reorderedPhotos = photoIds
      .map((id) => previousPhotos.find((p) => p._id === id))
      .filter((p): p is Photo => p !== undefined);

    set({ photos: reorderedPhotos });

    try {
      await photoService.reorderPhotos(albumId, photoIds);
    } catch (error: unknown) {
      // Revert on error
      set({
        photos: previousPhotos,
        error: error instanceof Error ? error.message : 'Failed to reorder photos',
      });
      throw error;
    }
  },

  // Publish/unpublish photo
  publishPhoto: async (photoId, published) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPhoto = await photoService.publishPhoto(photoId, published);

      // Update in photos array
      set((state) => ({
        photos: state.photos.map((p) => (p._id === photoId ? updatedPhoto : p)),
        currentPhoto: state.currentPhoto?._id === photoId ? updatedPhoto : state.currentPhoto,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to publish photo',
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear photos
  clearPhotos: () => {
    set({ photos: [], currentPhoto: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
