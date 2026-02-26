/**
 * BookmarkButton Component
 * Material-UI button for bookmarking photos
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Typography, Box, Tooltip } from '@mui/material';
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useSocialStore } from '../../stores/socialStore';
import { useAuthStore } from '../../stores/authStore';

interface BookmarkButtonProps {
  photoId: string;
  bookmarkCount: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  iconOnly?: boolean;
}

export default function BookmarkButton({
  photoId,
  bookmarkCount,
  size = 'medium',
  showCount = true,
  iconOnly = false,
}: BookmarkButtonProps) {
  const { bookmarkedPhotos, bookmarkCounts, toggleBookmark } = useSocialStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Use store count if available, fallback to prop
  const displayCount = bookmarkCounts[photoId] ?? bookmarkCount;
  const isBookmarked = bookmarkedPhotos.has(photoId);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleBookmark(photoId, displayCount);
  };

  if (iconOnly) {
    return (
      <Tooltip title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <IconButton
          onClick={handleToggleBookmark}
          size={size}
          sx={{
            bgcolor: isBookmarked ? 'rgba(25, 118, 210, 0.15)' : 'rgba(255, 255, 255, 0.7)',
            color: isBookmarked ? '#1976d2' : '#000',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: isBookmarked ? 'rgba(25, 118, 210, 0.25)' : 'rgba(255, 255, 255, 0.9)',
              transform: 'scale(1.1)',
            },
          }}
        >
          {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <IconButton
        onClick={handleToggleBookmark}
        size={size}
        sx={{
          bgcolor: isBookmarked ? 'rgba(25, 118, 210, 0.15)' : 'rgba(255, 255, 255, 0.7)',
          color: isBookmarked ? '#1976d2' : '#000',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: isBookmarked ? 'rgba(25, 118, 210, 0.25)' : 'rgba(255, 255, 255, 0.9)',
            transform: 'scale(1.1)',
          },
        }}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark photo'}
      >
        {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>
      {showCount && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minWidth: '1.5rem',
            fontWeight: isBookmarked ? 600 : 400,
          }}
        >
          {displayCount}
        </Typography>
      )}
    </Box>
  );
}
