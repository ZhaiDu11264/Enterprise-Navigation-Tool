import React, { useState, useEffect } from 'react';
import { DefaultConfiguration } from '../../types';
import adminService, { ConfigurationSummary } from '../../services/adminService';
import ConfigurationModal from './ConfigurationModal';
import PublishModal from './PublishModal';
import { ConfirmDialog } from '../navigation/ConfirmDialog';
import './ConfigurationManagement.css';

const ConfigurationManagement: React.FC = () => {
  const [configurations, setConfigurations] = useState<ConfigurationSummary[]>([]);
  const [activeConfig, setActiveConfig] = useState<DefaultConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DefaultConfiguration | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishingConfig, setPublishingConfig] = useState<ConfigurationSummary | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<ConfigurationSummary | null>(null);

  useEffect(() => {
    loadConfigurations();
    loadActiveConfiguration();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const configsData = await adminService.getAllConfigurations();
      setConfigurations(configsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load configurations:', err);
      setError('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveConfiguration = async () => {
    try {
      const activeConfigData = await adminService.getActiveConfiguration();
      setActiveConfig(activeConfigData);
    } catch (err: any) {
      console.error('Failed to load active configuration:', err);
      // Don't set error here as it's normal to not have an active config
    }
  };

  const handleCreateConfiguration = () => {
    setEditingConfig(null);
    setShowConfigModal(true);
  };

  const handleEditConfiguration = async (config: ConfigurationSummary) => {
    try {
      const fullConfig = await adminService.getConfiguration(config.id);
      setEditingConfig(fullConfig);
      setShowConfigModal(true);
    } catch (err: any) {
      console.error('Failed to load configuration details:', err);
      setError('Failed to load configuration details');
    }
  };

  const handleActivateConfiguration = async (config: ConfigurationSummary) => {
    try {
      await adminService.activateConfiguration(config.id);
      await loadConfigurations();
      await loadActiveConfiguration();
    } catch (err: any) {
      console.error('Failed to activate configuration:', err);
      setError('Failed to activate configuration');
    }
  };

  const handlePublishConfiguration = (config: ConfigurationSummary) => {
    setPublishingConfig(config);
    setShowPublishModal(true);
  };

  const handleDeleteConfiguration = (config: ConfigurationSummary) => {
    setConfigToDelete(config);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConfiguration = async () => {
    if (!configToDelete) return;

    try {
      await adminService.deleteConfiguration(configToDelete.id);
      await loadConfigurations();
      await loadActiveConfiguration();
      setShowDeleteConfirm(false);
      setConfigToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete configuration:', err);
      setError('Failed to delete configuration');
    }
  };

  const handleConfigurationSaved = async () => {
    await loadConfigurations();
    await loadActiveConfiguration();
    setShowConfigModal(false);
    setEditingConfig(null);
  };

  const handlePublishComplete = async () => {
    setShowPublishModal(false);
    setPublishingConfig(null);
  };

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
    return <div className="loading">Loading configurations...</div>;
  }

  return (
    <div className="configuration-management">
      <div className="configuration-management-header">
        <h3>Default Configuration Management</h3>
        <button className="create-config-button" onClick={handleCreateConfiguration}>
          Create New Configuration
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Active Configuration Info */}
      {activeConfig && (
        <div className="active-config-info">
          <h4>Active Configuration</h4>
          <div className="active-config-card">
            <div className="config-info">
              <div className="config-name">{activeConfig.name}</div>
              <div className="config-description">{activeConfig.description}</div>
              <div className="config-meta">
                Version {activeConfig.version} • {activeConfig.configData.groups.length} groups • {activeConfig.configData.links.length} links
              </div>
            </div>
            <div className="config-actions">
              <button
                className="publish-button"
                onClick={() => handlePublishConfiguration(configurations.find(c => c.id === activeConfig.id)!)}
              >
                Publish Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="configurations-list">
        <h4>All Configurations</h4>
        
        {configurations.length === 0 ? (
          <div className="no-configurations">
            No configurations found. Create your first configuration to get started.
          </div>
        ) : (
          <div className="configurations-grid">
            {configurations.map(config => (
              <div key={config.id} className={`config-card ${config.isActive ? 'active' : ''}`}>
                <div className="config-header">
                  <div className="config-title">
                    <span className="config-name">{config.name}</span>
                    {config.isActive && <span className="active-badge">Active</span>}
                  </div>
                  <div className="config-version">v{config.version}</div>
                </div>
                
                <div className="config-description">
                  {config.description || 'No description provided'}
                </div>
                
                <div className="config-stats">
                  <span>{config.groupCount} groups</span>
                  <span>{config.linkCount} links</span>
                </div>
                
                <div className="config-meta">
                  Created {formatDate(config.createdAt)}
                </div>
                
                <div className="config-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditConfiguration(config)}
                  >
                    Edit
                  </button>
                  
                  {!config.isActive && (
                    <button
                      className="activate-button"
                      onClick={() => handleActivateConfiguration(config)}
                    >
                      Activate
                    </button>
                  )}
                  
                  <button
                    className="publish-button"
                    onClick={() => handlePublishConfiguration(config)}
                  >
                    Publish
                  </button>
                  
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteConfiguration(config)}
                    disabled={config.isActive}
                    title={config.isActive ? 'Cannot delete active configuration' : 'Delete configuration'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <ConfigurationModal
          configuration={editingConfig}
          onSave={handleConfigurationSaved}
          onCancel={() => {
            setShowConfigModal(false);
            setEditingConfig(null);
          }}
        />
      )}

      {/* Publish Modal */}
      {showPublishModal && publishingConfig && (
        <PublishModal
          configuration={publishingConfig}
          onComplete={handlePublishComplete}
          onCancel={() => {
            setShowPublishModal(false);
            setPublishingConfig(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && configToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Configuration"
          message={`Are you sure you want to delete configuration "${configToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteConfiguration}
          onClose={() => {
            setShowDeleteConfirm(false);
            setConfigToDelete(null);
          }}
          type="danger"
        />
      )}
    </div>
  );
};

export default ConfigurationManagement;