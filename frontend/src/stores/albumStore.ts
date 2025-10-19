/**
 * Album Store
 * Zustand store for album state management
 */

import { create } from 'zustand';
import type { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../../../shared/types/album';
import * as albumApi from '../services/albumService';
import { handleApiError } from '../services/api';

interface AlbumState {
  albums: Album[];
  currentAlbum: Album | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAlbums: () => Promise<void>;
  fetchAlbum: (albumId: string) => Promise<void>;
  createAlbum: (data: CreateAlbumRequest) => Promise<Album>;
  updateAlbum: (albumId: string, data: UpdateAlbumRequest) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  reorderAlbums: (albums: Album[]) => Promise<void>;
  clearError: () => void;
  setCurrentAlbum: (album: Album | null) => void;
}

export const useAlbumStore = create<AlbumState>((set, get) => ({
  albums: [],
  currentAlbum: null,
  isLoading: false,
  error: null,

  /**
   * Fetch all albums for current user
   */
  fetchAlbums: async () => {
    set({ isLoading: true, error: null });

    try {
      const albums = await albumApi.getAlbums();
      set({ albums, isLoading: false });
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Fetch single album by ID
   */
  fetchAlbum: async (albumId: string) => {
    set({ isLoading: true, error: null });

    try {
      const album = await albumApi.getAlbum(albumId);
      set({ currentAlbum: album, isLoading: false });
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Create new album
   */
  createAlbum: async (data: CreateAlbumRequest): Promise<Album> => {
    set({ isLoading: true, error: null });

    try {
      const album = await albumApi.createAlbum(data);

      // Add to albums list
      set((state) => ({
        albums: [...state.albums, album],
        isLoading: false,
      }));

      return album;
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Update album
   */
  updateAlbum: async (albumId: string, data: UpdateAlbumRequest) => {
    set({ isLoading: true, error: null });

    try {
      const updatedAlbum = await albumApi.updateAlbum(albumId, data);

      // Update in albums list
      set((state) => ({
        albums: state.albums.map((a) => (a._id === albumId ? updatedAlbum : a)),
        currentAlbum: state.currentAlbum?._id === albumId ? updatedAlbum : state.currentAlbum,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Delete album
   */
  deleteAlbum: async (albumId: string) => {
    set({ isLoading: true, error: null });

    try {
      await albumApi.deleteAlbum(albumId);

      // Remove from albums list
      set((state) => ({
        albums: state.albums.filter((a) => a._id !== albumId),
        currentAlbum: state.currentAlbum?._id === albumId ? null : state.currentAlbum,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Reorder albums (drag and drop)
   */
  reorderAlbums: async (reorderedAlbums: Album[]) => {
    // Optimistic update
    const previousAlbums = get().albums;
    set({ albums: reorderedAlbums });

    try {
      const albumOrders = reorderedAlbums.map((album, index) => ({
        albumId: album._id,
        sortOrder: index,
      }));

      await albumApi.reorderAlbums(albumOrders);
    } catch (error) {
      // Revert on error
      set({ albums: previousAlbums });

      const errorMessage = handleApiError(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Set current album
   */
  setCurrentAlbum: (album: Album | null) => {
    set({ currentAlbum: album });
  },
}));
