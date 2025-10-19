/**
 * AlbumList Component
 * Grid layout of album cards with drag-and-drop reordering
 */

import { useState } from 'react';
import { Album } from '../../../../shared/types/album';
import { AlbumCard } from './AlbumCard';

interface AlbumListProps {
  albums: Album[];
  onEdit?: (album: Album) => void;
  onDelete?: (albumId: string) => void;
  onClick?: (album: Album) => void;
  onReorder?: (albums: Album[]) => void;
  enableReorder?: boolean;
}

export function AlbumList({
  albums,
  onEdit,
  onDelete,
  onClick,
  onReorder,
  enableReorder = false,
}: AlbumListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (enableReorder) {
      setDraggedIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (!enableReorder || draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newAlbums = [...albums];
    const draggedAlbum = newAlbums[draggedIndex];

    // Remove from old position
    newAlbums.splice(draggedIndex, 1);

    // Insert at new position
    newAlbums.splice(index, 0, draggedAlbum);

    // Update dragged index
    setDraggedIndex(index);

    // Trigger reorder callback
    onReorder?.(newAlbums);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (albums.length === 0) {
    return (
      <div className="empty-state">
        <p>No albums yet. Create your first album to get started!</p>
      </div>
    );
  }

  return (
    <div className="album-list">
      {albums.map((album, index) => (
        <div
          key={album._id}
          draggable={enableReorder}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`album-list-item ${draggedIndex === index ? 'dragging' : ''}`}
        >
          <AlbumCard album={album} onEdit={onEdit} onDelete={onDelete} onClick={onClick} />
        </div>
      ))}
    </div>
  );
}
