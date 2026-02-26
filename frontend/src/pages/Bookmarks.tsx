/**
 * Bookmarks Page
 * Display user's bookmarked photos
 */

import { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { Header } from '../components/Layout/Header';
import { PhotoGrid } from '../components/Photo/PhotoGrid';
import { PhotoDetailModal } from '../components/Photo/PhotoDetailModal';
import { getBookmarkedPhotos } from '../services/socialService';
import { useSocialStore } from '../stores/socialStore';
import type { Photo } from '../../../shared/types/photo';

export default function Bookmarks() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [socialStatusReady, setSocialStatusReady] = useState(false);
  const [page] = useState(1);
  const { bookmarkedPhotos, loadSocialStatus } = useSocialStore();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSocialStatusReady(false);
      const result = await getBookmarkedPhotos(page, 24);
      setPhotos(result.photos);

      const photoIds = result.photos.map((photo: Photo) => photo._id);
      await loadSocialStatus(photoIds);
      setSocialStatusReady(true);

      // TODO: Implement pagination - hasMore available in result.pagination.hasMore
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseDetail = () => {
    setSelectedPhoto(null);
  };

  const handleNavigate = (photoId: string) => {
    const photo = photos.find((p) => p._id === photoId);
    if (photo) {
      setSelectedPhoto(photo);
    }
  };

  const handlePhotoDelete = (photoId: string) => {
    // Remove unbookmarked photo from list
    setPhotos((prev) => prev.filter((p) => p._id !== photoId));
    setSelectedPhoto(null);
  };

  useEffect(() => {
    if (!socialStatusReady || photos.length === 0) {
      return;
    }

    const nextPhotos = photos.filter((photo) => bookmarkedPhotos.has(photo._id));

    if (nextPhotos.length !== photos.length) {
      setPhotos(nextPhotos);

      if (selectedPhoto && !bookmarkedPhotos.has(selectedPhoto._id)) {
        setSelectedPhoto(null);
      }
    }
  }, [socialStatusReady, photos, bookmarkedPhotos, selectedPhoto]);

  if (isLoading) {
    return (
      <>
        <Header showSearch={false} showFilters={false} />
        <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header showSearch={false} showFilters={false} />
        <Container sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header showSearch={false} showFilters={false} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
            My Bookmarks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Photos you've saved for later
          </Typography>
        </Box>

        {photos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bookmarks yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Browse the gallery and bookmark photos you like
            </Typography>
          </Box>
        ) : (
          <PhotoGrid
            photos={photos}
            isOwner={false}
            isPublic={true}
            onPhotoClick={handlePhotoClick}
            onPhotoDelete={handlePhotoDelete}
          />
        )}

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <PhotoDetailModal
            photo={selectedPhoto}
            photos={photos}
            isOwner={false}
            isPublic={true}
            onClose={handleCloseDetail}
            onNavigate={handleNavigate}
          />
        )}
      </Container>
    </>
  );
}
