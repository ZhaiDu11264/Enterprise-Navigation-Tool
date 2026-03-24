import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebsiteLink } from '../../types';
import { SearchService } from '../../services/searchService';
import { useDebounce } from '../../hooks/useDebounce';
import { getSearchEngines, SearchEngine } from '../../config/searchEngines';
import { useLanguage } from '../../contexts/LanguageContext';
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
  disableInternalSearch?: boolean;
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
  initialEngineName,
  disableInternalSearch = false
}: ModernSearchBarProps) {
  const { language } = useLanguage();
  const availableEngines = disableInternalSearch
    ? SEARCH_ENGINES.filter((engine) => engine.type !== 'internal')
    : SEARCH_ENGINES;
  const defaultSearchEngine =
    availableEngines.find((engine) => engine.type !== 'internal') ||
    availableEngines[0];
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
  const t = language === 'zh'
    ? {
        engineSearchTitle: (name: string) => `\u4f7f\u7528 ${name} \u641c\u7d22`,
        clear: '\u6e05\u9664',
        search: '\u641c\u7d22',
        quickAccess: '\u5feb\u901f\u8bbf\u95ee',
        history: '\u641c\u7d22\u8bb0\u5f55',
        clearHistory: '\u6e05\u9664\u641c\u7d22\u8bb0\u5f55'
      }
    : {
        engineSearchTitle: (name: string) => `Search with ${name}`,
        clear: 'Clear',
        search: 'Search',
        quickAccess: 'Quick Access',
        history: 'Search History',
        clearHistory: 'Clear Search History'
      };

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
    const preferred = availableEngines.find((engine) => engine.name === initialEngineName);
    if (preferred) {
      setCurrentSearchEngine(preferred);
    }
  }, [availableEngines, initialEngineName]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(Array.isArray(history) ? history.slice(0, 10) : []);
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
    // 涓嶈绔嬪嵆鍏抽棴涓嬫媺鑿滃崟锛岃鐢ㄦ埛鐪嬪埌娓呯┖鏁堟灉
    setTimeout(() => {
      setShowHistory(false);
    }, 500);
  };

  // Debounced search for suggestions
  const debouncedQuery = useDebounce(query, 300);

  // Search for suggestions when debounced query changes
  useEffect(() => {
    const searchSuggestions = async () => {
      
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        
        // 濡傛灉杈撳叆涓虹┖涓旀湁鎼滅储璁板綍涓旇幏寰楃劍鐐癸紝鏄剧ず鎼滅储璁板綍
        if (isFocused && searchHistory.length > 0 && debouncedQuery.trim().length === 0) {
          setShowHistory(true);
        } else {
          setShowHistory(false);
        }
        return;
      }

      // 鏈夎緭鍏ュ唴瀹规椂闅愯棌鎼滅储璁板綍
      setShowHistory(false);

      if (disableInternalSearch) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await SearchService.searchLinks(debouncedQuery, 6);
        setSuggestions(response.results);
        setShowSuggestions(response.results.length > 0 && isFocused);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    };

    searchSuggestions();
  }, [debouncedQuery, isFocused, searchHistory.length, disableInternalSearch]);

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
    } else if (currentSearchEngine.type === 'internal' && !disableInternalSearch) {
      navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    } else {
      // Search using current search engine
      const searchUrl = currentSearchEngine.url + encodeURIComponent(finalQuery);
      window.open(searchUrl, '_blank');
    }

    if (currentSearchEngine.type !== 'internal' && !disableInternalSearch) {
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
    setQuery(historyItem);
    setShowHistory(false);
    setSelectedIndex(-1);
    
    // 绔嬪嵆鎵ц鎼滅储
    setTimeout(() => {
      handleSearch(historyItem);
    }, 100);
  };

  // Handle search engine change
  const handleEngineChange = (engine: SearchEngine) => {
    setCurrentSearchEngine(engine);
    setShowEngineSelector(false);
    searchInputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    
    // 濡傛灉娌℃湁杈撳叆鍐呭涓旀湁鎼滅储璁板綍锛屾樉绀烘悳绱㈣褰?
    if (query.trim().length === 0 && searchHistory.length > 0) {
      setShowHistory(true);
      setShowSuggestions(false);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
      setShowHistory(false);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // 寤惰繜鍏抽棴涓嬫媺鑿滃崟锛岀‘淇濈偣鍑讳簨浠惰兘鎵ц
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
      
      // 妫€鏌ユ槸鍚︾偣鍑诲湪鎼滅储寤鸿澶栭儴
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

      // 妫€鏌ユ槸鍚︾偣鍑诲湪鎼滅储寮曟搸閫夋嫨鍣ㄥ閮?
      if (
        engineSelectorRef.current &&
        !engineSelectorRef.current.contains(target) &&
        !target.closest('.engine-button')
      ) {
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
                  setShowEngineSelector(newState);
                }}
                title={t.engineSearchTitle(currentSearchEngine.name)}
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
                  {availableEngines.map((engine) => (
                    <div
                      key={engine.name}
                      className={`engine-option ${engine.name === currentSearchEngine.name ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
                title={t.clear}
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
              title={t.search}
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
              <span className="suggestions-title">{t.quickAccess}</span>
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
                  handleHistoryClick(historyItem);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="history-text">{historyItem}</div>
              </div>
            ))}
            <div className="suggestions-footer">
              <span className="suggestions-title">{t.history}</span>
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
                  clearHistory(e);
                }}
                title={t.clearHistory}
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










