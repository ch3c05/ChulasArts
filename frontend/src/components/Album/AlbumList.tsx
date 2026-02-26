/**
 * AlbumList Component
 * Grid layout of album cards with drag-and-drop reordering
 */

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
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
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          No albums yet. Create your first album to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 3,
      }}
    >
      {albums.map((album, index) => (
        <Box
          key={album._id}
          draggable={enableReorder}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          sx={{
            opacity: draggedIndex === index ? 0.5 : 1,
            transition: 'opacity 0.2s',
            cursor: enableReorder ? 'move' : 'default',
          }}
        >
          <AlbumCard album={album} onEdit={onEdit} onDelete={onDelete} onClick={onClick} />
        </Box>
      ))}
    </Box>
  );
}
