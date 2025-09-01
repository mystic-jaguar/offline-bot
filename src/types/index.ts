export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface TextChunk {
  content: string;
  score: number;
  index: number;
}

export interface KnowledgeBase {
  filename: string;
  content: string;
  uploadDate: Date;
  chunks: string[];
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  loginTime: Date;
  email?: string;
  createdAt: Date;
  createdBy?: string; // ID of admin who created the user
}

export interface RegisteredUser {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  createdBy?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  signup: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  addUser: (username: string, password: string, email: string, role: 'admin' | 'user') => Promise<{ success: boolean; message: string }>;
  getUsers: () => RegisteredUser[];
  deleteUser: (userId: string) => Promise<boolean>;
}
