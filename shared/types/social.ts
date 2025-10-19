/**
 * Social Interaction Type Definitions (Likes and Bookmarks)
 * Shared between frontend and backend
 */

export interface Like {
  _id: string;
  userId: string;
  photoId: string;
  createdAt: Date;
}

export interface Bookmark {
  _id: string;
  userId: string;
  photoId: string;
  createdAt: Date;
}

export interface LikeResponse {
  data: {
    liked: boolean;
    likeCount: number;
  };
}

export interface BookmarkResponse {
  data: {
    bookmarked: boolean;
    bookmarkCount: number;
  };
}
