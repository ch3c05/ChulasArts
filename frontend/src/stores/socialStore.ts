/**
 * Social Store
 * Zustand store for likes and bookmarks state
 */

import { create } from 'zustand';
import {
  likePhoto,
  unlikePhoto,
  bookmarkPhoto,
  unbookmarkPhoto,
  getSocialStatus,
} from '../services/socialService';

interface SocialState {
  // Liked photo IDs
  likedPhotos: Set<string>;
  // Bookmarked photo IDs
  bookmarkedPhotos: Set<string>;
  // Photo like counts
  likeCounts: Record<string, number>;
  // Photo bookmark counts
  bookmarkCounts: Record<string, number>;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;

  // Actions
  toggleLike: (photoId: string, currentCount: number) => Promise<void>;
  toggleBookmark: (photoId: string, currentCount: number) => Promise<void>;
  loadSocialStatus: (photoIds: string[]) => Promise<void>;
  setLikeCounts: (counts: Record<string, number>) => void;
  setBookmarkCounts: (counts: Record<string, number>) => void;
  clearError: () => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  likedPhotos: new Set<string>(),
  bookmarkedPhotos: new Set<string>(),
  likeCounts: {},
  bookmarkCounts: {},
  isLoading: false,
  error: null,

  toggleLike: async (photoId: string, currentCount: number) => {
    const { likedPhotos, likeCounts } = get();
    const isLiked = likedPhotos.has(photoId);

    // Optimistic update
    const newLikedPhotos = new Set(likedPhotos);
    const optimisticCount = isLiked ? currentCount - 1 : currentCount + 1;

    if (isLiked) {
      newLikedPhotos.delete(photoId);
    } else {
      newLikedPhotos.add(photoId);
    }

    set({
      likedPhotos: newLikedPhotos,
      likeCounts: {
        ...likeCounts,
        [photoId]: optimisticCount,
      },
    });

    try {
      // Make API call
      const result = isLiked ? await unlikePhoto(photoId) : await likePhoto(photoId);

      // Update with server response
      set((state) => ({
        likeCounts: {
          ...state.likeCounts,
          [photoId]: result.likeCount,
        },
      }));
    } catch (error: unknown) {
      // Revert on error
      set({
        likedPhotos,
        likeCounts: {
          ...likeCounts,
          [photoId]: currentCount,
        },
        error: error instanceof Error ? error.message : 'Failed to update like',
      });
    }
  },

  toggleBookmark: async (photoId: string, currentCount: number) => {
    const { bookmarkedPhotos, bookmarkCounts } = get();
    const isBookmarked = bookmarkedPhotos.has(photoId);

    // Optimistic update
    const newBookmarkedPhotos = new Set(bookmarkedPhotos);
    const optimisticCount = isBookmarked ? currentCount - 1 : currentCount + 1;

    if (isBookmarked) {
      newBookmarkedPhotos.delete(photoId);
    } else {
      newBookmarkedPhotos.add(photoId);
    }

    set({
      bookmarkedPhotos: newBookmarkedPhotos,
      bookmarkCounts: {
        ...bookmarkCounts,
        [photoId]: optimisticCount,
      },
    });

    try {
      // Make API call
      const result = isBookmarked ? await unbookmarkPhoto(photoId) : await bookmarkPhoto(photoId);

      // Update with server response
      set((state) => ({
        bookmarkCounts: {
          ...state.bookmarkCounts,
          [photoId]: result.bookmarkCount,
        },
      }));
    } catch (error: unknown) {
      // Revert on error
      set({
        bookmarkedPhotos,
        bookmarkCounts: {
          ...bookmarkCounts,
          [photoId]: currentCount,
        },
        error: error instanceof Error ? error.message : 'Failed to update bookmark',
      });
    }
  },

  loadSocialStatus: async (photoIds: string[]) => {
    if (photoIds.length === 0) return;

    set({ isLoading: true, error: null });

    try {
      const status = await getSocialStatus(photoIds);

      // Merge with existing state — only update the queried photoIds,
      // preserving social status for photos from other views
      const likedSet = new Set(status.liked);
      const bookmarkedSet = new Set(status.bookmarked);

      set((state) => {
        const newLikedPhotos = new Set(state.likedPhotos);
        const newBookmarkedPhotos = new Set(state.bookmarkedPhotos);

        for (const id of photoIds) {
          if (likedSet.has(id)) {
            newLikedPhotos.add(id);
          } else {
            newLikedPhotos.delete(id);
          }
          if (bookmarkedSet.has(id)) {
            newBookmarkedPhotos.add(id);
          } else {
            newBookmarkedPhotos.delete(id);
          }
        }

        return {
          likedPhotos: newLikedPhotos,
          bookmarkedPhotos: newBookmarkedPhotos,
          isLoading: false,
        };
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load social status',
        isLoading: false,
      });
    }
  },

  setLikeCounts: (counts: Record<string, number>) => {
    set((state) => ({
      likeCounts: { ...state.likeCounts, ...counts },
    }));
  },

  setBookmarkCounts: (counts: Record<string, number>) => {
    set((state) => ({
      bookmarkCounts: { ...state.bookmarkCounts, ...counts },
    }));
  },

  clearError: () => set({ error: null }),
}));
