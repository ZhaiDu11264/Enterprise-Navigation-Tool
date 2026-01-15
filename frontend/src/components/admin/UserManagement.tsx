import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';
import adminService from '../../services/adminService';
import UserModal from './UserModal';
import { ConfirmDialog } from '../navigation/ConfirmDialog';
import './UserManagement.css';

interface UserManagementProps {
  onStatsUpdate: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onStatsUpdate }) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      loading: 'Loading users...',
      title: 'User Management',
      create: 'Create New User',
      loadFailed: 'Failed to load users',
      deleteFailed: 'Failed to ban user',
      resetFailed: 'Failed to reset user configuration',
      syncFailed: 'Failed to sync user configuration',
      searchPlaceholder: 'Search users...',
      allRoles: 'All Roles',
      usersRole: 'Users',
      adminsRole: 'Administrators',
      username: 'Username',
      email: 'Email',
      role: 'Role',
      created: 'Created',
      lastLogin: 'Last Login',
      status: 'Status',
      actions: 'Actions',
      idLabel: 'ID:',
      roleUser: 'User',
      roleAdmin: 'Administrator',
      never: 'Never',
      active: 'Active',
      edit: 'Edit',
      reset: 'Reset',
      sync: 'Sync',
      delete: 'Ban',
      editTitle: 'Edit User',
      resetTitle: 'Reset to Default Configuration',
      syncTitle: 'Sync with Default Configuration',
      resetPassword: 'Reset Password',
      resetProfile: 'Reset Profile',
      deleteTitle: 'Ban User',
      noUsersFiltered: 'No users match the current filters.',
      noUsers: 'No users found.',
      deleteConfirmTitle: 'Ban User',
      deleteConfirmMessage: (name: string) => `Are you sure you want to ban user "${name}"? This action will disable their access.`,
      resetProfileTitle: 'Reset User Profile',
      resetProfileMessage: (name: string) => `Reset display name and avatar for "${name}"?`,
      passwordPrompt: 'Enter a new password (leave blank to auto-generate):',
      passwordTooShort: 'Password must be at least 6 characters.',
      passwordResetSuccess: 'Password reset successfully.',
      passwordResetCopied: (password: string) => `Temporary password: ${password}`,
      resetProfileSuccess: 'User profile reset successfully.',
      confirmDelete: 'Ban',
      cancel: 'Cancel'
    },
    zh: {
      loading: '\u6b63\u5728\u52a0\u8f7d\u7528\u6237...',
      title: '\u7528\u6237\u7ba1\u7406',
      create: '\u521b\u5efa\u7528\u6237',
      loadFailed: '\u52a0\u8f7d\u7528\u6237\u5931\u8d25',
      deleteFailed: '\u5c01\u7981\u7528\u6237\u5931\u8d25',
      resetFailed: '\u91cd\u7f6e\u914d\u7f6e\u5931\u8d25',
      syncFailed: '\u540c\u6b65\u914d\u7f6e\u5931\u8d25',
      searchPlaceholder: '\u641c\u7d22\u7528\u6237...',
      allRoles: '\u5168\u90e8\u89d2\u8272',
      usersRole: '\u7528\u6237',
      adminsRole: '\u7ba1\u7406\u5458',
      username: '\u7528\u6237\u540d',
      email: '\u90ae\u7bb1',
      role: '\u89d2\u8272',
      created: '\u521b\u5efa\u65f6\u95f4',
      lastLogin: '\u4e0a\u6b21\u767b\u5f55',
      status: '\u72b6\u6001',
      actions: '\u64cd\u4f5c',
      idLabel: 'ID:',
      roleUser: '\u7528\u6237',
      roleAdmin: '\u7ba1\u7406\u5458',
      never: '\u4ece\u672a',
      active: '\u6d3b\u8dc3',
      edit: '\u7f16\u8f91',
      reset: '\u91cd\u7f6e',
      sync: '\u540c\u6b65',
      delete: '\u5c01\u7981',
      editTitle: '\u7f16\u8f91\u7528\u6237',
      resetTitle: '\u91cd\u7f6e\u5230\u9ed8\u8ba4\u914d\u7f6e',
      syncTitle: '\u4e0e\u9ed8\u8ba4\u914d\u7f6e\u540c\u6b65',
      resetPassword: '\u91cd\u7f6e\u5bc6\u7801',
      resetProfile: '\u91cd\u7f6e\u4e2a\u4eba\u4fe1\u606f',
      deleteTitle: '\u5c01\u7981\u7528\u6237',
      noUsersFiltered: '\u6ca1\u6709\u5339\u914d\u5f53\u524d\u8fc7\u6ee4\u6761\u4ef6\u7684\u7528\u6237\u3002',
      noUsers: '\u6ca1\u6709\u7528\u6237\u3002',
      deleteConfirmTitle: '\u5c01\u7981\u7528\u6237',
      deleteConfirmMessage: (name: string) => `\u786e\u8ba4\u5c01\u7981\u7528\u6237\u201c${name}\u201d\uff1f\u5c06\u7981\u6b62\u8be5\u8d26\u53f7\u767b\u5f55\u3002`,
      resetProfileTitle: '\u91cd\u7f6e\u7528\u6237\u4e2a\u4eba\u4fe1\u606f',
      resetProfileMessage: (name: string) => `\u786e\u8ba4\u91cd\u7f6e\u201c${name}\u201d\u7684\u6635\u79f0\u548c\u5934\u50cf\uff1f`,
      passwordPrompt: '\u8f93\u5165\u65b0\u5bc6\u7801\uff08\u7559\u7a7a\u81ea\u52a8\u751f\u6210\uff09\uff1a',
      passwordTooShort: '\u5bc6\u7801\u81f3\u5c11 6 \u4f4d\u3002',
      passwordResetSuccess: '\u5bc6\u7801\u91cd\u7f6e\u6210\u529f\u3002',
      passwordResetCopied: (password: string) => `\u4e34\u65f6\u5bc6\u7801\uff1a${password}`,
      resetProfileSuccess: '\u4e2a\u4eba\u4fe1\u606f\u5df2\u91cd\u7f6e\u3002',
      confirmDelete: '\u5c01\u7981',
      cancel: '\u53d6\u6d88'
    }
  } as const;
  const t = translations[language];

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showResetProfileConfirm, setShowResetProfileConfirm] = useState(false);
  const [userToResetProfile, setUserToResetProfile] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(t.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.loadFailed]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminService.deleteUser(userToDelete.id);
      await loadUsers();
      onStatsUpdate();
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(t.deleteFailed);
    }
  };

  const handleUserSaved = async () => {
    await loadUsers();
    onStatsUpdate();
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleResetUser = async (user: User) => {
    try {
      await adminService.resetUserConfiguration(user.id);
    } catch (err) {
      console.error('Failed to reset user configuration:', err);
      setError(t.resetFailed);
    }
  };

  const handleSyncUser = async (user: User) => {
    try {
      await adminService.syncUserConfiguration(user.id);
    } catch (err) {
      console.error('Failed to sync user configuration:', err);
      setError(t.syncFailed);
    }
  };

  const handleResetPassword = async (user: User) => {
    const input = window.prompt(t.passwordPrompt);
    if (input === null) {
      return;
    }
    const trimmed = input.trim();
    if (trimmed && trimmed.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    try {
      const result = await adminService.resetUserPassword(user.id, trimmed || undefined);
      alert(result.temporaryPassword ? t.passwordResetCopied(result.temporaryPassword) : t.passwordResetSuccess);
    } catch (err) {
      console.error('Failed to reset password:', err);
      setError(t.resetFailed);
    }
  };

  const handleResetProfile = (user: User) => {
    setUserToResetProfile(user);
    setShowResetProfileConfirm(true);
  };

  const confirmResetProfile = async () => {
    if (!userToResetProfile) return;
    try {
      await adminService.resetUserProfile(userToResetProfile.id);
      await loadUsers();
      onStatsUpdate();
      setShowResetProfileConfirm(false);
      setUserToResetProfile(null);
      alert(t.resetProfileSuccess);
    } catch (err) {
      console.error('Failed to reset profile:', err);
      setError(t.resetFailed);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">{t.loading}</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h3>{t.title}</h3>
        <button className="create-user-button" onClick={handleCreateUser}>
          {t.create}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>?</button>
        </div>
      )}

      <div className="user-filters">
        <div className="search-filter">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="role-filter">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
            className="role-select"
          >
            <option value="all">{t.allRoles}</option>
            <option value="user">{t.usersRole}</option>
            <option value="admin">{t.adminsRole}</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t.username}</th>
              <th>{t.email}</th>
              <th>{t.role}</th>
              <th>{t.created}</th>
              <th>{t.lastLogin}</th>
              <th>{t.status}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="username-cell">
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    <span className="user-id">{t.idLabel} {user.id}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? t.roleAdmin : t.roleUser}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : t.never}
                </td>
                <td>
                  <span className="status-badge active">{t.active}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditUser(user)}
                      title={t.editTitle}
                    >
                      {t.edit}
                    </button>
                    <button
                      className="reset-button"
                      onClick={() => handleResetUser(user)}
                      title={t.resetTitle}
                    >
                      {t.reset}
                    </button>
                    <button
                      className="sync-button"
                      onClick={() => handleSyncUser(user)}
                      title={t.syncTitle}
                    >
                      {t.sync}
                    </button>
                    <button
                      className="reset-password-button"
                      onClick={() => handleResetPassword(user)}
                      title={t.resetPassword}
                    >
                      {t.resetPassword}
                    </button>
                    <button
                      className="reset-profile-button"
                      onClick={() => handleResetProfile(user)}
                      title={t.resetProfile}
                    >
                      {t.resetProfile}
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteUser(user)}
                      title={t.deleteTitle}
                    >
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            {searchTerm || roleFilter !== 'all'
              ? t.noUsersFiltered
              : t.noUsers}
          </div>
        )}
      </div>

      {showUserModal && (
        <UserModal
          user={editingUser}
          onSave={handleUserSaved}
          onCancel={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {showDeleteConfirm && userToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={t.deleteConfirmTitle}
          message={t.deleteConfirmMessage(userToDelete.username)}
          confirmText={t.confirmDelete}
          cancelText={t.cancel}
          onConfirm={confirmDeleteUser}
          onClose={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
          type="danger"
        />
      )}

      {showResetProfileConfirm && userToResetProfile && (
        <ConfirmDialog
          isOpen={showResetProfileConfirm}
          title={t.resetProfileTitle}
          message={t.resetProfileMessage(userToResetProfile.username)}
          confirmText={t.reset}
          cancelText={t.cancel}
          onConfirm={confirmResetProfile}
          onClose={() => {
            setShowResetProfileConfirm(false);
            setUserToResetProfile(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
