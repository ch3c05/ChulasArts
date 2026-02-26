/**
 * PhotoDetailModal Component
 * Full-screen photo viewer with zoom, navigation, and keyboard controls using MUI
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, Box, Typography, IconButton, CircularProgress, Paper } from '@mui/material';
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';
import ShareModal from '../Social/ShareModal';
import { PhotoMetadataPanel } from './PhotoMetadataPanel';
import { useImageZoom } from './useImageZoom';
import type { Photo } from '../../../../shared/types/photo';

interface PhotoDetailModalProps {
  photo: Photo;
  photos: Photo[];
  isOwner?: boolean;
  isPublic?: boolean;
  onClose: () => void;
  onNavigate?: (photoId: string) => void;
  onPublishToggle?: (photoId: string, published: boolean) => void;
}

export function PhotoDetailModal({
  photo,
  photos,
  isOwner = false,
  isPublic = false,
  onClose,
  onNavigate,
  onPublishToggle,
}: PhotoDetailModalProps) {
  const {
    zoomLevel,
    panPosition,
    isPanning,
    resetZoom,
    zoomIn,
    zoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useImageZoom();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentIndex = photos.findIndex((p) => p._id === photo._id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrevious && onNavigate) {
      onNavigate(photos[currentIndex - 1]._id);
      setImageLoaded(false);
      resetZoom();
    }
  }, [hasPrevious, onNavigate, photos, currentIndex, resetZoom]);

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(photos[currentIndex + 1]._id);
      setImageLoaded(false);
      resetZoom();
    }
  }, [hasNext, onNavigate, photos, currentIndex, resetZoom]);

  const handlePublishToggle = async () => {
    if (!onPublishToggle) return;
    setIsPublishing(true);
    try {
      await onPublishToggle(photo._id, !photo.published);
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '=':
        case '+':
          zoomIn();
          break;
        case '-':
        case '_':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrevious, handleNext, zoomIn, zoomOut, resetZoom]);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{ sx: { bgcolor: 'rgba(0, 0, 0, 0.95)', color: 'white' } }}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {photo.title}
            </Typography>
            {photos.length > 1 && (
              <Typography variant="caption" color="text.secondary">
                {currentIndex + 1} / {photos.length}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Image Container */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!imageLoaded && <CircularProgress sx={{ position: 'absolute' }} />}
          <Box
            ref={imageRef}
            component="img"
            src={
              isPublic
                ? `/api/images/public/${photo._id}/original`
                : `/api/images/${photo._id}/original`
            }
            alt={photo.title}
            onLoad={() => setImageLoaded(true)}
            sx={{
              maxWidth: zoomLevel === 1 ? '100%' : 'none',
              maxHeight: zoomLevel === 1 ? '100%' : 'none',
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
              transition: imageLoaded ? 'none' : 'opacity 0.3s',
              opacity: imageLoaded ? 1 : 0,
            }}
          />

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                disabled={!hasPrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
                aria-label="Previous photo"
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
              <IconButton
                onClick={handleNext}
                disabled={!hasNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
                aria-label="Next photo"
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </>
          )}

          {/* Zoom Controls */}
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <IconButton
              onClick={zoomOut}
              disabled={zoomLevel <= 1}
              size="small"
              sx={{
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
              aria-label="Zoom out"
              title="Zoom out (-)"
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                minWidth: 50,
                textAlign: 'center',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                borderRadius: 1,
                py: 0.5,
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton
              onClick={zoomIn}
              disabled={zoomLevel >= 3}
              size="small"
              sx={{
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={resetZoom}
              disabled={zoomLevel === 1}
              size="small"
              sx={{
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
              aria-label="Reset zoom"
              title="Reset zoom (0)"
            >
              <RestartAltIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* Footer — Photo metadata, social actions, camera settings */}
        <PhotoMetadataPanel
          photo={photo}
          isOwner={isOwner}
          isPublishing={isPublishing}
          onPublishToggle={onPublishToggle ? handlePublishToggle : undefined}
          onShareClick={() => setShareModalOpen(true)}
        />
      </Box>

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        photoUrl={`/gallery?photo=${photo._id}`}
        photoTitle={photo.title}
      />
    </Dialog>
  );
}
