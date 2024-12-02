export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  theme: 'light' | 'dark';
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface DealerRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export type RequestFormData = Omit<DealerRequest, 'id' | 'createdAt' | 'updatedAt'>;