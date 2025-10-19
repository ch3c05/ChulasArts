export interface Album {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  coverPhotoId?: string;
  photoCount: number;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlbumRequest {
  title: string;
  description?: string;
  published?: boolean;
}

export interface UpdateAlbumRequest {
  title?: string;
  description?: string;
  published?: boolean;
  coverPhotoId?: string;
  sortOrder?: number;
}

export interface ReorderAlbumRequest {
  sortOrder: number;
}
