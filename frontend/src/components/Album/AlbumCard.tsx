/**
 * AlbumCard Component
 * Displays a single album with cover image and metadata
 */

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useState } from 'react';
import type { Album } from '../../../../shared/types/album';

interface AlbumCardProps {
  album: Album;
  onEdit?: (album: Album) => void;
  onDelete?: (albumId: string) => void;
  onClick?: (album: Album) => void;
}

export function AlbumCard({ album, onEdit, onDelete, onClick }: AlbumCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCardClick = () => {
    onClick?.(album);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(album);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete?.(album._id);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': onClick
            ? {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              }
            : {},
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={handleCardClick}
      >
        {/* Cover Image */}
        {album.coverPhotoId ? (
          <CardMedia
            component="img"
            height="200"
            image={`/api/images/${album.coverPhotoId}/thumbnail`}
            alt={album.title}
            sx={{
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.200',
              color: 'grey.500',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              No Photos
            </Typography>
          </Box>
        )}

        {/* Content */}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {album.title}
          </Typography>

          {album.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 1,
              }}
            >
              {album.description}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
            </Typography>
            {!album.published && (
              <Chip label="Draft" size="small" color="default" variant="outlined" />
            )}
          </Box>
        </CardContent>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
            {onEdit && (
              <IconButton size="small" onClick={handleEdit} aria-label="Edit album" color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={handleDeleteClick}
                aria-label="Delete album"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </CardActions>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Album</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{album.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
