export interface ArtworkItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string; // Main/thumbnail image
  additionalImages?: string[]; // Additional images for the artwork
  createdAt?: number;
  dimensions?: string; // Optional: size/dimensions of the artwork
  technique?: string; // Optional: technique used
  year?: number; // Optional: year created
} 