export interface PhotoItem {
  id: string;
  url: string | null;
  fileName?: string;
  title: string;
  description: string;
  timestamp: string;
  rotation: number; // 0, 90, 180, 270 degrees
  objectFit: 'cover' | 'contain';
}

export interface ProjectMetadata {
  projectName: string;
  subtitle: string;
  date: string;
  location: string;
  inspector: string;
  refNumber: string;
  showHeaderOnAllPages: boolean;
  companyName: string;
  logoUrl?: string;
}

export interface DocumentPage {
  id: string;
  photos: [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
}
