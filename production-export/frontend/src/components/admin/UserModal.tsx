import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, CreateUserRequest } from '../../types';
import adminService from '../../services/adminService';
import './UserModal.css';

interface UserModalProps {
  user: User | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  general?: string;
}

const UserModal: React.FC<UserModalProps> = ({ user, onSave, onCancel }) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      titleEdit: 'Edit User',
      titleCreate: 'Create New User',
      username: 'Username *',
      email: 'Email *',
      password: 'Password',
      passwordRequired: 'Password *',
      passwordHint: '(leave blank to keep current)',
      role: 'Role *',
      usernamePlaceholder: 'Enter username',
      emailPlaceholder: 'Enter email address',
      passwordPlaceholderCreate: 'Enter password',
      passwordPlaceholderEdit: 'Enter new password',
      roleUser: 'User',
      roleAdmin: 'Administrator',
      cancel: 'Cancel',
      save: 'Update User',
      create: 'Create User',
      saving: 'Saving...',
      usernameRequired: 'Username is required',
      usernameMin: 'Username must be at least 3 characters',
      usernameMax: 'Username must not exceed 50 characters',
      usernameFormat: 'Username can only contain letters, numbers, underscores, and hyphens',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      passwordRequiredError: 'Password is required',
      passwordMin: 'Password must be at least 6 characters',
      usernameExists: 'Username already exists',
      emailExists: 'Email already exists',
      saveFailed: 'Failed to save user'
    },
    zh: {
      titleEdit: '\u7f16\u8f91\u7528\u6237',
      titleCreate: '\u521b\u5efa\u7528\u6237',
      username: '\u7528\u6237\u540d *',
      email: '\u90ae\u7bb1 *',
      password: '\u5bc6\u7801',
      passwordRequired: '\u5bc6\u7801 *',
      passwordHint: '\uff08\u7559\u7a7a\u4fdd\u7559\u5f53\u524d\u5bc6\u7801\uff09',
      role: '\u89d2\u8272 *',
      usernamePlaceholder: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
      emailPlaceholder: '\u8bf7\u8f93\u5165\u90ae\u7bb1',
      passwordPlaceholderCreate: '\u8bf7\u8f93\u5165\u5bc6\u7801',
      passwordPlaceholderEdit: '\u8bf7\u8f93\u5165\u65b0\u5bc6\u7801',
      roleUser: '\u7528\u6237',
      roleAdmin: '\u7ba1\u7406\u5458',
      cancel: '\u53d6\u6d88',
      save: '\u66f4\u65b0\u7528\u6237',
      create: '\u521b\u5efa\u7528\u6237',
      saving: '\u4fdd\u5b58\u4e2d...',
      usernameRequired: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
      usernameMin: '\u7528\u6237\u540d\u81f3\u5c11 3 \u4e2a\u5b57',
      usernameMax: '\u7528\u6237\u540d\u4e0d\u80fd\u8d85\u8fc750\u4e2a\u5b57',
      usernameFormat: '\u7528\u6237\u540d\u53ea\u80fd\u5305\u542b\u5b57\u6bcd\u3001\u6570\u5b57\u3001\u4e0b\u5212\u7ebf\u6216\u8fde\u5b57\u7b26',
      emailRequired: '\u8bf7\u8f93\u5165\u90ae\u7bb1',
      emailInvalid: '\u90ae\u7bb1\u683c\u5f0f\u4e0d\u6b63\u786e',
      passwordRequiredError: '\u8bf7\u8f93\u5165\u5bc6\u7801',
      passwordMin: '\u5bc6\u7801\u81f3\u5c11 6 \u4f4d',
      usernameExists: '\u7528\u6237\u540d\u5df2\u5b58\u5728',
      emailExists: '\u90ae\u7bb1\u5df2\u5b58\u5728',
      saveFailed: '\u4fdd\u5b58\u7528\u6237\u5931\u8d25'
    }
  } as const;
  const t = translations[language];

  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = t.usernameRequired;
    } else if (formData.username.length < 3) {
      newErrors.username = t.usernameMin;
    } else if (formData.username.length > 50) {
      newErrors.username = t.usernameMax;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = t.usernameFormat;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = t.passwordRequiredError;
      } else if (formData.password.length < 6) {
        newErrors.password = t.passwordMin;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isEditing && user) {
        const updates: Partial<User> = {
          username: formData.username,
          email: formData.email,
          role: formData.role
        };

        await adminService.updateUser(user.id, updates);
      } else {
        const createRequest: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

        await adminService.createUser(createRequest);
      }

      onSave();
    } catch (err: any) {
      console.error('Failed to save user:', err);

      if (err.response?.data?.error?.code === 'USERNAME_EXISTS') {
        setErrors({ username: t.usernameExists });
      } else if (err.response?.data?.error?.code === 'EMAIL_EXISTS') {
        setErrors({ email: t.emailExists });
      } else if (err.response?.data?.error?.details) {
        const serverErrors: FormErrors = {};
        err.response.data.error.details.forEach((detail: any) => {
          if (detail.path) {
            serverErrors[detail.path as keyof FormErrors] = detail.msg;
          }
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: err.message || t.saveFailed });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="user-modal-overlay">
      <div className="user-modal">
        <div className="user-modal-header">
          <h3>{isEditing ? t.titleEdit : t.titleCreate}</h3>
          <button className="close-button" onClick={onCancel}>{'\u00d7'}</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">{t.username}</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={errors.username ? 'error' : ''}
              disabled={loading}
              placeholder={t.usernamePlaceholder}
            />
            {errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">{t.email}</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              disabled={loading}
              placeholder={t.emailPlaceholder}
            />
            {errors.email && (
              <div className="field-error">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {isEditing ? `${t.password} ${t.passwordHint}` : t.passwordRequired}
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'error' : ''}
              disabled={loading}
              placeholder={isEditing ? t.passwordPlaceholderEdit : t.passwordPlaceholderCreate}
            />
            {errors.password && (
              <div className="field-error">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role">{t.role}</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as 'user' | 'admin')}
              disabled={loading}
            >
              <option value="user">{t.roleUser}</option>
              <option value="admin">{t.roleAdmin}</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? t.saving : (isEditing ? t.save : t.create)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
