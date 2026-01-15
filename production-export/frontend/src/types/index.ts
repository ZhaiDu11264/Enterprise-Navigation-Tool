// User types
export interface User {
  id: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export type FeedbackType = 'bug' | 'feature' | 'ui' | 'data' | 'other';
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface FeedbackEntry {
  id: number;
  userId: number;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface FeedbackListItem extends FeedbackEntry {
  username: string;
  displayName?: string | null;
  email: string;
}

// Website Link types
export interface WebsiteLink {
  id: number;
  userId: number;
  name: string;
  url: string;
  description?: string;
  iconUrl?: string;
  groupId: number;
  sortOrder: number;
  isActive: boolean;
  isFavorite: boolean;
  accessCount: number;
  lastAccessedAt?: string;
  isSystemLink: boolean;
  isDeletable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkRequest {
  name: string;
  url: string;
  description?: string;
  groupId: number;
  iconUrl?: string;
}

export interface UpdateLinkRequest extends Partial<CreateLinkRequest> {
  isFavorite?: boolean;
}

export interface LinkOrder {
  id: number;
  sortOrder: number;
  groupId?: number;
}

// Group types
export interface Group {
  id: number;
  userId: number;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  isSystemGroup: boolean;
  isDeletable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {}

// Default Configuration types
export interface DefaultConfiguration {
  id: number;
  name: string;
  description: string;
  configData: ConfigurationData;
  version: number;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
}

export interface ConfigurationData {
  groups: DefaultGroup[];
  links: DefaultLink[];
}

export interface DefaultGroup {
  name: string;
  description?: string;
  sortOrder: number;
  isSystemGroup?: boolean;
  isDeletable?: boolean;
}

export interface DefaultLink {
  name: string;
  url: string;
  description?: string;
  groupName: string;
  sortOrder: number;
  isSystemLink?: boolean;
  isDeletable?: boolean;
}

// Search types
export interface SearchResult {
  links: WebsiteLink[];
  totalCount: number;
}

// UI State types
export interface AppState {
  user: User | null;
  groups: Group[];
  links: WebsiteLink[];
  searchResults: WebsiteLink[];
  recentLinks: WebsiteLink[];
  favorites: WebsiteLink[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  activeGroupId: number | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  draggedItem: DraggedItem | null;
  showAdminPanel: boolean;
}

export interface DraggedItem {
  type: 'link' | 'group';
  id: number;
  sourceIndex: number;
}

// Import/Export types
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ExportData {
  groups: Group[];
  links: WebsiteLink[];
  exportedAt: string;
}

// Admin types
export interface SystemStats {
  totalUsers: number;
  totalLinks: number;
  totalGroups: number;
  activeUsers: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}
