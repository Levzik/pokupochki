import { useState, useRef, useCallback } from 'react';

export function useDragReorder<T>(
  items: T[],
  onReorder: (newItems: T[]) => void
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  // Desktop HTML5 Drag & Drop handlers
  const handleDragStart = useCallback((index: number, e?: React.DragEvent) => {
    setDraggedIndex(index);
    isDraggingRef.current = true;
    if (e && e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  }, []);

  const handleDragOver = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((targetIndex: number, e?: React.DragEvent) => {
    if (e) e.preventDefault();
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      const updated = [...items];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, removed);
      onReorder(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    isDraggingRef.current = false;
  }, [draggedIndex, items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    isDraggingRef.current = false;
  }, []);

  // Mobile Touch & Swipe Drag handlers
  const handleTouchStart = useCallback((index: number) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
    isDraggingRef.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || draggedIndex === null) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = el?.closest('[data-drag-index]');
    if (dropTarget) {
      const idx = parseInt(dropTarget.getAttribute('data-drag-index') || '', 10);
      if (!isNaN(idx) && idx !== dragOverIndex) {
        setDragOverIndex(idx);
      }
    }
  }, [draggedIndex, dragOverIndex]);

  const handleTouchEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const updated = [...items];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, removed);
      onReorder(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    isDraggingRef.current = false;
  }, [draggedIndex, dragOverIndex, items, onReorder]);

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
