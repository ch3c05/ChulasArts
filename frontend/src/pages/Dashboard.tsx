/**
 * Dashboard Page
 * Main dashboard showing user's albums
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  TextField,
  Paper,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAlbumStore } from '../stores/albumStore';
import { useAuth } from '../hooks/useAuth';
import { AlbumList } from '../components/Album/AlbumList';
import { AlbumDrawer } from '../components/Album/AlbumDrawer';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { Header } from '../components/Layout/Header';
import type { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../../../shared/types/album';

export function Dashboard() {
  const navigate = useNavigate();
  const {
    albums,
    isLoading,
    error,
    fetchAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    clearError,
    reorderAlbums,
  } = useAlbumStore();
  const { user, isAuthenticated, updateProfile, getCurrentUser } = useAuth();

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | undefined>();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: '',
    avatarUrl: '',
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch albums on mount and when returning to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlbums();
    }
  }, [isAuthenticated]);

  // Refetch albums when component becomes visible (user navigates back)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && document.visibilityState === 'visible') {
        fetchAlbums();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleCreateAlbum = () => {
    setEditingAlbum(undefined);
    setShowDrawer(true);
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setShowDrawer(true);
  };

  const handleSubmitAlbum = async (data: CreateAlbumRequest | UpdateAlbumRequest) => {
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum._id, data as UpdateAlbumRequest);
      } else {
        await createAlbum(data as CreateAlbumRequest);
      }
      // Close drawer and clear editing state on success
      setShowDrawer(false);
      setEditingAlbum(undefined);
    } catch (error) {
      // Error is already handled by the store
      throw error; // Re-throw so AlbumDrawer can handle it
    }
  };

  const handleCancelDrawer = () => {
    setShowDrawer(false);
    setEditingAlbum(undefined);
    clearError();
  };

  const handleAlbumClick = (album: Album) => {
    navigate(`/albums/${album._id}`);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setShowProfileEdit(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);

    try {
      // Create FormData for avatar upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload avatar to backend
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Update profile data with new avatar URL (signed URL for display)
      setProfileData({
        ...profileData,
        avatarUrl: data.data.avatarUrl,
      });

      // Refresh user data from server to get updated profile
      await getCurrentUser();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header showSearch={false} showFilters={false} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Profile Section */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, sm: 3 },
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            {/* Avatar */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={profileData.avatarUrl}
                alt={user?.name}
                sx={{
                  width: { xs: 80, sm: 120 },
                  height: { xs: 80, sm: 120 },
                  fontSize: { xs: '2rem', sm: '3rem' },
                  bgcolor: 'primary.main',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              {showProfileEdit && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                  disabled={uploadingAvatar}
                  size="small"
                >
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleAvatarUpload(file);
                      }
                    }}
                  />
                  {uploadingAvatar ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PhotoCameraIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </Box>

            {/* Profile Info */}
            <Box sx={{ flexGrow: 1 }}>
              {showProfileEdit ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    multiline
                    rows={3}
                    size="small"
                    fullWidth
                    placeholder="Tell us about yourself and your art..."
                  />
                </Box>
              ) : (
                <>
                  <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {profileData.bio || 'No bio yet. Click edit to add one.'}
                  </Typography>
                </>
              )}

              {/* Stats */}
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, mt: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>
                    {albums.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Albums
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>
                    {albums.reduce((sum, album) => sum + album.photoCount, 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Photos
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {showProfileEdit ? (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    sx={{ flex: { xs: 1, sm: 'initial' } }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowProfileEdit(false)}
                    sx={{ flex: { xs: 1, sm: 'initial' } }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowProfileEdit(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Albums Section */}
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
          >
            <Typography variant="h5" component="h2" sx={{ color: 'text.primary' }}>
              My Albums
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateAlbum}>
              New Album
            </Button>
          </Box>

          {error && (
            <Box sx={{ mb: 3 }}>
              <ErrorMessage message={error} onRetry={() => clearError()} type="error" />
            </Box>
          )}

          {isLoading ? (
            <Loading message="Loading albums..." size="medium" />
          ) : albums.length === 0 ? (
            <Card>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 8,
                  textAlign: 'center',
                }}
              >
                <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                  No albums yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first album to start organizing your artwork
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateAlbum}>
                  Create Album
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AlbumList
              albums={albums}
              onEdit={handleEditAlbum}
              onDelete={deleteAlbum}
              onClick={handleAlbumClick}
              onReorder={reorderAlbums}
              enableReorder={true}
            />
          )}
        </Box>
      </Container>

      <AlbumDrawer
        open={showDrawer}
        album={editingAlbum}
        onSubmit={handleSubmitAlbum}
        onClose={handleCancelDrawer}
        isLoading={isLoading}
      />
    </>
  );
}
