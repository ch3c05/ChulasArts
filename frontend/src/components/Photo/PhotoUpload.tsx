/**
 * PhotoUpload Component
 * Drag-and-drop photo upload with previews and progress using MUI
 */

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Alert,
  Stack,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { usePhotoStore } from '../../stores/photoStore';

interface PhotoUploadProps {
  albumId: string;
  onUploadComplete?: () => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ albumId, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMultiplePhotos, uploadProgress, isLoading, error } = usePhotoStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));

    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) => file.type.startsWith('image/'));
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Create previews
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    try {
      const files = previews.map((p) => p.file);
      await uploadMultiplePhotos(albumId, files, { published: false });

      // Clear previews
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      // Error handled by upload progress UI
    }
  };

  return (
    <Box>
      {/* Drop zone */}
      <Paper
        elevation={isDragging ? 8 : 1}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 4,
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
          Drag & drop photos here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse (JPEG, PNG, WebP, GIF, TIFF)
        </Typography>
        <Box
          component="input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          sx={{ display: 'none' }}
          aria-label="Select photos to upload"
        />
      </Paper>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              {previews.length} photo{previews.length !== 1 ? 's' : ''} ready to upload
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => {
                  previews.forEach((p) => URL.revokeObjectURL(p.url));
                  setPreviews([]);
                }}
                variant="outlined"
                disabled={isLoading}
                startIcon={<ClearIcon />}
              >
                Clear All
              </Button>
              <Button
                onClick={handleUpload}
                variant="contained"
                disabled={isLoading}
                startIcon={<CloudUploadIcon />}
              >
                {isLoading ? 'Uploading...' : 'Upload All'}
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: 2,
            }}
          >
            {previews.map((preview, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  position: 'relative',
                  paddingTop: '100%', // 1:1 aspect ratio
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={preview.url}
                  alt={preview.file.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {!isLoading && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(index);
                    }}
                    size="small"
                    aria-label="Remove photo"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                {/* Progress bar */}
                {uploadProgress[preview.file.name] !== undefined && (
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress[preview.file.name]}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
