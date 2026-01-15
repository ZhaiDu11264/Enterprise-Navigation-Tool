// Core data interfaces for the Enterprise Navigation Tool

export interface User {
  id: number;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt: Date | null;
  updatedAt?: Date | null;
  isActive: boolean;
}

export interface Group {
  id: number;
  userId: number;
  name: string;
  description?: string | undefined;
  sortOrder: number;
  isActive: boolean;
  isSystemGroup: boolean;
  isDeletable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteLink {
  id: number;
  userId: number;
  groupId: number;
  name: string;
  url: string;
  description?: string | undefined;
  iconUrl?: string | undefined;
  sortOrder: number;
  isFavorite: boolean;
  accessCount: number;
  lastAccessedAt: Date | null;
  isActive: boolean;
  isSystemLink: boolean;
  isDeletable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefaultConfiguration {
  id: number;
  name: string;
  description?: string | undefined;
  configData: ConfigurationData;
  version: number;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationData {
  groups: DefaultGroup[];
  links: DefaultLink[];
}

export interface DefaultGroup {
  name: string;
  description?: string | undefined;
  sortOrder: number;
  isSystemGroup?: boolean;
  isDeletable?: boolean;
}

export interface DefaultLink {
  name: string;
  url: string;
  description?: string | undefined;
  iconUrl?: string | undefined;
  groupName: string;
  sortOrder: number;
  isSystemLink?: boolean;
  isDeletable?: boolean;
}

// Request/Response interfaces
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface CreateLinkRequest {
  name: string;
  url: string;
  description?: string | undefined;
  iconUrl?: string | undefined;
  groupId: number;
  sortOrder?: number | undefined;
}

export interface CreateGroupRequest {
  name: string;
  description?: string | undefined;
  sortOrder?: number | undefined;
}

export interface LinkOrder {
  id: number;
  sortOrder: number;
  groupId?: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Database row interfaces (for raw database results)
export interface UserRow {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
  last_login_at: Date | null;
  updated_at?: Date | null;
  is_active: boolean;
}

export interface GroupRow {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  is_system_group: boolean;
  is_deletable: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WebsiteLinkRow {
  id: number;
  user_id: number;
  group_id: number;
  name: string;
  url: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_favorite: boolean;
  access_count: number;
  last_accessed_at: Date | null;
  is_active: boolean;
  is_system_link: boolean;
  is_deletable: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DefaultConfigurationRow {
  id: number;
  name: string;
  description: string | null;
  config_data: string | any; // Can be string or object depending on MySQL driver
  version: number;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at?: Date;
}
