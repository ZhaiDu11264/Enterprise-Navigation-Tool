import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink } from '../../types';
import { LinkCard } from './LinkCard';
import './SearchResults.css';

interface SearchResultsProps {
  results: WebsiteLink[];
  query: string;
  loading?: boolean;
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  groups?: Array<{ id: number; name: string }>;
  onGroupClick?: (groupId: number) => void;
  className?: string;
}

export function SearchResults({
  results,
  query,
  loading = false,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  groups = [],
  onGroupClick,
  className = ""
}: SearchResultsProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      searchingTitle: 'Searching...',
      searchingFor: (value: string) => `Searching for "${value}"...`,
      searchTitle: 'Search your links',
      searchHint: 'Enter a search term to find your saved links',
      noResultsTitle: 'No results found',
      noResultsHint: (value: string) => `No links match your search for "${value}"`,
      noMatchesTitle: 'No matches found',
      noMatchesHint: 'Try different keywords or check your spelling',
      tipsTitle: 'Search tips:',
      tipShorter: 'Try shorter or more general terms',
      tipTypos: 'Check for typos in your search',
      tipFields: 'Search by website name or description',
      resultsTitle: (count: number, value: string) => `${count} result${count !== 1 ? 's' : ''} for "${value}"`,
      sortedBy: 'Sorted by relevance and usage',
      favorite: 'Favorite',
      accessed: (count: number) => `Accessed ${count} time${count !== 1 ? 's' : ''}`,
      lastUsed: (date: string) => `Last used ${date}`
    },
    zh: {
      searchingTitle: '\u6b63\u5728\u641c\u7d22...',
      searchingFor: (value: string) => `\u6b63\u5728\u641c\u7d22\u201c${value}\u201d...`,
      searchTitle: '\u641c\u7d22\u94fe\u63a5',
      searchHint: '\u8bf7\u8f93\u5165\u5173\u952e\u8bcd\u4ee5\u67e5\u627e\u4fdd\u5b58\u7684\u94fe\u63a5',
      noResultsTitle: '\u65e0\u7ed3\u679c',
      noResultsHint: (value: string) => `\u6ca1\u6709\u627e\u5230\u201c${value}\u201d\u76f8\u5173\u7684\u94fe\u63a5`,
      noMatchesTitle: '\u6ca1\u6709\u5339\u914d\u7ed3\u679c',
      noMatchesHint: '\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u5173\u952e\u8bcd\u6216\u68c0\u67e5\u62fc\u5199',
      tipsTitle: '\u641c\u7d22\u5efa\u8bae\uff1a',
      tipShorter: '\u5c1d\u8bd5\u66f4\u77ed\u6216\u66f4\u5e38\u89c1\u7684\u5173\u952e\u8bcd',
      tipTypos: '\u68c0\u67e5\u62fc\u5199\u662f\u5426\u6709\u8bef',
      tipFields: '\u7528\u7f51\u7ad9\u540d\u79f0\u6216\u63cf\u8ff0\u641c\u7d22',
      resultsTitle: (count: number, value: string) => `\u627e\u5230${count}\u6761\u7ed3\u679c\uff1a\u201c${value}\u201d`,
      sortedBy: '\u6309\u76f8\u5173\u5ea6\u548c\u4f7f\u7528\u60c5\u51b5\u6392\u5e8f',
      favorite: '\u6536\u85cf',
      accessed: (count: number) => `\u8bbf\u95ee${count}\u6b21`,
      lastUsed: (date: string) => `\u4e0a\u6b21\u4f7f\u7528 ${date}`
    }
  } as const;
  const t = translations[language];

  if (loading) {
    return (
      <div className={`search-results loading ${className}`}>
        <div className="search-results-header">
          <h3>{t.searchingTitle}</h3>
        </div>
        <div className="search-loading">
          <div className="spinner-large" />
          <p>{t.searchingFor(query)}</p>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className={`search-results empty ${className}`}>
        <div className="search-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <h3>{t.searchTitle}</h3>
          <p>{t.searchHint}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`search-results no-results ${className}`}>
        <div className="search-results-header">
          <h3>{t.noResultsTitle}</h3>
          <p>{t.noResultsHint(query)}</p>
        </div>
        <div className="search-no-results">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <h3>{t.noMatchesTitle}</h3>
          <p>{t.noMatchesHint}</p>
          <div className="search-suggestions-text">
            <strong>{t.tipsTitle}</strong>
            <ul>
              <li>{t.tipShorter}</li>
              <li>{t.tipTypos}</li>
              <li>{t.tipFields}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    if (a.accessCount !== b.accessCount) {
      return b.accessCount - a.accessCount;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`search-results ${className}`}>
      <div className="search-results-header">
        <h3>{t.resultsTitle(results.length, query)}</h3>
        {results.length > 1 && (
          <p className="search-results-subtitle">{t.sortedBy}</p>
        )}
      </div>

      <div className="search-results-grid">
        {sortedResults.map((link) => (
          <div key={link.id} className="search-result-item">
            <LinkCard
              link={link}
              onClick={() => onLinkClick(link)}
              onEdit={onEditLink ? () => onEditLink(link) : undefined}
              onDelete={onDeleteLink ? () => onDeleteLink(link) : undefined}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(link) : undefined}
              showGroupName={true}
              highlightQuery={query}
              groups={groups}
              onGroupClick={onGroupClick}
            />

            <div className="search-result-meta">
              {link.isFavorite && (
                <span className="result-badge favorite">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  {t.favorite}
                </span>
              )}

              {link.accessCount > 0 && (
                <span className="result-badge accessed">
                  {t.accessed(link.accessCount)}
                </span>
              )}

              {link.lastAccessedAt && (
                <span className="result-badge recent">
                  {t.lastUsed(new Date(link.lastAccessedAt).toLocaleDateString())}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
