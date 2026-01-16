import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebsiteLink } from '../../types';
import { SearchService } from '../../services/searchService';
import { useDebounce } from '../../hooks/useDebounce';
import { getSearchEngines, SearchEngine } from '../../config/searchEngines';
import './ModernSearchBar.css';

interface ModernSearchBarProps {
  onLinkClick: (link: WebsiteLink) => void;
  onSearchResultsChange?: (results: WebsiteLink[]) => void;
  onQueryChange?: (query: string) => void;
  className?: string;
  centered?: boolean;
  showSearchEngines?: boolean;
  initialQuery?: string;
  initialEngineName?: string;
}

const SEARCH_ENGINES: SearchEngine[] = getSearchEngines();

export function ModernSearchBar({
  onLinkClick,
  onSearchResultsChange,
  onQueryChange,
  className = '',
  centered = true,
  showSearchEngines = true,
  initialQuery,
  initialEngineName
}: ModernSearchBarProps) {
  const defaultSearchEngine =
    SEARCH_ENGINES.find((engine) => engine.type !== 'internal') ||
    SEARCH_ENGINES[0];
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<WebsiteLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentSearchEngine, setCurrentSearchEngine] = useState(defaultSearchEngine);
  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const engineSelectorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof initialQuery !== 'string') {
      return;
    }
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!initialEngineName) {
      return;
    }
    const preferred = SEARCH_ENGINES.find((engine) => engine.name === initialEngineName);
    if (preferred) {
      setCurrentSearchEngine(preferred);
    }
  }, [initialEngineName]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(Array.isArray(history) ? history.slice(0, 10) : []);
        console.log('🔍 加载搜索记录:', history);
      } catch (err) {
        console.error('Failed to load search history:', err);
        setSearchHistory([]);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (newHistory: string[]) => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  };

  // Add search term to history
  const addToHistory = (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    saveSearchHistory(newHistory);
  };

  // Clear search history
  const clearHistory = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    console.log('🔍 搜索记录已清除');
    // 不要立即关闭下拉菜单，让用户看到清空效果
    setTimeout(() => {
      setShowHistory(false);
    }, 500);
  };

  // Debounced search for suggestions
  const debouncedQuery = useDebounce(query, 300);

  // Search for suggestions when debounced query changes
  useEffect(() => {
    const searchSuggestions = async () => {
      console.log('🔍 搜索建议触发, 查询:', debouncedQuery, '长度:', debouncedQuery.trim().length);
      
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        
        // 如果输入为空且有搜索记录且获得焦点，显示搜索记录
        if (isFocused && searchHistory.length > 0 && debouncedQuery.trim().length === 0) {
          setShowHistory(true);
          console.log('🔍 显示搜索记录 (输入为空)');
        } else {
          setShowHistory(false);
        }
        return;
      }

      // 有输入内容时隐藏搜索记录
      setShowHistory(false);

      try {
        setIsSearching(true);
        const response = await SearchService.searchLinks(debouncedQuery, 6);
        setSuggestions(response.results);
        setShowSuggestions(response.results.length > 0 && isFocused);
        console.log('🔍 搜索建议结果:', response.results.length);
      } catch (err) {
        console.error('Search suggestions error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    };

    searchSuggestions();
  }, [debouncedQuery, isFocused, searchHistory.length]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    onQueryChange?.(value);
  };

  // Handle search submission
  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = (searchQuery || query).trim();
    
    if (finalQuery.length === 0) return;

    // Add to search history
    addToHistory(finalQuery);

    // Check if it's a URL
    const isUrl = /^https?:\/\//.test(finalQuery) || 
                  /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(finalQuery);

    if (isUrl) {
      // Open URL directly
      const url = finalQuery.startsWith('http') ? finalQuery : `https://${finalQuery}`;
      window.open(url, '_blank');
    } else if (currentSearchEngine.type === 'internal') {
      navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    } else {
      // Search using current search engine
      const searchUrl = currentSearchEngine.url + encodeURIComponent(finalQuery);
      window.open(searchUrl, '_blank');
    }

    if (currentSearchEngine.type !== 'internal') {
      // Also search internal links
      try {
        const response = await SearchService.searchLinks(finalQuery);
        onSearchResultsChange?.(response.results);
      } catch (err) {
        console.error('Internal search error:', err);
      }
    }

    setShowSuggestions(false);
    setShowHistory(false);
    searchInputRef.current?.blur();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSuggestionClick(suggestions[selectedIndex]);
    } else {
      handleSearch();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = showSuggestions ? suggestions.length : (showHistory ? searchHistory.length : 0);
    
    if (totalItems > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < totalItems) {
            if (showSuggestions) {
              handleSuggestionClick(suggestions[selectedIndex]);
            } else if (showHistory) {
              handleHistoryClick(searchHistory[selectedIndex]);
            }
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setShowHistory(false);
          setSelectedIndex(-1);
          searchInputRef.current?.blur();
          break;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (link: WebsiteLink) => {
    setQuery('');
    setShowSuggestions(false);
    setShowHistory(false);
    setSelectedIndex(-1);
    onLinkClick(link);
    searchInputRef.current?.blur();
  };

  // Handle history item click
  const handleHistoryClick = (historyItem: string) => {
    console.log('🔍 点击搜索记录:', historyItem);
    setQuery(historyItem);
    setShowHistory(false);
    setSelectedIndex(-1);
    
    // 立即执行搜索
    setTimeout(() => {
      handleSearch(historyItem);
    }, 100);
  };

  // Handle search engine change
  const handleEngineChange = (engine: SearchEngine) => {
    console.log('🔍 切换搜索引擎:', engine.name);
    setCurrentSearchEngine(engine);
    setShowEngineSelector(false);
    searchInputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    console.log('🔍 搜索框获得焦点，搜索记录数量:', searchHistory.length, '当前查询:', query);
    
    // 如果没有输入内容且有搜索记录，显示搜索记录
    if (query.trim().length === 0 && searchHistory.length > 0) {
      setShowHistory(true);
      setShowSuggestions(false);
      console.log('🔍 显示搜索记录');
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
      setShowHistory(false);
      console.log('🔍 显示搜索建议');
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // 延迟关闭下拉菜单，确保点击事件能执行
    setTimeout(() => {
      setShowSuggestions(false);
      setShowHistory(false);
      setSelectedIndex(-1);
    }, 300);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // 检查是否点击在搜索建议外部
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(target)
      ) {
        setShowSuggestions(false);
        setShowHistory(false);
        setSelectedIndex(-1);
      }

      // 检查是否点击在搜索引擎选择器外部
      if (
        engineSelectorRef.current &&
        !engineSelectorRef.current.contains(target) &&
        !target.closest('.engine-button')
      ) {
        console.log('🔍 点击外部，关闭搜索引擎下拉菜单');
        setShowEngineSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div className={`modern-search-bar ${centered ? 'centered' : ''} ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className={`search-container ${isFocused ? 'focused' : ''} ${showSuggestions || showHistory ? 'has-suggestions' : ''}`}>
          {/* Search Engine Selector */}
          {showSearchEngines && (
            <div className="search-engine-selector">
              <div
                className="engine-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newState = !showEngineSelector;
                  console.log('🔍 点击搜索引擎按钮, 切换状态:', showEngineSelector, '=>', newState);
                  setShowEngineSelector(newState);
                }}
                title={`使用 ${currentSearchEngine.name} 搜索`}
              >
                <span className="engine-icon">{currentSearchEngine.icon}</span>
                <svg 
                  className={`dropdown-arrow ${showEngineSelector ? 'open' : ''}`}
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>

              {showEngineSelector && (
                <div 
                  ref={engineSelectorRef} 
                  className="engine-dropdown"
                >
                  {SEARCH_ENGINES.map((engine) => (
                    <div
                      key={engine.name}
                      className={`engine-option ${engine.name === currentSearchEngine.name ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔍 选择搜索引擎:', engine.name);
                        handleEngineChange(engine);
                      }}
                    >
                      <span className="engine-icon">{engine.icon}</span>
                      <span className="engine-name">{engine.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Input */}
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={currentSearchEngine.placeholder}
            className="search-input"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Search Actions */}
          <div className="search-actions">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setShowHistory(false);
                  onQueryChange?.('');
                  searchInputRef.current?.focus();
                }}
                className="clear-button"
                title="Clear"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}

            <button
              type="submit"
              className="search-button"
              disabled={isSearching}
              title="Search"
            >
              {isSearching ? (
                <div className="loading-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="suggestions-dropdown"
            onMouseDown={handleDropdownMouseDown}
          >
            <div className="suggestions-header">
              <span className="suggestions-title">快速访问</span>
            </div>
            {suggestions.map((link, index) => (
              <div
                key={link.id}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(link)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-icon">
                  {link.iconUrl ? (
                    <img src={link.iconUrl} alt="" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  ) : (
                    <div className="default-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">{link.name}</div>
                  <div className="suggestion-url">{link.url}</div>
                </div>
                <div className="suggestion-action">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search History */}
        {showHistory && searchHistory.length > 0 && (
          <div
            ref={suggestionsRef}
            className="suggestions-dropdown"
            onMouseDown={handleDropdownMouseDown}
          >
            {searchHistory.map((historyItem, index) => (
              <div
                key={index}
                className={`suggestion-item history-item ${index === selectedIndex ? 'selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔍 点击搜索记录:', historyItem);
                  handleHistoryClick(historyItem);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="history-text">{historyItem}</div>
              </div>
            ))}
            <div className="suggestions-footer">
              <span className="suggestions-title">搜索记录</span>
              <button
                type="button"
                className="clear-history-btn"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔍 点击清除搜索记录按钮');
                  clearHistory(e);
                }}
                title="清除搜索记录"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}



