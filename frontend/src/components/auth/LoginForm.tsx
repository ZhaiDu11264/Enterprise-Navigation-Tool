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
      english: 'English',
      chinese: 'Chinese',
      errors: {
        usernameRequired: 'Username is required',
        passwordRequired: 'Password is required',
        passwordLength: 'Password must be at least 6 characters'
      }
    },
    zh: {
      title: '登录',
      subtitle: '请输入账号信息以进入系统',
      username: '用户名',
      password: '密码',
      usernamePlaceholder: '请输入用户名',
      passwordPlaceholder: '请输入密码',
      submit: '登录',
      footerPrefix: '没有账号？',
      footerLink: '注册账号',
      english: '英文',
      chinese: '中文',
      errors: {
        usernameRequired: '请输入用户名',
        passwordRequired: '请输入密码',
        passwordLength: '密码至少 6 位'
      }
    }
  } as const;

  const t = translations[language];

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (submitError) {
      console.error('Login failed:', submitError);
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
