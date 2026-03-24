import React from 'react';
import config from '../../config';
import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

export function Footer() {
  const { language } = useLanguage();

  const translations = {
    en: {
      contact: 'Contact Us',
      about: 'About Us',
      terms: 'Terms of Service',
      copyright: '© 2026 Enterprise Navigation. All rights reserved.',
      icp: 'ICP Filing'
    },
    zh: {
      contact: '联系我们',
      about: '关于我们',
      terms: '服务条款',
      copyright: '© 2026 企业网址导航. All rights reserved.',
      icp: '京ICP备XXXXXXX号'
    }
  } as const;

  const t = translations[language];

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href={config.links.footerContactUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
            {t.contact}
          </a>
          <span className="footer-divider">|</span>
          <button type="button" className="footer-link footer-link-button">
            {t.about}
          </button>
          <span className="footer-divider">|</span>
          <button type="button" className="footer-link footer-link-button">
            {t.terms}
          </button>
        </div>
        <div className="footer-info">
          <p className="copyright">{t.copyright}</p>
          <p className="icp">
            <a href={config.links.footerIcpUrl} target="_blank" rel="noopener noreferrer">
              {t.icp}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
