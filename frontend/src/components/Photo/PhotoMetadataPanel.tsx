/**
 * PhotoMetadataPanel Component
 * Displays photo metadata, tags, camera settings, and keyboard shortcuts
 */

import { Box, Typography, Button, Chip, Stack, Divider } from '@mui/material';
import { Public as PublicIcon, Lock as LockIcon, Share as ShareIcon } from '@mui/icons-material';
import LikeButton from '../Social/LikeButton';
import BookmarkButton from '../Social/BookmarkButton';
import type { Photo } from '../../../../shared/types/photo';

interface PhotoMetadataPanelProps {
  photo: Photo;
  isOwner: boolean;
  isPublishing: boolean;
  onPublishToggle?: () => void;
  onShareClick: () => void;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function KbdKey({ children }: { children: React.ReactNode }) {
  return (
    <Box component="kbd" sx={{ px: 0.5, py: 0.25, bgcolor: 'action.selected', borderRadius: 0.5 }}>
      {children}
    </Box>
  );
}

export function PhotoMetadataPanel({
  photo,
  isOwner,
  isPublishing,
  onPublishToggle,
  onShareClick,
}: PhotoMetadataPanelProps) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxHeight: '40vh',
        overflowY: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {/* Publish Button (Owner only) */}
      {isOwner && onPublishToggle && (
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={onPublishToggle}
            disabled={isPublishing}
            variant={photo.published ? 'outlined' : 'contained'}
            color={photo.published ? 'success' : 'warning'}
            startIcon={photo.published ? <PublicIcon /> : <LockIcon />}
            fullWidth
          >
            {isPublishing
              ? 'Processing...'
              : photo.published
                ? 'Published (Click to unpublish)'
                : 'Draft (Click to publish)'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {photo.published
              ? 'This photo is visible in the public gallery'
              : 'This photo is private and only visible to you'}
          </Typography>
        </Box>
      )}

      {/* Social Actions - for non-owners */}
      {!isOwner && (
        <Box
          sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center', alignItems: 'center' }}
        >
          <LikeButton photoId={photo._id} likeCount={photo.likeCount} size="large" />
          <BookmarkButton photoId={photo._id} bookmarkCount={photo.bookmarkCount} size="large" />
          <Button onClick={onShareClick} variant="outlined" startIcon={<ShareIcon />}>
            Share
          </Button>
        </Box>
      )}

      {photo.description && (
        <Typography variant="body1" sx={{ mb: 2, color: 'white' }}>
          {photo.description}
        </Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Dimensions
          </Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {photo.width} × {photo.height}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Uploaded
          </Typography>
          <Typography variant="body2" sx={{ color: 'white' }}>
            {formatDate(photo.createdAt)}
          </Typography>
        </Box>
        {photo.tags && photo.tags.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {photo.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      {/* Camera metadata */}
      {(photo.camera || photo.lens || photo.iso) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
            Camera Settings
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 2,
            }}
          >
            {photo.camera && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Camera
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {photo.camera}
                </Typography>
              </Box>
            )}
            {photo.lens && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Lens
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {photo.lens}
                </Typography>
              </Box>
            )}
            {photo.focalLength && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Focal Length
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {photo.focalLength}mm
                </Typography>
              </Box>
            )}
            {photo.aperture && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Aperture
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {photo.aperture}
                </Typography>
              </Box>
            )}
            {photo.shutterSpeed && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Shutter
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {photo.shutterSpeed}
                </Typography>
              </Box>
            )}
            {photo.iso && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ISO
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {photo.iso}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Controls hint */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          <KbdKey>←</KbdKey> <KbdKey>→</KbdKey> Navigate
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <KbdKey>+</KbdKey> <KbdKey>−</KbdKey> Zoom
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <KbdKey>0</KbdKey> Reset
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <KbdKey>ESC</KbdKey> Close
        </Typography>
      </Box>
    </Box>
  );
}
