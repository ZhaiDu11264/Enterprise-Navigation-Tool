import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import feedbackService from '../../services/feedbackService';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTypes = [
  { value: 'feature', labelEn: 'Feature request', labelZh: '功能建议' },
  { value: 'bug', labelEn: 'Bug report', labelZh: '问题反馈' },
  { value: 'ui', labelEn: 'UI/UX', labelZh: '界面体验' },
  { value: 'data', labelEn: 'Data issue', labelZh: '数据问题' },
  { value: 'other', labelEn: 'Other', labelZh: '其他' }
] as const;

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { language } = useLanguage();
  const t = {
    en: {
      title: 'Send Feedback',
      type: 'Type',
      message: 'Your feedback',
      placeholder: 'Tell us what you need or what went wrong...',
      submit: 'Submit',
      cancel: 'Cancel',
      success: 'Thanks! Your feedback has been sent.',
      error: 'Failed to send feedback. Please try again.',
      hint: 'We read every message.'
    },
    zh: {
      title: '反馈给管理员',
      type: '类型',
      message: '反馈内容',
      placeholder: '写下你的建议或遇到的问题…',
      submit: '提交反馈',
      cancel: '取消',
      success: '已收到反馈，感谢你的建议！',
      error: '提交失败，请稍后重试。',
      hint: '每条反馈都会被认真查看。'
    }
  } as const;

  const copy = t[language];
  const modalRef = useRef<HTMLDivElement>(null);
  const [feedbackType, setFeedbackType] = useState<typeof feedbackTypes[number]['value']>('feature');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setError(null);
    setSuccess(null);
    setMessage('');
    setFeedbackType('feature');
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!message.trim() || loading) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await feedbackService.submitFeedback({
        type: feedbackType,
        message: message.trim()
      });
      setSuccess(copy.success);
      setMessage('');
    } catch (err) {
      console.warn('Feedback submit failed:', err);
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div className="feedback-modal-overlay">
      <div className="feedback-modal" ref={modalRef}>
        <div className="feedback-modal-header">
          <div>
            <h2>{copy.title}</h2>
            <p>{copy.hint}</p>
          </div>
          <button type="button" className="feedback-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="feedback-modal-body">
          <label className="feedback-label">
            {copy.type}
            <select
              value={feedbackType}
              onChange={(event) => setFeedbackType(event.target.value as any)}
            >
              {feedbackTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {language === 'zh' ? item.labelZh : item.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="feedback-label">
            {copy.message}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={copy.placeholder}
              rows={5}
            />
          </label>
          {success && <div className="feedback-success">{success}</div>}
          {error && <div className="feedback-error">{error}</div>}
        </div>
        <div className="feedback-modal-footer">
          <button type="button" className="feedback-btn secondary" onClick={onClose}>
            {copy.cancel}
          </button>
          <button
            type="button"
            className="feedback-btn primary"
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
          >
            {copy.submit}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
