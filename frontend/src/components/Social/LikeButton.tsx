/**
 * LikeButton Component
 * Material-UI button for liking photos
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Typography, Box, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useSocialStore } from '../../stores/socialStore';
import { useAuthStore } from '../../stores/authStore';

interface LikeButtonProps {
  photoId: string;
  likeCount: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  iconOnly?: boolean;
}

export default function LikeButton({
  photoId,
  likeCount,
  size = 'medium',
  showCount = true,
  iconOnly = false,
}: LikeButtonProps) {
  const { likedPhotos, likeCounts, toggleLike } = useSocialStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Use store count if available, fallback to prop
  const displayCount = likeCounts[photoId] ?? likeCount;
  const isLiked = likedPhotos.has(photoId);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleLike(photoId, displayCount);
  };

  if (iconOnly) {
    return (
      <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
        <IconButton
          onClick={handleToggleLike}
          size={size}
          sx={{
            bgcolor: isLiked ? 'rgba(229, 57, 53, 0.15)' : 'rgba(255, 255, 255, 0.7)',
            color: isLiked ? '#e53935' : '#000',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: isLiked ? 'rgba(229, 57, 53, 0.25)' : 'rgba(255, 255, 255, 0.9)',
              transform: 'scale(1.1)',
            },
          }}
        >
          {isLiked ? <Favorite /> : <FavoriteBorder />}
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
        onClick={handleToggleLike}
        size={size}
        sx={{
          bgcolor: isLiked ? 'rgba(229, 57, 53, 0.15)' : 'rgba(255, 255, 255, 0.7)',
          color: isLiked ? '#e53935' : '#000',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: isLiked ? 'rgba(229, 57, 53, 0.25)' : 'rgba(255, 255, 255, 0.9)',
            transform: 'scale(1.1)',
          },
        }}
        aria-label={isLiked ? 'Unlike photo' : 'Like photo'}
      >
        {isLiked ? <Favorite /> : <FavoriteBorder />}
      </IconButton>
      {showCount && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minWidth: '1.5rem',
            fontWeight: isLiked ? 600 : 400,
          }}
        >
          {displayCount}
        </Typography>
      )}
    </Box>
  );
}
