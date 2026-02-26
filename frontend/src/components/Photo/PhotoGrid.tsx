/**
 * PhotoGrid Component
 * Masonry-style photo grid with lazy loading and interactions using MUI
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import { usePhotoStore } from '../../stores/photoStore';
import { useSocialStore } from '../../stores/socialStore';
import { useAuthStore } from '../../stores/authStore';
import ShareModal from '../Social/ShareModal';
import { PhotoCard, type PhotoWithUser } from './PhotoCard';

interface PhotoGridProps {
  photos: PhotoWithUser[];
  isOwner: boolean;
  isPublic?: boolean;
  onPhotoClick?: (photo: PhotoWithUser) => void;
  onPhotoDelete?: (photoId: string) => void;
  onPhotoEdit?: (photo: PhotoWithUser) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  isOwner,
  isPublic = false,
  onPhotoClick,
  onPhotoDelete,
  onPhotoEdit,
}) => {
  const { deletePhoto, isLoading } = usePhotoStore();
  const { loadSocialStatus, setLikeCounts, setBookmarkCounts } = useSocialStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [photoToDelete, setPhotoToDelete] = React.useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [photoToShare, setPhotoToShare] = React.useState<PhotoWithUser | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Load social status for all photos when grid mounts or photos change
  React.useEffect(() => {
    if (photos.length > 0) {
      const photoIds = photos.map((p) => p._id);
      if (isAuthenticated) {
        loadSocialStatus(photoIds);
      }

      // Initialize counts from photo data
      const likeCounts: Record<string, number> = {};
      const bookmarkCounts: Record<string, number> = {};
      photos.forEach((photo) => {
        likeCounts[photo._id] = photo.likeCount;
        bookmarkCounts[photo._id] = photo.bookmarkCount;
      });
      setLikeCounts(likeCounts);
      setBookmarkCounts(bookmarkCounts);
    }
  }, [photos, isAuthenticated, loadSocialStatus, setLikeCounts, setBookmarkCounts]);

  const handleDeleteClick = (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    setPhotoToDelete(photoId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!photoToDelete) return;

    try {
      await deletePhoto(photoToDelete);
      if (onPhotoDelete) {
        onPhotoDelete(photoToDelete);
      }
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
    } catch (err) {
      // Error handled by parent component
    }
  };

  const handleShare = (e: React.MouseEvent, photo: PhotoWithUser) => {
    e.stopPropagation();
    setPhotoToShare(photo);
    setShareModalOpen(true);
  };

  const handleDownload = async (e: React.MouseEvent, photo: PhotoWithUser) => {
    e.stopPropagation();
    try {
      const imageUrl = isPublic
        ? `/api/images/public/${photo._id}/original`
        : `/api/images/${photo._id}/original`;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Download failed silently
    }
  };

  // Layout photos into rows with same height but varying widths
  const layoutPhotosInRows = () => {
    const rows: PhotoWithUser[][] = [];

    // Responsive columns based on breakpoints
    let photosPerRow: number;

    if (isMobile) {
      photosPerRow = 1;
    } else if (isTablet) {
      photosPerRow = 3;
    } else {
      photosPerRow = 4;
    }

    // Create fixed-column rows
    for (let i = 0; i < photos.length; i += photosPerRow) {
      const row = photos.slice(i, i + photosPerRow);
      rows.push(row);
    }

    return rows;
  };

  if (photos.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
        }}
      >
        <ImageIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No photos yet
        </Typography>
        {isOwner && (
          <Typography variant="body2" color="text.secondary">
            Upload photos using the form above
          </Typography>
        )}
      </Box>
    );
  }

  const photoRows = layoutPhotosInRows();

  return (
    <Box>
      {/* Grid layout with rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {photoRows.map((row, rowIndex) => {
          // Hide single-photo rows on tablet/desktop
          if (!isMobile && row.length === 1) {
            return null;
          }

          const totalAspectRatio = row.reduce((sum, photo) => sum + photo.width / photo.height, 0);

          return (
            <Box key={rowIndex} sx={{ display: 'flex', gap: 3 }}>
              {row.map((photo) => {
                const aspectRatio = photo.width / photo.height;
                const widthPercentage = (aspectRatio / totalAspectRatio) * 100;

                return (
                  <PhotoCard
                    key={photo._id}
                    photo={photo}
                    widthPercentage={widthPercentage}
                    isOwner={isOwner}
                    isPublic={isPublic}
                    isLoading={isLoading}
                    onClick={() => onPhotoClick && onPhotoClick(photo)}
                    onEdit={(e) => {
                      e.stopPropagation();
                      onPhotoEdit && onPhotoEdit(photo);
                    }}
                    onDelete={(e) => handleDeleteClick(e, photo._id)}
                    onShare={(e) => handleShare(e, photo)}
                    onDownload={(e) => handleDownload(e, photo)}
                  />
                );
              })}
            </Box>
          );
        })}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Photo?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this photo? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Modal */}
      {photoToShare && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setPhotoToShare(null);
          }}
          photoUrl={`/gallery?photo=${photoToShare._id}`}
          photoTitle={photoToShare.title}
        />
      )}
    </Box>
  );
};
