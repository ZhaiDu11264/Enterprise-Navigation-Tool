import React, { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingButton } from '../common/LoadingSpinner';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CreateUserRequest, FormErrors } from '../../types';
import { useNotifications } from '../common';
import './LoginForm.css';

interface RegisterFormProps {
  onSuccess?: () => void;
}

type RegisterFormState = CreateUserRequest & { confirmPassword: string };

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { login, isLoading, error: authError, clearError } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegisterFormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'Create Account',
      subtitle: 'Register to start using the enterprise navigation tool',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      usernamePlaceholder: 'e.g. john_doe',
      emailPlaceholder: 'name@company.com',
      passwordPlaceholder: 'At least 6 chars, Aa1...',
      confirmPasswordPlaceholder: 'Re-enter your password',
      submit: 'Create Account',
      footerPrefix: 'Already have an account?',
      footerLink: 'Sign in',
      notifications: {
        createdTitle: 'Account created',
        createdMessage: 'Welcome! Your default navigation has been initialized.',
        failedTitle: 'Registration failed'
      },
      errors: {
        usernameRequired: 'Username is required',
        usernameLength: 'Username must be between 3 and 50 characters',
        usernameFormat: 'Username can only contain letters, numbers, underscores, and hyphens',
        emailRequired: 'Email is required',
        emailInvalid: 'Valid email is required',
        passwordRequired: 'Password is required',
        passwordLength: 'Password must be at least 6 characters',
        passwordFormat: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        confirmRequired: 'Confirm password is required',
        confirmMismatch: 'Passwords do not match'
      }
    },
    zh: {
      title: '\u6ce8\u518c\u8d26\u53f7',
      subtitle: '\u521b\u5efa\u8d26\u53f7\u4ee5\u5f00\u59cb\u4f7f\u7528\u4f01\u4e1a\u7f51\u5740\u5bfc\u822a',
      username: '\u7528\u6237\u540d',
      email: '\u90ae\u7bb1',
      password: '\u5bc6\u7801',
      confirmPassword: '\u786e\u8ba4\u5bc6\u7801',
      usernamePlaceholder: '\u4f8b\u5982\uff1azhangsan',
      emailPlaceholder: 'name@company.com',
      passwordPlaceholder: '\u81f3\u5c11 6 \u4f4d\uff0c\u9700\u5305\u542b\u5927\u5c0f\u5199\u5b57\u6bcd\u4e0e\u6570\u5b57',
      confirmPasswordPlaceholder: '\u518d\u6b21\u8f93\u5165\u5bc6\u7801',
      submit: '\u6ce8\u518c',
      footerPrefix: '\u5df2\u6709\u8d26\u53f7\uff1f',
      footerLink: '\u53bb\u767b\u5f55',
      notifications: {
        createdTitle: '\u8d26\u53f7\u5df2\u521b\u5efa',
        createdMessage: '\u6b22\u8fce\u4f7f\u7528\uff0c\u9ed8\u8ba4\u5bfc\u822a\u5df2\u521d\u59cb\u5316\u3002',
        failedTitle: '\u6ce8\u518c\u5931\u8d25'
      },
      errors: {
        usernameRequired: '\u8bf7\u8f93\u5165\u7528\u6237\u540d',
        usernameLength: '\u7528\u6237\u540d\u957f\u5ea6\u9700\u5728 3-50 \u4f4d\u4e4b\u95f4',
        usernameFormat: '\u7528\u6237\u540d\u53ea\u80fd\u5305\u542b\u5b57\u6bcd\u3001\u6570\u5b57\u3001\u4e0b\u5212\u7ebf\u6216\u8fde\u5b57\u7b26',
        emailRequired: '\u8bf7\u8f93\u5165\u90ae\u7bb1',
        emailInvalid: '\u90ae\u7bb1\u683c\u5f0f\u4e0d\u6b63\u786e',
        passwordRequired: '\u8bf7\u8f93\u5165\u5bc6\u7801',
        passwordLength: '\u5bc6\u7801\u81f3\u5c11 6 \u4f4d',
        passwordFormat: '\u5bc6\u7801\u9700\u5305\u542b\u5927\u5c0f\u5199\u5b57\u6bcd\u53ca\u6570\u5b57',
        confirmRequired: '\u8bf7\u786e\u8ba4\u5bc6\u7801',
        confirmMismatch: '\u4e24\u6b21\u5bc6\u7801\u4e0d\u4e00\u81f4'
      }
    }
  } as const;

  const t = translations[language];

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.username.trim()) {
      errors.username = t.errors.usernameRequired;
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      errors.username = t.errors.usernameLength;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = t.errors.usernameFormat;
    }

    if (!formData.email.trim()) {
      errors.email = t.errors.emailRequired;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = t.errors.emailInvalid;
    }

    if (!formData.password) {
      errors.password = t.errors.passwordRequired;
    } else if (formData.password.length < 6) {
      errors.password = t.errors.passwordLength;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t.errors.passwordFormat;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t.errors.confirmRequired;
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = t.errors.confirmMismatch;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError(null);
    }
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'user',
      });

      await login({ username: formData.username, password: formData.password });
      showSuccess(t.notifications.createdTitle, t.notifications.createdMessage);
      onSuccess?.();
    } catch (err: any) {
      const message = err?.message || 'Registration failed';
      setSubmitError(message);
      showError(t.notifications.failedTitle, message);
    } finally {
      setIsSubmitting(false);
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

        {(submitError || authError) && (
          <div className="error-message" role="alert">
            {submitError || authError}
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
            disabled={isSubmitting || isLoading}
            autoComplete="username"
          />
          {formErrors.username && <span className="field-error">{formErrors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">{t.email}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? 'error' : ''}
            placeholder={t.emailPlaceholder}
            disabled={isSubmitting || isLoading}
            autoComplete="email"
          />
          {formErrors.email && <span className="field-error">{formErrors.email}</span>}
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
            disabled={isSubmitting || isLoading}
            autoComplete="new-password"
          />
          {formErrors.password && <span className="field-error">{formErrors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t.confirmPassword}</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={formErrors.confirmPassword ? 'error' : ''}
            placeholder={t.confirmPasswordPlaceholder}
            disabled={isSubmitting || isLoading}
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <span className="field-error">{formErrors.confirmPassword}</span>
          )}
        </div>

        <LoadingButton
          type="submit"
          loading={isSubmitting || isLoading}
          className="login-button"
        >
          {t.submit}
        </LoadingButton>

        <div className="form-footer">
          <span>{t.footerPrefix}</span> <Link to="/login">{t.footerLink}</Link>
        </div>
      </form>
    </div>
  );
}
