import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import adminService, { ConfigurationSummary, PublishConfigRequest, PublishResult } from '../../services/adminService';
import './PublishModal.css';

interface PublishModalProps {
  configuration: ConfigurationSummary;
  onComplete: () => void;
  onCancel: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ configuration, onComplete, onCancel }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [strategy, setStrategy] = useState<'reset' | 'merge'>('merge');
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await adminService.getAllUsers();
      // Filter out inactive users
      const activeUsers = usersData.filter(user => user.id !== undefined);
      setUsers(activeUsers);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllToggle = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    setSelectAll(selectedUsers.length === users.length && users.length > 0);
  }, [selectedUsers, users]);

  const handlePublish = async () => {
    setLoading(true);
    setError(null);

    try {
      const request: PublishConfigRequest = {
        configId: configuration.id,
        strategy,
        userIds: selectedUsers.length > 0 ? selectedUsers : undefined,
        notifyUsers
      };

      const result = await adminService.publishConfiguration(request);
      setPublishResult(result);
    } catch (err: any) {
      console.error('Failed to publish configuration:', err);
      setError(err.message || 'Failed to publish configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onComplete();
  };

  if (loadingUsers) {
    return (
      <div className="publish-modal-overlay">
        <div className="publish-modal">
          <div className="loading">Loading users...</div>
        </div>
      </div>
    );
  }

  if (publishResult) {
    return (
      <div className="publish-modal-overlay">
        <div className="publish-modal">
          <div className="publish-modal-header">
            <h3>Publish Results</h3>
            <button className="close-button" onClick={handleClose}>×</button>
          </div>

          <div className="publish-results">
            <div className="results-summary">
              <h4>Configuration "{configuration.name}" Published</h4>
              <div className="results-stats">
                <div className="stat success">
                  <span className="stat-value">{publishResult.successCount}</span>
                  <span className="stat-label">Successful</span>
                </div>
                <div className="stat failure">
                  <span className="stat-value">{publishResult.failureCount}</span>
                  <span className="stat-label">Failed</span>
                </div>
                <div className="stat total">
                  <span className="stat-value">{publishResult.totalUsers}</span>
                  <span className="stat-label">Total Users</span>
                </div>
              </div>
            </div>

            {publishResult.results.length > 0 && (
              <div className="results-details">
                <h5>Detailed Results</h5>
                <div className="results-list">
                  {publishResult.results.map((result, index) => (
                    <div key={index} className={`result-item ${result.success ? 'success' : 'failure'}`}>
                      <span className="username">{result.username}</span>
                      <span className={`status ${result.success ? 'success' : 'failure'}`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                      {result.error && (
                        <span className="error-detail">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="results-actions">
              <button className="close-button-primary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-modal-overlay">
      <div className="publish-modal">
        <div className="publish-modal-header">
          <h3>Publish Configuration</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <div className="publish-form">
          <div className="config-info">
            <h4>Configuration: {configuration.name}</h4>
            <p>{configuration.description || 'No description provided'}</p>
            <div className="config-stats">
              <span>{configuration.groupCount} groups</span>
              <span>{configuration.linkCount} links</span>
              <span>Version {configuration.version}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h5>Publish Strategy</h5>
            <div className="strategy-options">
              <label className="radio-option">
                <input
                  type="radio"
                  value="merge"
                  checked={strategy === 'merge'}
                  onChange={(e) => setStrategy(e.target.value as 'merge')}
                />
                <div className="radio-content">
                  <span className="radio-title">Merge (Recommended)</span>
                  <span className="radio-description">
                    Add new items from the configuration while preserving users' existing customizations
                  </span>
                </div>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  value="reset"
                  checked={strategy === 'reset'}
                  onChange={(e) => setStrategy(e.target.value as 'reset')}
                />
                <div className="radio-content">
                  <span className="radio-title">Reset</span>
                  <span className="radio-description">
                    Replace users' configurations entirely with this configuration
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h5>Target Users</h5>
            <div className="user-selection">
              <label className="select-all-option">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllToggle}
                />
                <span>
                  {selectAll ? 'Deselect All' : 'Select All'} 
                  ({selectedUsers.length === 0 ? 'All active users' : `${selectedUsers.length} selected`})
                </span>
              </label>

              <div className="users-list">
                {users.map(user => (
                  <label key={user.id} className="user-option">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                    />
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="user-email">{user.email}</span>
                      <span className={`user-role ${user.role}`}>{user.role}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={notifyUsers}
                onChange={(e) => setNotifyUsers(e.target.checked)}
              />
              <span>Notify users about configuration changes</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="publish-button"
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;