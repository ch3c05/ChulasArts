/**
 * useImageZoom Hook
 * Handles zoom and pan state for the photo detail modal
 */

import { useState, useCallback } from 'react';

export function useImageZoom() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoomLevel > 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
      }
    },
    [zoomLevel, panPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && zoomLevel > 1) {
        setPanPosition({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart, zoomLevel]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return {
    zoomLevel,
    panPosition,
    isPanning,
    resetZoom,
    zoomIn,
    zoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
