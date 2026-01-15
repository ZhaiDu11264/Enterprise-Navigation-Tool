import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserProfile } from '../components/auth';
import { ModernSearchBar } from '../components/navigation/ModernSearchBar';
import { SearchResults } from '../components/navigation/SearchResults';
import { LinkCard } from '../components/navigation/LinkCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Group, WebsiteLink } from '../types';
import { SearchService } from '../services/searchService';
import { groupService } from '../services/groupService';
import { linkService } from '../services/linkService';
import './SearchPage.css';

interface GroupResult {
  groupId: number;
  name: string;
  links: WebsiteLink[];
}

export function SearchPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [groups, setGroups] = useState<Group[]>([]);
  const [results, setResults] = useState<WebsiteLink[]>([]);
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Site Search',
      back: 'Back to dashboard',
      groupsTitle: 'Most relevant groups',
      linksTitle: 'Most relevant links'
    },
    zh: {
      title: '\u7ad9\u5185\u641c\u7d22',
      back: '\u8fd4\u56de\u4e3b\u9875',
      groupsTitle: '\u6700\u76f8\u5173\u5206\u7ec4',
      linksTitle: '\u6700\u76f8\u5173\u94fe\u63a5'
    }
  } as const;
  const t = translations[language];

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await groupService.getGroups();
        setGroups(data);
      } catch (error) {
        console.error('Failed to load groups for search:', error);
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      const trimmed = queryParam.trim();
      if (!trimmed) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await SearchService.searchLinks(trimmed);
        setResults(response.results);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    runSearch();
  }, [queryParam]);

  const groupResults = useMemo<GroupResult[]>(() => {
    if (!results.length) {
      return [];
    }

    const groupMap = new Map<number, Group>();
    groups.forEach((group) => groupMap.set(group.id, group));

    const grouped = new Map<number, WebsiteLink[]>();
    results.forEach((link) => {
      const groupId = typeof link.groupId === 'number' ? link.groupId : 0;
      const bucket = grouped.get(groupId) || [];
      bucket.push(link);
      grouped.set(groupId, bucket);
    });

    return Array.from(grouped.entries())
      .map(([groupId, links]) => {
        const group = groupMap.get(groupId);
        const name = group?.name || '\u672a\u5206\u7ec4';
        return { groupId, name, links };
      })
      .sort((a, b) => {
        if (a.links.length !== b.links.length) {
          return b.links.length - a.links.length;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [groups, results]);

  const handleQueryChange = (value: string) => {
    setSearchParams(value ? { q: value } : {});
  };

  const handleLinkClick = async (link: WebsiteLink) => {
    try {
      linkService.trackAccess(link.id).catch(console.error);
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  const handleToggleFavorite = async (link: WebsiteLink) => {
    try {
      const updated = await linkService.toggleFavorite(link.id, !link.isFavorite);
      setResults((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  const handleGroupJump = (groupId: number) => {
    navigate(`/dashboard?groupId=${groupId}`);
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-header-left">
          <button
            type="button"
            className="search-back"
            onClick={() => navigate('/dashboard')}
          >
            <span aria-hidden="true">←</span>
            {t.back}
          </button>
          <h1>{t.title}</h1>
        </div>
        <div className="search-header-actions">
          <UserProfile compact showLogout={false} />
        </div>
      </header>

      <div className="search-bar-section">
        <ModernSearchBar
          onLinkClick={handleLinkClick}
          onQueryChange={handleQueryChange}
          onSearchResultsChange={(links) => setResults(links)}
          centered={true}
          showSearchEngines={true}
          initialQuery={queryParam}
          initialEngineName={'\u7ad9\u5185'}
        />
      </div>

      <main className="search-content">
        {groupResults.length > 0 && (
          <section className="search-group-section">
            <h2>{t.groupsTitle}</h2>
            <div className="search-group-grid">
              {groupResults.map((group) => (
                <div
                  key={group.groupId}
                  className="search-group-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleGroupJump(group.groupId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleGroupJump(group.groupId);
                    }
                  }}
                >
                  <div className="search-group-header">
                    <span className="search-group-name">{group.name}</span>
                    <span className="search-group-count">{group.links.length}</span>
                  </div>
                  <div
                    className="search-group-links"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {group.links.slice(0, 3).map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onClick={handleLinkClick}
                        onToggleFavorite={handleToggleFavorite}
                        onGroupClick={handleGroupJump}
                        showGroupName={true}
                        highlightQuery={queryParam}
                        groups={groups}
                        listLayout={true}
                        compactMode={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="search-links-section">
          <h2>{t.linksTitle}</h2>
          <SearchResults
            results={results}
            query={queryParam}
            loading={loading}
            onLinkClick={handleLinkClick}
            onToggleFavorite={handleToggleFavorite}
            groups={groups}
            onGroupClick={handleGroupJump}
          />
        </section>
      </main>
    </div>
  );
}
