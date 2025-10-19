/**
 * PhotoUpload Component
 * Drag-and-drop photo upload with previews and progress
 */

import React, { useState, useRef } from 'react';
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
      console.error('Upload error:', err);
    }
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#007bff' : '#ccc'}`,
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
        <p style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 500 }}>
          Drag & drop photos here
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          or click to browse (JPEG, PNG, WebP, GIF, TIFF)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px 15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <h3 style={{ margin: 0 }}>
              {previews.length} photo{previews.length !== 1 ? 's' : ''} ready to upload
            </h3>
            <div>
              <button
                onClick={() => {
                  previews.forEach((p) => URL.revokeObjectURL(p.url));
                  setPreviews([]);
                }}
                style={{
                  padding: '8px 16px',
                  marginRight: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
                disabled={isLoading}
              >
                Clear All
              </button>
              <button
                onClick={handleUpload}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '15px',
            }}
          >
            {previews.map((preview, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #ddd',
                }}
              >
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {!isLoading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(index);
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                )}
                {/* Progress bar */}
                {uploadProgress[preview.file.name] !== undefined && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress[preview.file.name]}%`,
                        backgroundColor: '#28a745',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
