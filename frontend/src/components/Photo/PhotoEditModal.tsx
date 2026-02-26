/**
 * PhotoEditModal Component
 * Modal for editing photo metadata using MUI
 */

import { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';

interface Photo {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  published: boolean;
}

interface PhotoEditModalProps {
  photo: Photo;
  onSave: (
    photoId: string,
    data: {
      title?: string;
      description?: string;
      tags?: string[];
      published?: boolean;
    }
  ) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function PhotoEditModal({ photo, onSave, onClose, isLoading }: PhotoEditModalProps) {
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [tags, setTags] = useState(photo.tags.join(', '));
  const [published, setPublished] = useState(photo.published);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (description.length > 2000) {
      setError('Description must be 2000 characters or less');
      return;
    }

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      await onSave(photo._id, {
        title: title.trim(),
        description: description.trim(),
        tags: tagArray,
        published,
      });

      onClose();
    } catch (err) {
      setError('Failed to update photo');
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Edit Photo
        <IconButton onClick={onClose} edge="end" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack component="form" spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            inputProps={{ maxLength: 200 }}
            helperText={`${title.length}/200 characters`}
            disabled={isLoading}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            inputProps={{ maxLength: 2000 }}
            helperText={`${description.length}/2000 characters`}
            disabled={isLoading}
          />

          <TextField
            label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
            placeholder="landscape, nature, sunset"
            helperText="Separate tags with commas"
            disabled={isLoading}
          />

          <FormControlLabel
            control={
              <Switch
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Published (visible to public)"
            sx={{ color: 'text.primary' }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
