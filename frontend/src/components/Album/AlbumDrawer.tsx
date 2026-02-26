/**
 * AlbumDrawer Component
 * Material UI Drawer for creating/editing albums
 */

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import type { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../../../../shared/types/album';

interface AlbumDrawerProps {
  open: boolean;
  album?: Album;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlbumRequest | UpdateAlbumRequest) => Promise<void>;
}

export function AlbumDrawer({
  open,
  album,
  isLoading = false,
  onClose,
  onSubmit,
}: AlbumDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const isEditing = !!album;

  // Initialize form when drawer opens or album changes
  useEffect(() => {
    if (open) {
      if (album) {
        setTitle(album.title);
        setDescription(album.description || '');
        setPublished(album.published);
      } else {
        setTitle('');
        setDescription('');
        setPublished(false);
      }
      setErrors({});
    } else {
      // Reset form when drawer closes
      setTitle('');
      setDescription('');
      setPublished(false);
      setErrors({});
    }
  }, [open, album]);

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      published,
    };

    try {
      await onSubmit(data);
      // Don't call onClose here - let parent handle it after successful save
    } catch {
      // Keep drawer open on error so user can retry
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
            {isEditing ? 'Edit Album' : 'Create New Album'}
          </Typography>
          <IconButton onClick={onClose} edge="end" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Scrollable Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
            <Stack spacing={3}>
              {/* Title */}
              <TextField
                label="Album Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title || `${title.length}/200 characters`}
                fullWidth
                required
                autoFocus
                disabled={isLoading}
                inputProps={{ maxLength: 200 }}
              />

              {/* Description */}
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${description.length}/1000 characters`}
                fullWidth
                multiline
                rows={4}
                disabled={isLoading}
                inputProps={{ maxLength: 1000 }}
              />

              {/* Published Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    disabled={isLoading}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      Published
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {published
                        ? 'Album is visible in your public portfolio'
                        : 'Album is private and only visible to you'}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>

          <Divider />

          {/* Actions */}
          <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
            <Button onClick={onClose} variant="outlined" fullWidth disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Album'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
