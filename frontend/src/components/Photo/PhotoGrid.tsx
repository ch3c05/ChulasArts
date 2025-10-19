/**
 * PhotoGrid Component
 * Masonry-style photo grid with lazy loading and interactions
 */

import React from 'react';
import { usePhotoStore } from '../../stores/photoStore';

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
  published: boolean;
  likeCount: number;
  viewCount: number;
  createdAt: Date;
}

interface PhotoGridProps {
  photos: Photo[];
  isOwner: boolean;
  onPhotoClick?: (photo: Photo) => void;
  onPhotoDelete?: (photoId: string) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isOwner,
  onPhotoClick,
  onPhotoDelete,
}) => {
  const { deletePhoto, isLoading } = usePhotoStore();

  const handleDelete = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(photoId);
        if (onPhotoDelete) {
          onPhotoDelete(photoId);
        }
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  if (photos.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#999',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📷</div>
        <p style={{ fontSize: '18px', margin: 0 }}>No photos yet</p>
        {isOwner && (
          <p style={{ fontSize: '14px', marginTop: '10px' }}>Upload photos using the form above</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0 }}>Photos ({photos.length})</h2>
      </div>

      {/* Grid layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo._id}
            onClick={() => onPhotoClick && onPhotoClick(photo)}
            style={{
              position: 'relative',
              aspectRatio: `${photo.width} / ${photo.height}`,
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              backgroundColor: '#f0f0f0',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <img
              src={photo.mediumUrl}
              alt={photo.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Overlay on hover */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '15px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            >
              {/* Title and info */}
              <div>
                <h3
                  style={{
                    margin: '0 0 5px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  {photo.title}
                </h3>
                <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'white' }}>
                  <span>❤️ {photo.likeCount}</span>
                  <span>👁️ {photo.viewCount}</span>
                </div>
              </div>

              {/* Actions (owner only) */}
              {isOwner && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={(e) => handleDelete(e, photo._id)}
                    disabled={isLoading}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(220, 53, 69, 0.9)',
                      color: 'white',
                      fontSize: '12px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Published indicator */}
            {!photo.published && isOwner && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 193, 7, 0.9)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                DRAFT
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
