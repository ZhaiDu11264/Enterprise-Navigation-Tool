export interface SearchEngine {
  name: string;
  url: string;
  icon: string;
  placeholder: string;
  type?: 'external' | 'internal';
}

const fallbackSearchEngines: SearchEngine[] = [
  {
    name: '\u7ad9\u5185',
    url: '/search?q=',
    icon: '\u7ad9',
    placeholder: '\u7ad9\u5185\u641c\u7d22\u6216\u8f93\u5165\u5173\u952e\u8bcd',
    type: 'internal'
  },
  {
    name: '\u767e\u5ea6',
    url: 'https://www.baidu.com/s?wd=',
    icon: '\u767e',
    placeholder: '\u767e\u5ea6\u641c\u7d22\u6216\u8f93\u5165\u7f51\u5740'
  },
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'G',
    placeholder: 'Google\u641c\u7d22\u6216\u8f93\u5165\u7f51\u5740'
  },
  {
    name: 'Yandex',
    url: 'https://yandex.com/search/?text=',
    icon: 'Y',
    placeholder: 'Yandex\u641c\u7d22\u6216\u8f93\u5165\u7f51\u5740'
  },
  {
    name: '\u641c\u72d7',
    url: 'https://www.sogou.com/web?query=',
    icon: '\u641c',
    placeholder: '\u641c\u72d7\u641c\u7d22\u6216\u8f93\u5165\u7f51\u5740'
  },
  {
    name: '\u5fc5\u5e94',
    url: 'https://www.bing.com/search?q=',
    icon: 'B',
    placeholder: '\u5fc5\u5e94\u641c\u7d22\u6216\u8f93\u5165\u7f51\u5740'
  },
  {
    name: '360',
    url: 'https://www.so.com/s?q=',
    icon: '360',
    placeholder: '360\u641c\u7d22\u6216\u8f93\u5165\u7f51\u5740'
  }
];

const isValidSearchEngine = (engine: SearchEngine): boolean => {
  return Boolean(
    engine &&
      typeof engine.name === 'string' &&
      typeof engine.url === 'string' &&
      typeof engine.icon === 'string' &&
      typeof engine.placeholder === 'string'
  );
};

const parseSearchEngines = (raw: string | undefined): SearchEngine[] | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as SearchEngine[];
    if (Array.isArray(parsed) && parsed.every(isValidSearchEngine)) {
      return parsed;
    }
  } catch (error) {
    console.warn('REACT_APP_SEARCH_ENGINES is invalid. Using fallback defaults.', error);
    return null;
  }
  console.warn('REACT_APP_SEARCH_ENGINES is missing required fields. Using fallback defaults.');
  return null;
};

export const getSearchEngines = (): SearchEngine[] => {
  return parseSearchEngines(process.env.REACT_APP_SEARCH_ENGINES) || fallbackSearchEngines;
};
