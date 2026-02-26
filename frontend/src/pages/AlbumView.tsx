/**
 * Album View Page
 * Display album details and photos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAlbumStore } from '../stores/albumStore';
import { usePhotoStore } from '../stores/photoStore';
import { useAuth } from '../hooks/useAuth';
import { PhotoUpload } from '../components/Photo/PhotoUpload';
import { PhotoGrid } from '../components/Photo/PhotoGrid';
import { PhotoEditModal } from '../components/Photo/PhotoEditModal';
import { PhotoDetailModal } from '../components/Photo/PhotoDetailModal';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { Header } from '../components/Layout/Header';
import type { Photo } from '../../../shared/types/photo';

interface EditingPhoto {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  published: boolean;
}

export default function AlbumView() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentAlbum, isLoading, error, fetchAlbum, updateAlbum, deleteAlbum } = useAlbumStore();
  const { photos, fetchAlbumPhotos, updatePhoto } = usePhotoStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublished, setEditPublished] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<EditingPhoto | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (albumId) {
      fetchAlbum(albumId);
      fetchAlbumPhotos(albumId);
    }
  }, [albumId, fetchAlbum, fetchAlbumPhotos]);

  useEffect(() => {
    if (currentAlbum) {
      setEditTitle(currentAlbum.title);
      setEditDescription(currentAlbum.description || '');
      setEditPublished(currentAlbum.published);
    }
  }, [currentAlbum]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!albumId) return;

    await updateAlbum(albumId, {
      title: editTitle,
      description: editDescription,
      published: editPublished,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentAlbum) {
      setEditTitle(currentAlbum.title);
      setEditDescription(currentAlbum.description || '');
      setEditPublished(currentAlbum.published);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!albumId) return;

    if (window.confirm('Are you sure you want to delete this album and all its photos?')) {
      await deleteAlbum(albumId);
      navigate('/');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const isOwner = isAuthenticated && currentAlbum && user?.id === currentAlbum.userId;

  if (isLoading && !currentAlbum) {
    return <Loading message="Loading album..." />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ErrorMessage message={error} onRetry={() => albumId && fetchAlbum(albumId)} />
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentAlbum) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ErrorMessage message="Album not found" type="warning" />
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Header showSearch={false} showFilters={false} />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>

          {isEditing ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Album Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={editPublished}
                      onChange={(e) => setEditPublished(e.target.checked)}
                    />
                  }
                  label="Published"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
                  {currentAlbum.title}
                </Typography>
                {currentAlbum.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {currentAlbum.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {currentAlbum.photoCount} {currentAlbum.photoCount === 1 ? 'photo' : 'photos'} •{' '}
                  {currentAlbum.published ? 'Published' : 'Draft'}
                </Typography>
              </Box>

              {isOwner && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
                    Edit Album
                  </Button>
                  <IconButton color="error" onClick={handleDelete} aria-label="Delete album">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Photo Upload Section (Owner only) */}
        {isOwner && albumId && (
          <Box sx={{ mb: 4 }}>
            <PhotoUpload
              albumId={albumId}
              onUploadComplete={() => {
                fetchAlbum(albumId);
                fetchAlbumPhotos(albumId);
              }}
            />
          </Box>
        )}

        {/* Photo Grid */}
        <PhotoGrid
          photos={photos}
          isOwner={!!isOwner}
          onPhotoClick={(photo) => {
            setViewingPhoto(photo);
          }}
          onPhotoEdit={(photo) => {
            setEditingPhoto({
              _id: photo._id,
              title: photo.title,
              description: photo.description,
              tags: photo.tags || [],
              published: photo.published,
            });
          }}
          onPhotoDelete={() => {
            if (albumId) {
              fetchAlbum(albumId);
            }
          }}
        />

        {/* Photo Edit Modal */}
        {editingPhoto && (
          <PhotoEditModal
            photo={editingPhoto}
            onClose={() => setEditingPhoto(null)}
            onSave={async (photoId, data) => {
              await updatePhoto(photoId, data);
              setEditingPhoto(null);
              if (albumId) {
                fetchAlbum(albumId);
                fetchAlbumPhotos(albumId);
              }
            }}
          />
        )}

        {/* Photo Detail Modal */}
        {viewingPhoto && (
          <PhotoDetailModal
            photo={viewingPhoto}
            photos={photos}
            isOwner={!!isOwner}
            onClose={() => setViewingPhoto(null)}
            onNavigate={(photoId) => {
              const photo = photos.find((p) => p._id === photoId);
              if (photo) {
                setViewingPhoto(photo);
              }
            }}
            onPublishToggle={async (photoId, published) => {
              await updatePhoto(photoId, { published });
              // Update the viewing photo state
              const updatedPhoto = photos.find((p) => p._id === photoId);
              if (updatedPhoto) {
                setViewingPhoto({ ...updatedPhoto, published });
              }
            }}
          />
        )}
      </Container>
    </>
  );
}
