/**
 * Gallery Page
 * Public gallery of published photos from all users
 */

import { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { Header } from '../components/Layout/Header';
import { PhotoGrid } from '../components/Photo/PhotoGrid';
import { PhotoDetailModal } from '../components/Photo/PhotoDetailModal';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import type { Photo } from '../../../shared/types/photo';

interface PhotoWithUser extends Photo {
  username?: string;
}

interface Artist {
  _id: string;
  username: string;
}

interface Tag {
  tag: string;
  count: number;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<PhotoWithUser[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingPhoto, setViewingPhoto] = useState<PhotoWithUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch gallery photos
  const fetchPhotos = async (reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '24',
        sort: sortBy,
      });

      if (selectedArtist) {
        params.append('userId', selectedArtist);
      }

      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/gallery?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch photos');
      }

      setPhotos(reset ? data.data : [...photos, ...data.data]);
      setHasMore(data.pagination.hasMore);
      setPage(reset ? 2 : page + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch artists
  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/gallery/artists');
      const data = await response.json();
      if (response.ok) {
        setArtists(data.data);
      }
    } catch {
      // Silently ignore — artists filter is non-critical
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/gallery/tags');
      const data = await response.json();
      if (response.ok) {
        setTags(data.data);
      }
    } catch {
      // Silently ignore — tags filter is non-critical
    }
  };

  // Initial load
  useEffect(() => {
    fetchPhotos(true);
    fetchArtists();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filters change
  useEffect(() => {
    fetchPhotos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtist, selectedTags, sortBy, searchQuery]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPhotos();
    }
  };

  const handleClearFilters = () => {
    setSelectedArtist('');
    setSelectedTags([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedArtist || selectedTags.length > 0 || searchQuery;

  return (
    <>
      <Header
        onSearch={(query) => {
          setSearchQuery(query);
        }}
        onFiltersClick={() => setShowFilters(!showFilters)}
      />

      <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, py: { xs: 2, sm: 3 } }}>
        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: hasActiveFilters ? 2 : 0 }}>
              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  id="sort"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e: SelectChangeEvent) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                  <MenuItem value="views">Most Viewed</MenuItem>
                </Select>
              </FormControl>

              {/* Artist Filter */}
              {artists.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="artist-label">Artist</InputLabel>
                  <Select
                    labelId="artist-label"
                    id="artist"
                    value={selectedArtist}
                    label="Artist"
                    onChange={(e: SelectChangeEvent) => setSelectedArtist(e.target.value)}
                  >
                    <MenuItem value="">All Artists</MenuItem>
                    {artists.map((artist) => (
                      <MenuItem key={artist._id} value={artist._id}>
                        {artist.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  sx={{ ml: 'auto' }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            {/* Tags */}
            {tags.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, color: 'text.primary' }}>
                  Filter by Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tagData) => (
                    <Chip
                      key={tagData.tag}
                      label={`${tagData.tag} (${tagData.count})`}
                      onClick={() => handleTagToggle(tagData.tag)}
                      color={selectedTags.includes(tagData.tag) ? 'primary' : 'default'}
                      variant={selectedTags.includes(tagData.tag) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ mb: 3 }}>
            <ErrorMessage message={error} onRetry={() => fetchPhotos(true)} type="error" />
          </Box>
        )}

        {/* Photos */}
        {photos.length > 0 ? (
          <>
            <PhotoGrid
              photos={photos}
              isOwner={false}
              isPublic={true}
              onPhotoClick={(photo) => setViewingPhoto(photo)}
            />

            {/* Load More */}
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  size="large"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        ) : (
          !isLoading && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                No photos found. Try adjusting your filters.
              </Typography>
            </Box>
          )
        )}

        {/* Loading */}
        {isLoading && photos.length === 0 && (
          <Loading message="Loading gallery photos..." size="medium" />
        )}

        {/* Photo Detail Modal */}
        {viewingPhoto && (
          <PhotoDetailModal
            photo={viewingPhoto}
            photos={photos}
            isPublic={true}
            onClose={() => setViewingPhoto(null)}
            onNavigate={(photoId) => {
              const photo = photos.find((p) => p._id === photoId);
              if (photo) {
                setViewingPhoto(photo);
              }
            }}
          />
        )}
      </Box>
    </>
  );
}
