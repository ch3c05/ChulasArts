export interface Album {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: Date;
  sortOrder: number;
  photoCount: number;
  coverPhotoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlbumRequest {
  title: string;
  description?: string;
  date: string;
}

export interface UpdateAlbumRequest {
  title?: string;
  description?: string;
  date?: string;
  sortOrder?: number;
}

export interface ReorderAlbumRequest {
  sortOrder: number;
}
