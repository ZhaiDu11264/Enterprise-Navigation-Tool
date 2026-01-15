import React, { useState, useEffect } from 'react';
import { DefaultConfiguration, ConfigurationData } from '../../types';
import adminService from '../../services/adminService';
import './ConfigurationModal.css';

interface ConfigurationModalProps {
  configuration: DefaultConfiguration | null; // null for create, DefaultConfiguration for edit
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  description: string;
  configData: ConfigurationData;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ configuration, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    configData: {
      groups: [],
      links: []
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const isEditing = !!configuration;

  useEffect(() => {
    if (configuration) {
      setFormData({
        name: configuration.name,
        description: configuration.description,
        configData: configuration.configData
      });
    }
  }, [configuration]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Configuration name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Configuration name must not exceed 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
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
      if (isEditing && configuration) {
        await adminService.updateConfiguration(
          configuration.id,
          formData.name,
          formData.description,
          formData.configData
        );
      } else {
        await adminService.createConfiguration(
          formData.name,
          formData.description,
          formData.configData
        );
      }

      onSave();
    } catch (err: any) {
      console.error('Failed to save configuration:', err);
      setErrors({ general: err.message || 'Failed to save configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="config-modal-overlay">
      <div className="config-modal">
        <div className="config-modal-header">
          <h3>{isEditing ? 'Edit Configuration' : 'Create New Configuration'}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Configuration Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              disabled={loading}
              placeholder="Enter configuration name"
            />
            {errors.name && (
              <div className="field-error">{errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              disabled={loading}
              placeholder="Enter configuration description"
              rows={3}
            />
            {errors.description && (
              <div className="field-error">{errors.description}</div>
            )}
          </div>

          <div className="config-preview">
            <h4>Configuration Preview</h4>
            <div className="preview-stats">
              <span>{formData.configData.groups.length} groups</span>
              <span>{formData.configData.links.length} links</span>
            </div>
            
            {/* Simple preview - in a real implementation, this would show the actual groups and links */}
            <div className="preview-note">
              <p>Configuration data structure is preserved from the original configuration.</p>
              <p>To modify the actual groups and links, use the main navigation interface and then create a new configuration from a user's setup.</p>
            </div>
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
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Configuration' : 'Create Configuration')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationModal;