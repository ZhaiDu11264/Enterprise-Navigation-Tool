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
      english: 'English',
      chinese: 'Chinese',
      notifications: {
        createdTitle: 'Account created',
        createdMessage: 'Welcome! Your default navigation has been initialized.',
        failedTitle: 'Registration failed',
        defaultErrorMessage: 'Registration failed'
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
      title: '注册账号',
      subtitle: '创建账号以开始使用企业网址导航',
      username: '用户名',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      usernamePlaceholder: '例如：zhangsan',
      emailPlaceholder: 'name@company.com',
      passwordPlaceholder: '至少 6 位，需包含大小写字母与数字',
      confirmPasswordPlaceholder: '再次输入密码',
      submit: '注册',
      footerPrefix: '已有账号？',
      footerLink: '去登录',
      english: '英文',
      chinese: '中文',
      notifications: {
        createdTitle: '账号已创建',
        createdMessage: '欢迎使用，默认导航已初始化。',
        failedTitle: '注册失败',
        defaultErrorMessage: '注册失败'
      },
      errors: {
        usernameRequired: '请输入用户名',
        usernameLength: '用户名长度需在 3-50 位之间',
        usernameFormat: '用户名只能包含字母、数字、下划线或连字符',
        emailRequired: '请输入邮箱',
        emailInvalid: '邮箱格式不正确',
        passwordRequired: '请输入密码',
        passwordLength: '密码至少 6 位',
        passwordFormat: '密码需包含大小写字母及数字',
        confirmRequired: '请确认密码',
        confirmMismatch: '两次密码不一致'
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
      const message = err?.message || t.notifications.defaultErrorMessage;
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
              {t.chinese}
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              {t.english}
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
