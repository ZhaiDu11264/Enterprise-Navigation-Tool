import React, { useState } from 'react';
import { ModernSearchBar } from '../components/navigation/ModernSearchBar';
import { SearchInterface } from '../components/navigation/SearchInterface';
import { useLanguage } from '../contexts/LanguageContext';
import { WebsiteLink } from '../types';
import './SearchDemoPage.css';

export function SearchDemoPage() {
  const { language } = useLanguage();
  const [searchResults, setSearchResults] = useState<WebsiteLink[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<'modern' | 'classic'>('modern');

  const translations = {
    en: {
      heroTitle: 'Modern Search Experience',
      heroSubtitle: 'Inspired by lemon-new-tab-page design philosophy',
      modernSearch: 'Modern Search',
      classicSearch: 'Classic Search',
      keyFeatures: 'Key Features',
      features: [
        {
          icon: '🔍',
          title: 'Multi-Engine Search',
          desc: 'Switch between Google, Bing, DuckDuckGo, and Baidu with a single click'
        },
        {
          icon: '✨',
          title: 'Instant Suggestions',
          desc: 'Real-time search suggestions from your saved links and bookmarks'
        },
        {
          icon: '🎨',
          title: 'Modern Design',
          desc: 'Clean, minimalist interface with smooth animations and transitions'
        },
        {
          icon: '🌙',
          title: 'Dark Mode',
          desc: 'Automatic dark mode support that adapts to your system preferences'
        },
        {
          icon: '📱',
          title: 'Responsive',
          desc: 'Optimized for all devices from mobile phones to desktop computers'
        },
        {
          icon: '⌨️',
          title: 'Keyboard Navigation',
          desc: 'Full keyboard support with arrow keys, Enter, and Escape shortcuts'
        }
      ],
      searchResultsFor: 'Search Results for',
      designComparison: 'Design Comparison',
      modernBarTitle: 'Modern Search Bar',
      classicBarTitle: 'Classic Search Interface',
      modernPoints: [
        'Glassmorphism design with backdrop blur',
        'Integrated search engine selector',
        'Smooth hover and focus animations',
        'Rounded corners and modern typography',
        'Enhanced visual feedback',
        'URL detection and direct navigation'
      ],
      classicPoints: [
        'Traditional form-based design',
        'Separate search button',
        'Standard border and shadow effects',
        'Conventional layout patterns',
        'Basic interaction feedback',
        'Internal search only'
      ]
    },
    zh: {
      heroTitle: '现代搜索体验',
      heroSubtitle: '灵感来自 lemon-new-tab-page 的设计理念',
      modernSearch: '现代搜索',
      classicSearch: '经典搜索',
      keyFeatures: '核心特性',
      features: [
        {
          icon: '🔍',
          title: '多引擎搜索',
          desc: '一键切换 Google、Bing、DuckDuckGo 和百度'
        },
        {
          icon: '✨',
          title: '即时建议',
          desc: '基于已保存链接和书签的实时搜索建议'
        },
        {
          icon: '🎨',
          title: '现代设计',
          desc: '简洁界面，配合流畅动画与过渡效果'
        },
        {
          icon: '🌙',
          title: '深色模式',
          desc: '自动适配系统偏好的深色模式支持'
        },
        {
          icon: '📱',
          title: '响应式布局',
          desc: '适配从手机到桌面的各种设备'
        },
        {
          icon: '⌨️',
          title: '键盘导航',
          desc: '支持方向键、回车和 Esc 的完整键盘操作'
        }
      ],
      searchResultsFor: '搜索结果',
      designComparison: '设计对比',
      modernBarTitle: '现代搜索栏',
      classicBarTitle: '经典搜索界面',
      modernPoints: [
        '毛玻璃风格与背景模糊',
        '集成搜索引擎选择器',
        '平滑的悬停与聚焦动画',
        '圆角与现代排版',
        '更强的视觉反馈',
        'URL 检测与直接跳转'
      ],
      classicPoints: [
        '传统表单式设计',
        '独立搜索按钮',
        '标准边框与阴影效果',
        '常规布局模式',
        '基础交互反馈',
        '仅支持站内搜索'
      ]
    }
  } as const;

  const t = translations[language];

  const handleLinkClick = (link: WebsiteLink) => {
    console.log('Link clicked:', link);
    window.open(link.url, '_blank');
  };

  const handleSearchResultsChange = (results: WebsiteLink[]) => {
    setSearchResults(results);
  };

  const handleQueryChange = (query: string) => {
    setCurrentQuery(query);
  };

  return (
    <div className="search-demo-page">
      <div className="hero-section">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>

          <div className="demo-toggle">
            <button
              className={`toggle-btn ${selectedDemo === 'modern' ? 'active' : ''}`}
              onClick={() => setSelectedDemo('modern')}
            >
              {t.modernSearch}
            </button>
            <button
              className={`toggle-btn ${selectedDemo === 'classic' ? 'active' : ''}`}
              onClick={() => setSelectedDemo('classic')}
            >
              {t.classicSearch}
            </button>
          </div>

          <div className="search-demo">
            {selectedDemo === 'modern' ? (
              <ModernSearchBar
                onLinkClick={handleLinkClick}
                onSearchResultsChange={handleSearchResultsChange}
                onQueryChange={handleQueryChange}
                centered={true}
                showSearchEngines={true}
              />
            ) : (
              <SearchInterface
                onLinkClick={handleLinkClick}
                onSearchResultsChange={handleSearchResultsChange}
                onQueryChange={handleQueryChange}
                className="classic-search-demo"
              />
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">{t.keyFeatures}</h2>

          <div className="features-grid">
            {t.features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="results-section">
          <div className="container">
            <h2 className="section-title">
              {t.searchResultsFor} "{currentQuery}" ({searchResults.length})
            </h2>

            <div className="results-grid">
              {searchResults.map((link) => (
                <div key={link.id} className="result-card" onClick={() => handleLinkClick(link)}>
                  <div className="result-icon">
                    {link.iconUrl ? (
                      <img src={link.iconUrl} alt="" />
                    ) : (
                      <div className="default-result-icon">🔗</div>
                    )}
                  </div>
                  <div className="result-content">
                    <h3 className="result-title">{link.name}</h3>
                    <p className="result-description">{link.description}</p>
                    <span className="result-url">{link.url}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="comparison-section">
        <div className="container">
          <h2 className="section-title">{t.designComparison}</h2>

          <div className="comparison-grid">
            <div className="comparison-item">
              <h3>{t.modernBarTitle}</h3>
              <ul>
                {t.modernPoints.map((point) => (
                  <li key={point}>✓ {point}</li>
                ))}
              </ul>
            </div>

            <div className="comparison-item">
              <h3>{t.classicBarTitle}</h3>
              <ul>
                {t.classicPoints.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
