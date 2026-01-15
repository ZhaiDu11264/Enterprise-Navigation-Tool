import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LoginRequest, FormErrors } from '../../types';
import { LoadingButton } from '../common/LoadingSpinner';
import './LoginForm.css';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const translations = {
    en: {
      title: 'Sign In',
      subtitle: 'Enter your credentials to access the navigation tool',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      submit: 'Sign In',
      footerPrefix: 'New here?',
      footerLink: 'Create an account',
      errors: {
        usernameRequired: 'Username is required',
        passwordRequired: 'Password is required',
        passwordLength: 'Password must be at least 6 characters'
      }
    },
    zh: {
      title: '\u767b\u5f55',
      subtitle: '\u8bf7\u8f93\u5165\u8d26\u53f7\u4fe1\u606f\u4ee5\u8fdb\u5165\u7cfb\u7edf',
      username: '\u7528\u6237\u540d',
      password: '\u5bc6\u7801',
      usernamePlaceholder: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
      passwordPlaceholder: '\u8bf7\u8f93\u5165\u5bc6\u7801',
      submit: '\u767b\u5f55',
      footerPrefix: '\u6ca1\u6709\u8d26\u53f7\uff1f',
      footerLink: '\u6ce8\u518c\u8d26\u53f7',
      errors: {
        usernameRequired: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
        passwordRequired: '\u8bf7\u8f93\u5165\u5bc6\u7801',
        passwordLength: '\u5bc6\u7801\u81f3\u5c11 6 \u4f4d'
      }
    }
  } as const;

  const t = translations[language];

  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.username.trim()) {
      errors.username = t.errors.usernameRequired;
    }

    if (!formData.password) {
      errors.password = t.errors.passwordRequired;
    } else if (formData.password.length < 6) {
      errors.password = t.errors.passwordLength;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="language-toggle">
            <button
              type="button"
              className={`lang-btn ${language === 'zh' ? 'active' : ''}`}
              onClick={() => setLanguage('zh')}
            >
              中文
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
          </div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">{t.username}</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={formErrors.username ? 'error' : ''}
            placeholder={t.usernamePlaceholder}
            disabled={isLoading}
            autoComplete="username"
          />
          {formErrors.username && (
            <span className="field-error">{formErrors.username}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">{t.password}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={formErrors.password ? 'error' : ''}
            placeholder={t.passwordPlaceholder}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {formErrors.password && (
            <span className="field-error">{formErrors.password}</span>
          )}
        </div>

        <LoadingButton
          type="submit"
          loading={isLoading}
          className="login-button"
        >
          {t.submit}
        </LoadingButton>

        <div className="form-footer">
          <span>{t.footerPrefix}</span> <Link to="/register">{t.footerLink}</Link>
        </div>
      </form>
    </div>
  );
}
