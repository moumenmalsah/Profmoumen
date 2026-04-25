export type ContentCategory = 'course' | 'exercise' | 'video' | 'tool';
export type ContentType = 'pdf' | 'youtube' | 'h5p';

export interface Content {
  id: string;
  title: string;
  description?: string;
  category: ContentCategory;
  type: ContentType;
  url: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface ContentFormData {
  title: string;
  description: string;
  category: ContentCategory;
  type: ContentType;
  url: string;
}
