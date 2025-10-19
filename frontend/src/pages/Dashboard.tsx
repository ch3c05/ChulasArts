/**
 * Dashboard Page
 * Main dashboard showing user's albums
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlbumStore } from '../stores/albumStore';
import { useAuth } from '../hooks/useAuth';
import { AlbumList } from '../components/Album/AlbumList';
import { AlbumForm } from '../components/Album/AlbumForm';
import type { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../../../shared/types/album';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    albums,
    isLoading,
    error,
    fetchAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    reorderAlbums,
    clearError,
  } = useAlbumStore();

  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | undefined>();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch albums on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlbums();
    }
  }, [isAuthenticated, fetchAlbums]);

  const handleCreateAlbum = () => {
    setEditingAlbum(undefined);
    setShowForm(true);
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const handleSubmitForm = async (data: CreateAlbumRequest | UpdateAlbumRequest) => {
    if (editingAlbum) {
      await updateAlbum(editingAlbum._id, data as UpdateAlbumRequest);
    } else {
      await createAlbum(data as CreateAlbumRequest);
    }
    setShowForm(false);
    setEditingAlbum(undefined);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAlbum(undefined);
    clearError();
  };

  const handleAlbumClick = (album: Album) => {
    navigate(`/albums/${album._id}`);
  };

  if (authLoading || !isAuthenticated) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Albums</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={handleCreateAlbum}>
          + Create Album
        </button>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading albums...</div>
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

      {showForm && (
        <AlbumForm
          album={editingAlbum}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
