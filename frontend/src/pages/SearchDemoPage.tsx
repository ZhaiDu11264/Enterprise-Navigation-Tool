import React, { useState } from 'react';
import { ModernSearchBar } from '../components/navigation/ModernSearchBar';
import { SearchInterface } from '../components/navigation/SearchInterface';
import { WebsiteLink } from '../types';
import './SearchDemoPage.css';

export function SearchDemoPage() {
  const [searchResults, setSearchResults] = useState<WebsiteLink[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<'modern' | 'classic'>('modern');

  const handleLinkClick = (link: WebsiteLink) => {
    console.log('Link clicked:', link);
    // In a real app, this would navigate to the link
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
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title">Modern Search Experience</h1>
          <p className="hero-subtitle">
            Inspired by lemon-new-tab-page design philosophy
          </p>
          
          {/* Demo Toggle */}
          <div className="demo-toggle">
            <button
              className={`toggle-btn ${selectedDemo === 'modern' ? 'active' : ''}`}
              onClick={() => setSelectedDemo('modern')}
            >
              Modern Search
            </button>
            <button
              className={`toggle-btn ${selectedDemo === 'classic' ? 'active' : ''}`}
              onClick={() => setSelectedDemo('classic')}
            >
              Classic Search
            </button>
          </div>

          {/* Search Bar Demo */}
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

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Multi-Engine Search</h3>
              <p>Switch between Google, Bing, DuckDuckGo, and Baidu with a single click</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Suggestions</h3>
              <p>Real-time search suggestions from your saved links and bookmarks</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Modern Design</h3>
              <p>Clean, minimalist interface with smooth animations and transitions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌙</div>
              <h3>Dark Mode</h3>
              <p>Automatic dark mode support that adapts to your system preferences</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Optimized for all devices from mobile phones to desktop computers</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⌨️</div>
              <h3>Keyboard Navigation</h3>
              <p>Full keyboard support with arrow keys, Enter, and Escape shortcuts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="results-section">
          <div className="container">
            <h2 className="section-title">
              Search Results for "{currentQuery}" ({searchResults.length})
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

      {/* Comparison Section */}
      <div className="comparison-section">
        <div className="container">
          <h2 className="section-title">Design Comparison</h2>
          
          <div className="comparison-grid">
            <div className="comparison-item">
              <h3>Modern Search Bar</h3>
              <ul>
                <li>✅ Glassmorphism design with backdrop blur</li>
                <li>✅ Integrated search engine selector</li>
                <li>✅ Smooth hover and focus animations</li>
                <li>✅ Rounded corners and modern typography</li>
                <li>✅ Enhanced visual feedback</li>
                <li>✅ URL detection and direct navigation</li>
              </ul>
            </div>
            
            <div className="comparison-item">
              <h3>Classic Search Interface</h3>
              <ul>
                <li>📋 Traditional form-based design</li>
                <li>📋 Separate search button</li>
                <li>📋 Standard border and shadow effects</li>
                <li>📋 Conventional layout patterns</li>
                <li>📋 Basic interaction feedback</li>
                <li>📋 Internal search only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}