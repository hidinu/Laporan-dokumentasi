import { PhotoItem, DocumentPage } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptyPhoto(slotIndex: number): PhotoItem {
  return {
    id: generateId(),
    url: null,
    title: '',
    description: '',
    timestamp: '',
    rotation: 0,
    objectFit: 'cover'
  };
}

export function createEmptyPage(): DocumentPage {
  return {
    id: generateId(),
    photos: [
      createEmptyPhoto(0),
      createEmptyPhoto(1),
      createEmptyPhoto(2),
      createEmptyPhoto(3)
    ]
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}
