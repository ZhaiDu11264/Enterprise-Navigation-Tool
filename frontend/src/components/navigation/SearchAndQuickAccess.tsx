import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WebsiteLink, Group } from '../../types';
import { SearchInterface } from './SearchInterface';
import { SearchResults } from './SearchResults';
import { QuickAccess } from './QuickAccess';
import './SearchAndQuickAccess.css';

interface SearchAndQuickAccessProps {
  groups: Group[];
  onLinkClick: (link: WebsiteLink) => void;
  onEditLink?: (link: WebsiteLink) => void;
  onDeleteLink?: (link: WebsiteLink) => void;
  onToggleFavorite?: (link: WebsiteLink) => void;
  className?: string;
}

export function SearchAndQuickAccess({
  groups,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  className = ""
}: SearchAndQuickAccessProps) {
  const { language } = useLanguage();
  const translations = {
    en: {
      placeholder: 'Search your links...'
    },
    zh: {
      placeholder: '\u641c\u7d22\u94fe\u63a5...'
    }
  } as const;
  const t = translations[language];
  const [searchResults, setSearchResults] = useState<WebsiteLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchResultsChange = (results: WebsiteLink[]) => {
    setSearchResults(results);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleLinkClick = (link: WebsiteLink) => {
    onLinkClick(link);
  };

  const showSearchResults = searchQuery.trim().length > 0;
  const groupsForProps = groups.map(g => ({ id: g.id, name: g.name }));

  return (
    <div className={`search-and-quick-access ${className}`}>
      {/* Search Interface */}
      <div className="search-section">
        <SearchInterface
          onLinkClick={handleLinkClick}
          onSearchResultsChange={handleSearchResultsChange}
          onQueryChange={handleSearchQueryChange}
          placeholder={t.placeholder}
        />
      </div>

      {/* Content Area */}
      <div className="content-section">
        {showSearchResults ? (
          /* Search Results */
          <SearchResults
            results={searchResults}
            query={searchQuery}
            loading={false}
            onLinkClick={handleLinkClick}
            onEditLink={onEditLink}
            onDeleteLink={onDeleteLink}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          /* Quick Access when not searching */
          <QuickAccess
            onLinkClick={handleLinkClick}
            onEditLink={onEditLink}
            onDeleteLink={onDeleteLink}
            onToggleFavorite={onToggleFavorite}
            groups={groupsForProps}
          />
        )}
      </div>
    </div>
  );
}
