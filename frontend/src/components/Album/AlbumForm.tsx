/**
 * AlbumForm Component
 * Modal form for creating/editing albums
 */

import { useState, FormEvent } from 'react';
import { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../../../../shared/types/album';

interface AlbumFormProps {
  album?: Album;
  onSubmit: (data: CreateAlbumRequest | UpdateAlbumRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AlbumForm({ album, onSubmit, onCancel, isLoading }: AlbumFormProps) {
  const [title, setTitle] = useState(album?.title || '');
  const [description, setDescription] = useState(album?.description || '');
  const [published, setPublished] = useState(album?.published || false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        published,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save album');
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{album ? 'Edit Album' : 'Create Album'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              Published (visible to public)
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : album ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
