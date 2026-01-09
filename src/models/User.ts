import { executeQuery } from '../config/database';
import { User, UserRow, CreateUserRequest, AuthResult } from './interfaces';
import bcrypt from 'bcrypt';

// Convert database row to User interface
const mapUserRowToUser = (row: UserRow): User => ({
  id: row.id,
  username: row.username,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  createdAt: row.created_at,
  lastLoginAt: row.last_login_at,
  isActive: row.is_active
});

export class UserService {
  // Create a new user
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await executeQuery<{ insertId: number }>(query, [
      userData.username,
      userData.email,
      passwordHash,
      userData.role || 'user'
    ]);
    
    // Get the created user
    const createdUser = await this.getUserById((result as any).insertId);
    if (!createdUser) {
      throw new Error('Failed to create user');
    }
    
    return createdUser;
  }

  // Authenticate user with username/email and password
  static async authenticate(usernameOrEmail: string, password: string): Promise<AuthResult> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE (username = ? OR email = ?) AND is_active = true
      `;
      
      const results = await executeQuery<UserRow>(query, [usernameOrEmail, usernameOrEmail]);
      
      if (results.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      const userRow = results[0];
      if (!userRow) {
        return { success: false, message: 'User not found' };
      }
      
      const isValidPassword = await bcrypt.compare(password, userRow.password_hash);
      
      if (!isValidPassword) {
        return { success: false, message: 'Invalid password' };
      }
      
      // Update last login time
      await this.updateLastLogin(userRow.id);
      
      const user = mapUserRowToUser(userRow);
      return { success: true, user };
      
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  // Get user by ID
  static async getUserById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ? AND is_active = true';
    const results = await executeQuery<UserRow>(query, [id]);
    
    if (results.length === 0) {
      return null;
    }
    
    const userRow = results[0];
    if (!userRow) {
      return null;
    }
    
    return mapUserRowToUser(userRow);
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = ? AND is_active = true';
    const results = await executeQuery<UserRow>(query, [username]);
    
    if (results.length === 0) {
      return null;
    }
    
    const userRow = results[0];
    if (!userRow) {
      return null;
    }
    
    return mapUserRowToUser(userRow);
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ? AND is_active = true';
    const results = await executeQuery<UserRow>(query, [email]);
    
    if (results.length === 0) {
      return null;
    }
    
    const userRow = results[0];
    if (!userRow) {
      return null;
    }
    
    return mapUserRowToUser(userRow);
  }

  // Update user information
  static async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const allowedFields = ['username', 'email', 'role', 'isActive'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'isActive') {
          updateFields.push('is_active = ?');
        } else {
          updateFields.push(`${key} = ?`);
        }
        updateValues.push(value);
      }
    });
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    updateValues.push(id);
    
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(query, updateValues);
    
    const updatedUser = await this.getUserById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    
    return updatedUser;
  }

  // Update password
  static async updatePassword(id: number, newPassword: string): Promise<void> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await executeQuery(query, [passwordHash, id]);
  }

  // Update last login time
  static async updateLastLogin(id: number): Promise<void> {
    const query = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC';
    const results = await executeQuery<UserRow>(query);
    
    return results.map(mapUserRowToUser);
  }

  // Get first active admin user ID
  static async getFirstAdminUserId(): Promise<number | null> {
    const query = 'SELECT id FROM users WHERE role = "admin" AND is_active = true ORDER BY id ASC LIMIT 1';
    const results = await executeQuery<{ id: number }>(query);
    const row = results[0];
    if (!row) {
      return null;
    }
    return row.id;
  }

  // Soft delete user
  static async deleteUser(id: number): Promise<void> {
    const query = 'UPDATE users SET is_active = false WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Check if username exists
  static async usernameExists(username: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
    const results = await executeQuery<{ count: number }>(query, [username]);
    const countRow = results[0];
    if (!countRow) {
      return false;
    }
    return countRow.count > 0;
  }

  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const results = await executeQuery<{ count: number }>(query, [email]);
    const countRow = results[0];
    if (!countRow) {
      return false;
    }
    return countRow.count > 0;
  }
}
