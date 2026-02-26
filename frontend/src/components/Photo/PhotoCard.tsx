/**
 * PhotoCard Component
 * Single photo card with hover overlay, actions, and social interactions
 */

import React from 'react';
import { Box, Typography, IconButton, Avatar, Button, Chip } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import LikeButton from '../Social/LikeButton';
import BookmarkButton from '../Social/BookmarkButton';
import type { Photo } from '../../../../shared/types/photo';

export interface PhotoWithUser extends Photo {
  username?: string;
  avatarUrl?: string;
}

interface PhotoCardProps {
  photo: PhotoWithUser;
  widthPercentage: number;
  isOwner: boolean;
  isPublic: boolean;
  isLoading: boolean;
  onClick?: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onDownload?: (e: React.MouseEvent) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  widthPercentage,
  isOwner,
  isPublic,
  isLoading,
  onClick,
  onEdit,
  onDelete,
  onShare,
  onDownload,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: `${widthPercentage}%`,
        aspectRatio: `${photo.width} / ${photo.height}`,
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 1,
        '&:hover .photo-overlay': { opacity: 1 },
      }}
    >
      <Box
        component="img"
        src={
          isPublic ? `/api/images/public/${photo._id}/medium` : `/api/images/${photo._id}/medium`
        }
        alt={photo.title}
        loading="lazy"
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Overlay on hover */}
      <Box
        className="photo-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1,
        }}
      >
        {/* Top Actions */}
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {isOwner ? (
            <>
              <IconButton
                onClick={onEdit}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#000',
                  '&:hover': { bgcolor: 'white' },
                }}
                aria-label="Edit"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={onDelete}
                disabled={isLoading}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#000',
                  '&:hover': { bgcolor: 'white' },
                }}
                aria-label="Delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={onShare}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.7)',
                  color: '#000',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'scale(1.1)' },
                }}
                aria-label="Share"
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Box onClick={(e) => e.stopPropagation()}>
                <LikeButton photoId={photo._id} likeCount={photo.likeCount} iconOnly size="small" />
              </Box>
              <Box onClick={(e) => e.stopPropagation()}>
                <BookmarkButton
                  photoId={photo._id}
                  bookmarkCount={photo.bookmarkCount}
                  iconOnly
                  size="small"
                />
              </Box>
              <IconButton
                onClick={onShare}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.7)',
                  color: '#000',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'scale(1.1)' },
                }}
                aria-label="Share"
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Bottom Info */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}
        >
          {isPublic && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'transparent',
                border: '2px solid rgba(255,255,255,0.9)',
                borderRadius: 3,
                py: 0.5,
              }}
            >
              <Box sx={{ pl: 0.5 }}>
                <Avatar
                  src={photo.avatarUrl}
                  alt={photo.username || 'Artist'}
                  sx={{ width: 42, height: 42, fontSize: '1.25rem' }}
                >
                  {photo.username ? photo.username.charAt(0).toUpperCase() : 'A'}
                </Avatar>
              </Box>
              <Typography
                variant="body1"
                sx={{ color: '#fff', fontWeight: 600, pl: '12px', pr: '20px' }}
              >
                {photo.username || 'Artist'}
              </Typography>
            </Box>
          )}
          <Button
            onClick={onDownload}
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            sx={{
              ml: isPublic ? 0 : 'auto',
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#000',
              '&:hover': { bgcolor: 'white' },
              textTransform: 'none',
              fontSize: '0.75rem',
            }}
            aria-label="Download"
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Published indicator */}
      {!photo.published && isOwner && (
        <Chip
          label="DRAFT"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            fontWeight: 'bold',
          }}
        />
      )}
    </Box>
  );
};
