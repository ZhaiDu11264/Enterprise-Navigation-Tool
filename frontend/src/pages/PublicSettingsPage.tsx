import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import lakeBackground from '../assets/difusionastrouc-lake-6295829_1920.jpg';
import './PublicSettingsPage.css';
import { LoginModal } from '../components/auth/LoginModal';

export function PublicSettingsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setTransparentMode } = useSettings();
  const t = useMemo(() => (language === 'zh'
    ? {
        title: '\u6e38\u5ba2\u8bbe\u7f6e',
        back: '\u8fd4\u56de\u9996\u9875',
        login: '\u767b\u5f55',
        iconSize: '\u56fe\u6807\u5927\u5c0f',
        small: '\u5c0f',
        large: '\u5927',
        reset: '\u91cd\u7f6e',
        hint: '\u8be5\u8bbe\u7f6e\u4ec5\u5f53\u6b21\u6d4f\u89c8\u6709\u6548'
      }
    : {
        title: 'Guest Settings',
        back: 'Back to Home',
        login: 'Login',
        iconSize: 'Icon Size',
        small: 'Small',
        large: 'Large',
        reset: 'Reset',
        hint: 'This setting is temporary for this session.'
      }), [language]);

  const [iconScale, setIconScale] = useState(() => {
    const raw = sessionStorage.getItem('guestIconScale');
    const value = raw ? Number(raw) : 1;
    return Number.isFinite(value) ? value : 1;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  // 未登录的临时设置页也强制不透明
  useEffect(() => {
    setTransparentMode(false);
  }, [setTransparentMode]);

  // 登录后跳到后台
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleScaleChange = (value: number) => {
    setIconScale(value);
    sessionStorage.setItem('guestIconScale', String(value));
  };

  const handleReset = () => {
    handleScaleChange(1);
  };

  return (
    <div
      className="guest-settings-page"
      style={{
        backgroundImage: `linear-gradient(160deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.05)), url(${lakeBackground})`
      }}
    >
      <header className="guest-settings-header">
        <h1>{t.title}</h1>
        <div className="guest-settings-actions">
          <Link to="/" className="guest-settings-btn">
            {t.back}
          </Link>
          <button
            type="button"
            className="guest-settings-btn primary"
            onClick={() => setShowLoginModal(true)}
          >
            {t.login}
          </button>
        </div>
      </header>

      <main className="guest-settings-content">
        <section className="guest-settings-card">
          <div className="guest-settings-row">
            <div className="guest-settings-label">{t.iconSize}</div>
            <div className="guest-settings-range">
              <span>{t.small}</span>
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.05}
                value={iconScale}
                onChange={(event) => handleScaleChange(Number(event.target.value))}
              />
              <span>{t.large}</span>
            </div>
          </div>
          <div className="guest-settings-preview" style={{ ['--icon-scale' as any]: iconScale }}>
            <div className="preview-icon">A</div>
            <div className="preview-icon">B</div>
            <div className="preview-icon">C</div>
            <div className="preview-icon">D</div>
          </div>
          <div className="guest-settings-hint">{t.hint}</div>
          <button className="guest-settings-reset" type="button" onClick={handleReset}>
            {t.reset}
          </button>
        </section>
      </main>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
