import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Group, CreateGroupRequest, UpdateGroupRequest, FormErrors } from '../../types';
import './GroupModal.css';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: CreateGroupRequest | UpdateGroupRequest) => Promise<void>;
  group?: Group | null;
  mode: 'create' | 'edit';
  existingGroups: Group[];
}

export function GroupModal({ 
  isOpen, 
  onClose, 
  onSave, 
  group, 
  mode, 
  existingGroups 
}: GroupModalProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      titleCreate: 'Create New Group',
      titleEdit: 'Edit Group',
      nameLabel: 'Group Name *',
      descriptionLabel: 'Description',
      namePlaceholder: 'Enter group name',
      descriptionPlaceholder: 'Optional description for this group',
      hintName: 'Choose a descriptive name for organizing your links',
      hintCount: (count: number) => `${count}/500 characters`,
      cancel: 'Cancel',
      saving: 'Saving...',
      create: 'Create Group',
      saveChanges: 'Save Changes',
      nameRequired: 'Group name is required',
      nameMin: 'Group name must be at least 2 characters',
      nameMax: 'Group name must be less than 100 characters',
      nameDuplicate: 'A group with this name already exists',
      descMax: 'Description must be less than 500 characters',
      saveFailed: 'Failed to save group. Please try again.'
    },
    zh: {
      titleCreate: '\u521b\u5efa\u5206\u7ec4',
      titleEdit: '\u7f16\u8f91\u5206\u7ec4',
      nameLabel: '\u5206\u7ec4\u540d\u79f0 *',
      descriptionLabel: '\u63cf\u8ff0',
      namePlaceholder: '\u8bf7\u8f93\u5165\u5206\u7ec4\u540d\u79f0',
      descriptionPlaceholder: '\u8be5\u5206\u7ec4\u7684\u9009\u586b\u63cf\u8ff0',
      hintName: '\u9009\u62e9\u4e00\u4e2a\u5bb9\u6613\u8bc6\u522b\u7684\u5206\u7ec4\u540d\u79f0',
      hintCount: (count: number) => `${count}/500 \u5b57`,
      cancel: '\u53d6\u6d88',
      saving: '\u4fdd\u5b58\u4e2d...',
      create: '\u521b\u5efa\u5206\u7ec4',
      saveChanges: '\u4fdd\u5b58\u4fee\u6539',
      nameRequired: '\u8bf7\u8f93\u5165\u5206\u7ec4\u540d\u79f0',
      nameMin: '\u5206\u7ec4\u540d\u79f0\u81f3\u5c11\u4e24\u4e2a\u5b57',
      nameMax: '\u5206\u7ec4\u540d\u79f0\u4e0d\u80fd\u8d85\u8fc7100\u4e2a\u5b57',
      nameDuplicate: '\u5206\u7ec4\u540d\u79f0\u5df2\u5b58\u5728',
      descMax: '\u63cf\u8ff0\u4e0d\u80fd\u8d85\u8fc7500\u4e2a\u5b57',
      saveFailed: '\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002'
    }
  } as const;
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when modal opens or group changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && group) {
        setFormData({
          name: group.name,
          description: group.description || ''
        });
      } else {
        setFormData({
          name: '',
          description: ''
        });
      }
      setErrors({});
      
      // Focus name input after modal opens
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mode, group]);

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t.nameMin;
    } else if (formData.name.trim().length > 100) {
      newErrors.name = t.nameMax;
    } else {
      // Check for duplicate names (excluding current group in edit mode)
      const trimmedName = formData.name.trim().toLowerCase();
      const isDuplicate = existingGroups.some(existingGroup => 
        existingGroup.name.toLowerCase() === trimmedName && 
        (mode === 'create' || existingGroup.id !== group?.id)
      );
      
      if (isDuplicate) {
        newErrors.name = t.nameDuplicate;
      }
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t.descMax;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const groupData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };

      await onSave(groupData);
      onClose();
    } catch (error) {
      setErrors({ submit: t.saveFailed });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="group-modal-content" ref={modalRef}>
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
            <label htmlFor="name">{t.nameLabel}</label>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder={t.namePlaceholder}
              maxLength={100}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
            <div className="field-hint">
              {t.hintName}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t.descriptionLabel}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder={t.descriptionPlaceholder}
              rows={3}
              maxLength={500}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
            <div className="field-hint">
              {t.hintCount(formData.description.length)}
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
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? t.saving : (mode === 'create' ? t.create : t.saveChanges)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
