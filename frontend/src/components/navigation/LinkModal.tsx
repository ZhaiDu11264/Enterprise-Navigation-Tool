import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink, Group, CreateLinkRequest, UpdateLinkRequest, FormErrors } from '../../types';
import { faviconService } from '../../services/faviconService';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useNotifications } from '../common/NotificationSystem';
import { LoadingButton } from '../common/LoadingSpinner';
import './LinkModal.css';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: CreateLinkRequest | UpdateLinkRequest) => Promise<void>;
  link?: WebsiteLink | null;
  groups: Group[];
  mode: 'create' | 'edit';
  defaultGroupId?: number | null;
}

export function LinkModal({ isOpen, onClose, onSave, link, groups, mode, defaultGroupId }: LinkModalProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      titleCreate: 'Add New Link',
      titleEdit: 'Edit Link',
      name: 'Name *',
      url: 'URL *',
      description: 'Description',
      group: 'Group *',
      icon: 'Icon',
      namePlaceholder: 'Enter link name',
      urlPlaceholder: 'https://example.com',
      descriptionPlaceholder: 'Optional description',
      groupPlaceholder: 'Select a group',
      iconPreview: 'Icon preview',
      autoExtract: 'Auto-extract',
      extracting: 'Extracting...',
      predefined: 'Predefined',
      upload: 'Upload',
      uploading: 'Uploading...',
      cancel: 'Cancel',
      addLink: 'Add Link',
      saveChanges: 'Save Changes',
      nameRequired: 'Name is required',
      urlRequired: 'URL is required',
      urlInvalid: 'Please enter a valid URL',
      groupRequired: 'Please select a group',
      faviconFailed: 'Failed to extract favicon automatically',
      uploadFailed: 'Failed to upload icon',
      invalidFile: 'Invalid file',
      saveFailed: 'Failed to save link. Please try again.',
      linkAdded: 'Link Added',
      linkUpdated: 'Link Updated',
      linkAddedMessage: (name: string) => `${name} has been added successfully`,
      linkUpdatedMessage: (name: string) => `${name} has been updated successfully`
    },
    zh: {
      titleCreate: '\u6dfb\u52a0\u94fe\u63a5',
      titleEdit: '\u7f16\u8f91\u94fe\u63a5',
      name: '\u540d\u79f0 *',
      url: 'URL *',
      description: '\u63cf\u8ff0',
      group: '\u5206\u7ec4 *',
      icon: '\u56fe\u6807',
      namePlaceholder: '\u8bf7\u8f93\u5165\u94fe\u63a5\u540d\u79f0',
      urlPlaceholder: 'https://example.com',
      descriptionPlaceholder: '\u9009\u586b\u63cf\u8ff0',
      groupPlaceholder: '\u8bf7\u9009\u62e9\u5206\u7ec4',
      iconPreview: '\u56fe\u6807\u9884\u89c8',
      autoExtract: '\u81ea\u52a8\u83b7\u53d6',
      extracting: '\u63d0\u53d6\u4e2d...',
      predefined: '\u9884\u7f6e',
      upload: '\u4e0a\u4f20',
      uploading: '\u4e0a\u4f20\u4e2d...',
      cancel: '\u53d6\u6d88',
      addLink: '\u6dfb\u52a0\u94fe\u63a5',
      saveChanges: '\u4fdd\u5b58\u4fee\u6539',
      nameRequired: '\u8bf7\u8f93\u5165\u540d\u79f0',
      urlRequired: '\u8bf7\u8f93\u5165URL',
      urlInvalid: '\u8bf7\u8f93\u5165\u6709\u6548\u7684URL',
      groupRequired: '\u8bf7\u9009\u62e9\u5206\u7ec4',
      faviconFailed: '\u81ea\u52a8\u83b7\u53d6\u56fe\u6807\u5931\u8d25',
      uploadFailed: '\u4e0a\u4f20\u56fe\u6807\u5931\u8d25',
      invalidFile: '\u6587\u4ef6\u65e0\u6548',
      saveFailed: '\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002',
      linkAdded: '\u94fe\u63a5\u5df2\u6dfb\u52a0',
      linkUpdated: '\u94fe\u63a5\u5df2\u66f4\u65b0',
      linkAddedMessage: (name: string) => `${name} \u5df2\u6dfb\u52a0`,
      linkUpdatedMessage: (name: string) => `${name} \u5df2\u66f4\u65b0`
    }
  } as const;
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    groupId: 0,
    iconUrl: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [extractingFavicon, setExtractingFavicon] = useState(false);
  const [showIconOptions, setShowIconOptions] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  
  const { handleAsyncError } = useErrorHandler();
  const { showSuccess } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize form data when modal opens or link changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && link) {
        setFormData({
          name: link.name,
          url: link.url,
          description: link.description || '',
          groupId: link.groupId,
          iconUrl: link.iconUrl || ''
        });
      } else {
        const defaultGroup = defaultGroupId
          ? groups.find(group => group.id === defaultGroupId)
          : undefined;
        setFormData({
          name: '',
          url: '',
          description: '',
          groupId: defaultGroup?.id ?? (groups.length > 0 ? groups[0].id : 0),
          iconUrl: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, link, groups, defaultGroupId]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!formData.url.trim()) {
      newErrors.url = t.urlRequired;
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = t.urlInvalid;
      }
    }

    if (formData.groupId === 0) {
      newErrors.groupId = t.groupRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'groupId' ? parseInt(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUrlBlur = async () => {
    if (formData.url && !formData.iconUrl && !extractingFavicon) {
      await extractFavicon();
    }
  };

  const extractFavicon = async () => {
    if (!formData.url) return;

    setExtractingFavicon(true);
    const result = await handleAsyncError(
      () => faviconService.extractFavicon(formData.url),
      { 
        showNotification: false, // We'll handle this manually
        customMessage: t.faviconFailed
      }
    );
    
    if (result) {
      setFormData(prev => ({ ...prev, iconUrl: result }));
    }
    setExtractingFavicon(false);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = faviconService.validateIconFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, iconUrl: validation.error || t.invalidFile }));
      return;
    }

    setUploadingIcon(true);
    const result = await handleAsyncError(
      () => faviconService.uploadIcon(file),
      { customMessage: t.uploadFailed }
    );
    
    if (result) {
      setFormData(prev => ({ ...prev, iconUrl: result }));
      setErrors(prev => ({ ...prev, iconUrl: '' }));
    } else {
      setErrors(prev => ({ ...prev, iconUrl: t.uploadFailed }));
    }
    setUploadingIcon(false);
  };

  const handlePredefinedIconSelect = (iconUrl: string) => {
    setFormData(prev => ({ ...prev, iconUrl }));
    setShowIconOptions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const linkData = {
      name: formData.name.trim(),
      url: formData.url.trim(),
      description: formData.description.trim() || undefined,
      groupId: formData.groupId,
      iconUrl: formData.iconUrl || undefined
    };

    const result = await handleAsyncError(
      () => onSave(linkData),
      { customMessage: t.saveFailed }
    );
    
    if (result !== null) {
      showSuccess(
        mode === 'create' ? t.linkAdded : t.linkUpdated,
        mode === 'create' ? t.linkAddedMessage(linkData.name) : t.linkUpdatedMessage(linkData.name)
      );
      onClose();
    } else {
      setErrors({ submit: t.saveFailed });
    }
    setLoading(false);
  };

  const predefinedIcons = faviconService.getPredefinedIcons();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{mode === 'create' ? t.titleCreate : t.titleEdit}</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">{t.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder={t.namePlaceholder}
              maxLength={200}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="url">{t.url}</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              onBlur={handleUrlBlur}
              className={errors.url ? 'error' : ''}
              placeholder={t.urlPlaceholder}
            />
            {errors.url && <span className="error-message">{errors.url}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">{t.description}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t.descriptionPlaceholder}
              rows={1}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="groupId">{t.group}</label>
            <select
              id="groupId"
              name="groupId"
              value={formData.groupId}
              onChange={handleInputChange}
              className={errors.groupId ? 'error' : ''}
            >
              <option value={0}>{t.groupPlaceholder}</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.groupId && <span className="error-message">{errors.groupId}</span>}
          </div>

          <div className="form-group">
            <label>{t.icon}</label>
            <div className="icon-section">
              <div className="icon-preview">
                {formData.iconUrl ? (
                  <img src={formData.iconUrl} alt={t.iconPreview} />
                ) : (
                  <div className="icon-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="icon-controls">
                <button
                  type="button"
                  onClick={extractFavicon}
                  disabled={!formData.url || extractingFavicon}
                  className="btn-secondary"
                >
                  {extractingFavicon ? t.extracting : t.autoExtract}
                </button>

                <button
                  type="button"
                  onClick={() => setShowIconOptions(!showIconOptions)}
                  className="btn-secondary"
                >
                  {t.predefined}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingIcon}
                  className="btn-secondary"
                >
                  {uploadingIcon ? t.uploading : t.upload}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {showIconOptions && (
                <div className="predefined-icons">
                  {predefinedIcons.map(icon => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handlePredefinedIconSelect(icon.url)}
                      className="predefined-icon"
                      title={icon.name}
                    >
                      <img src={icon.url} alt={icon.name} />
                    </button>
                  ))}
                </div>
              )}

              {errors.iconUrl && <span className="error-message">{errors.iconUrl}</span>}
            </div>
          </div>

          {errors.submit && (
            <div className="form-group">
              <span className="error-message">{errors.submit}</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.cancel}
            </button>
            <LoadingButton 
              type="submit" 
              loading={loading} 
              className="btn-primary"
            >
              {mode === 'create' ? t.addLink : t.saveChanges}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
