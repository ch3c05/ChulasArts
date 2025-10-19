/**
 * Album View Page
 * Display album details and photos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlbumStore } from '../stores/albumStore';
import { useAuth } from '../hooks/useAuth';

export default function AlbumView() {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentAlbum, isLoading, error, fetchAlbum, updateAlbum, deleteAlbum } = useAlbumStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPublished, setEditPublished] = useState(false);

  useEffect(() => {
    if (albumId) {
      fetchAlbum(albumId);
    }
  }, [albumId, fetchAlbum]);

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
      {isOwner && (
        <div
          style={{
            padding: '40px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '30px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
            📸 Photo Upload Coming Soon
          </p>
          <p style={{ color: '#999' }}>
            Upload photos by dragging & dropping or clicking to browse
          </p>
        </div>
      )}

      {/* Photo Grid */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Photos</h2>

        {currentAlbum.photoCount === 0 ? (
          <div
            style={{
              padding: '60px',
              textAlign: 'center',
              color: '#999',
              border: '1px solid #eee',
              borderRadius: '8px',
            }}
          >
            <p style={{ fontSize: '18px' }}>No photos in this album yet</p>
            {isOwner && <p>Upload your first photo to get started</p>}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Placeholder photo cards */}
            {Array.from({ length: currentAlbum.photoCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                Photo {i + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
