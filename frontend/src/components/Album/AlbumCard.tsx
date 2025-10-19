/**
 * AlbumCard Component
 * Displays a single album with cover image and metadata
 */

import { Album } from '../../../../shared/types/album';

interface AlbumCardProps {
  album: Album;
  onEdit?: (album: Album) => void;
  onDelete?: (albumId: string) => void;
  onClick?: (album: Album) => void;
}

export function AlbumCard({ album, onEdit, onDelete, onClick }: AlbumCardProps) {
  return (
    <div
      className="album-card"
      onClick={() => onClick?.(album)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="album-cover">
        {album.coverPhotoId ? (
          <img src={`/api/photos/${album.coverPhotoId}/thumbnail`} alt={album.title} />
        ) : (
          <div className="album-cover-placeholder">No Photos</div>
        )}
      </div>

      <div className="album-info">
        <h3 className="album-title">{album.title}</h3>
        {album.description && <p className="album-description">{album.description}</p>}
        <div className="album-meta">
          <span className="photo-count">{album.photoCount} photos</span>
          {!album.published && <span className="draft-badge">Draft</span>}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="album-actions">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(album);
              }}
              className="btn-icon"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${album.title}"?`)) {
                  onDelete(album._id);
                }
              }}
              className="btn-icon btn-danger"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
