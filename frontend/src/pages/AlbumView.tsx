/**
 * Album View Page
 * Display album details and photos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlbumStore } from '../stores/albumStore';
import { usePhotoStore } from '../stores/photoStore';
import { useAuth } from '../hooks/useAuth';
import { PhotoUpload } from '../components/Photo/PhotoUpload';
import { PhotoGrid } from '../components/Photo/PhotoGrid';

export default function AlbumView() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentAlbum, isLoading, error, fetchAlbum, updateAlbum, deleteAlbum } = useAlbumStore();
  const { photos, fetchAlbumPhotos } = usePhotoStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublished, setEditPublished] = useState(false);

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
    return <div style={{ padding: '20px' }}>Loading album...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: '#c00' }}>Error: {error}</p>
        <button onClick={handleBack}>← Back to Dashboard</button>
      </div>
    );
  }

  if (!currentAlbum) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Album not found</p>
        <button onClick={handleBack}>← Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={handleBack}
          style={{
            marginBottom: '20px',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ← Back to Dashboard
        </button>

        {isEditing ? (
          <div>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '10px',
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
            <label style={{ display: 'block', marginBottom: '15px' }}>
              <input
                type="checkbox"
                checked={editPublished}
                onChange={(e) => setEditPublished(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Published
            </label>
            <div>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 16px',
                  marginRight: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{currentAlbum.title}</h1>
                {currentAlbum.description && (
                  <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                    {currentAlbum.description}
                  </p>
                )}
                <div style={{ color: '#999', fontSize: '14px' }}>
                  {currentAlbum.photoCount} photos •{' '}
                  {currentAlbum.published ? 'Published' : 'Draft'}
                </div>
              </div>

              {isOwner && (
                <div>
                  <button
                    onClick={handleEdit}
                    style={{
                      padding: '8px 16px',
                      marginRight: '10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Album
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete Album
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Upload Section (Owner only) */}
      {isOwner && albumId && (
        <PhotoUpload
          albumId={albumId}
          onUploadComplete={() => {
            fetchAlbum(albumId);
            fetchAlbumPhotos(albumId);
          }}
        />
      )}

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos}
        isOwner={!!isOwner}
        onPhotoClick={(photo) => {
          console.log('Photo clicked:', photo);
          // TODO: Open photo detail modal/page
        }}
        onPhotoDelete={() => {
          if (albumId) {
            fetchAlbum(albumId);
          }
        }}
      />
    </div>
  );
}
