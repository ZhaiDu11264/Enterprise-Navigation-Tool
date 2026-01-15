import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink } from '../../types';
import { SearchService } from '../../services/searchService';
import './SearchInterface.css';

interface SearchInterfaceProps {
  onLinkClick: (link: WebsiteLink) => void;
  onSearchResultsChange?: (results: WebsiteLink[]) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInterface({
  onLinkClick,
  onSearchResultsChange,
  onQueryChange,
  placeholder,
  className = ""
}: SearchInterfaceProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      placeholder: 'Search links...',
      clear: 'Clear search',
      search: 'Search',
      suggestionsFailed: 'Failed to load suggestions',
      searchFailed: 'Search failed. Please try again.',
      found: (count: number, query: string) => `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`
    },
    zh: {
      placeholder: '\u641c\u7d22\u94fe\u63a5...',
      clear: '\u6e05\u7a7a\u641c\u7d22',
      search: '\u641c\u7d22',
      suggestionsFailed: '\u52a0\u8f7d\u5efa\u8bae\u5931\u8d25',
      searchFailed: '\u641c\u7d22\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002',
      found: (count: number, query: string) => `\u627e\u5230${count}\u6761\u7ed3\u679c\uff1a\u201c${query}\u201d`
    }
  } as const;
  const t = translations[language];
  const resolvedPlaceholder = placeholder ?? t.placeholder;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WebsiteLink[]>([]);
  const [suggestions, setSuggestions] = useState<WebsiteLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions
  const debouncedSearch = useMemo(() => (
    SearchService.debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (searchQuery.trim().length < 2) {
        return;
      }

      try {
        setIsSearching(true);
        setError(null);
        const response = await SearchService.searchLinks(searchQuery, 5);
        setSuggestions(response.results);
        setShowSuggestions(response.results.length > 0);
      } catch (err) {
        console.error('Search suggestions error:', err);
        setError(t.suggestionsFailed);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ), [t.suggestionsFailed]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    onQueryChange?.(value);
    debouncedSearch(value);
  };

  // Handle search submission
  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    
    if (finalQuery.trim().length === 0) {
      setResults([]);
      onSearchResultsChange?.([]);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setShowSuggestions(false);
      
      const response = await SearchService.searchLinks(finalQuery);
      setResults(response.results);
      onSearchResultsChange?.(response.results);
    } catch (err) {
      console.error('Search error:', err);
      setError(t.searchFailed);
      setResults([]);
      onSearchResultsChange?.([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (link: WebsiteLink) => {
    setQuery(link.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onLinkClick(link);
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setError(null);
    onQueryChange?.('');
    onSearchResultsChange?.([]);
    searchInputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-interface ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={resolvedPlaceholder}
            className="search-input"
            disabled={isSearching}
          />
          
          <div className="search-actions">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="clear-btn"
                title={t.clear}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
            
            <button
              type="submit"
              className="search-btn"
              disabled={isSearching}
              title={t.search}
            >
              {isSearching ? (
                <div className="spinner" />
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
          <div ref={suggestionsRef} className="search-suggestions">
            {suggestions.map((link, index) => (
              <div
                key={link.id}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(link)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-icon">
                  {link.iconUrl ? (
                    <img src={link.iconUrl} alt="" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                  )}
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">{link.name}</div>
                  {link.description && (
                    <div className="suggestion-description">{link.description}</div>
                  )}
                </div>
                {link.isFavorite && (
                  <div className="suggestion-favorite">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <div className="search-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {error}
        </div>
      )}

      {/* Search Results Count */}
      {results.length > 0 && (
        <div className="search-results-info">
          {t.found(results.length, query)}
        </div>
      )}
    </div>
  );
}
