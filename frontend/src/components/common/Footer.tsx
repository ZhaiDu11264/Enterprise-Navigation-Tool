import React from 'react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="https://f.wps.cn/g/gFXZeyYH" target="_blank" rel="noopener noreferrer" className="footer-link">
            联系我们
          </a>
          <span className="footer-divider">|</span>
          <button type="button" className="footer-link footer-link-button">
            关于我们
          </button>
          <span className="footer-divider">|</span>
          <button type="button" className="footer-link footer-link-button">
            服务条款
          </button>
        </div>
        <div className="footer-info">
          <p className="copyright">© 2026 企业网址导航. All rights reserved.</p>
          <p className="icp">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
              京ICP备XXXXXXX号
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
