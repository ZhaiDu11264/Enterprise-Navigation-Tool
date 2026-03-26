import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type GridSize = 'small' | 'medium' | 'large' | 'extra-large';

interface SettingsContextValue {
  gridSize: GridSize;
  setGridSize: (size: GridSize) => void;
  getGridColumns: () => string;
  getCompactGridColumns: () => string;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  compactMode: boolean;
  setCompactMode: (enabled: boolean) => void;
  transparentMode: boolean;
  setTransparentMode: (enabled: boolean) => void;
  contentSidePadding: number;
  setContentSidePadding: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const DEFAULTS_VERSION = 'v2';
const DEFAULT_CONTENT_SIDE_PADDING = 20;
const LEGACY_CONTENT_SIDE_PADDING = 9.5;

const shouldApplyDefaults = (): boolean => {
  return localStorage.getItem('ui_defaults_version') !== DEFAULTS_VERSION;
};

const getInitialGridSize = (): GridSize => {
  if (shouldApplyDefaults()) {
    return 'small';
  }
  const stored = localStorage.getItem('ui_grid_size') as GridSize | null;
  return stored === 'small' || stored === 'medium' || stored === 'large' || stored === 'extra-large'
    ? stored
    : 'small';
};

// Grid size configurations - controls card size, icon and text scale together
const gridConfigs = {
  'small': {
    minWidth: '140px',
    compactMinWidth: '100px',
    iconScale: '0.7',
    textScale: '0.8',
    paddingScale: '0.7'
  },
  'medium': {
    minWidth: '180px',
    compactMinWidth: '130px',
    iconScale: '0.85',
    textScale: '0.9',
    paddingScale: '0.85'
  },
  'large': {
    minWidth: '220px',
    compactMinWidth: '160px',
    iconScale: '1',
    textScale: '1',
    paddingScale: '1'
  },
  'extra-large': {
    minWidth: '280px',
    compactMinWidth: '200px',
    iconScale: '1.2',
    textScale: '1.1',
    paddingScale: '1.15'
  }
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [gridSize, setGridSize] = useState<GridSize>(getInitialGridSize);
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('ui_dark_mode') === 'true'
  );
  const [compactMode, setCompactMode] = useState(() => 
    shouldApplyDefaults()
      ? true
      : localStorage.getItem('ui_compact_mode') === 'true' || !localStorage.getItem('ui_compact_mode')
  );
  const [transparentMode, setTransparentMode] = useState(() =>
    shouldApplyDefaults()
      ? false
      : localStorage.getItem('ui_transparent_mode') === 'true'
  );
  const [contentSidePadding, setContentSidePadding] = useState(() => {
    if (shouldApplyDefaults()) {
      return DEFAULT_CONTENT_SIDE_PADDING;
    }
    const raw = Number(localStorage.getItem('ui_content_side_padding') || String(DEFAULT_CONTENT_SIDE_PADDING));
    if (!Number.isFinite(raw)) {
      return DEFAULT_CONTENT_SIDE_PADDING;
    }
    // 如果之前的默认值是旧的 9.5，就自动迁移到 20，确保“所有人默认都变成 20”
    return raw === LEGACY_CONTENT_SIDE_PADDING ? DEFAULT_CONTENT_SIDE_PADDING : raw;
  });

  useEffect(() => {
    if (!shouldApplyDefaults()) {
      return;
    }
    localStorage.setItem('ui_defaults_version', DEFAULTS_VERSION);
    localStorage.setItem('ui_transparent_mode', 'false');
    setTransparentMode(false);
    localStorage.setItem('ui_content_side_padding', String(DEFAULT_CONTENT_SIDE_PADDING));
    setContentSidePadding(DEFAULT_CONTENT_SIDE_PADDING);
  }, []);

  useEffect(() => {
    localStorage.setItem('ui_grid_size', gridSize);
    
    // Update CSS custom properties
    const config = gridConfigs[gridSize];
    document.documentElement.style.setProperty('--grid-min-width', config.minWidth);
    document.documentElement.style.setProperty('--grid-compact-min-width', config.compactMinWidth);
    document.documentElement.style.setProperty('--icon-scale', config.iconScale);
    document.documentElement.style.setProperty('--text-scale', config.textScale);
    document.documentElement.style.setProperty('--padding-scale', config.paddingScale);
    
    console.log('Grid size updated:', gridSize, config);
  }, [gridSize]);

  useEffect(() => {
    document.body.classList.toggle('theme-dark', darkMode);
    localStorage.setItem('ui_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle('transparent-mode', transparentMode);
    localStorage.setItem('ui_transparent_mode', String(transparentMode));
  }, [transparentMode]);

  useEffect(() => {
    const value = Number.isFinite(contentSidePadding) ? contentSidePadding : DEFAULT_CONTENT_SIDE_PADDING;
    document.documentElement.style.setProperty('--content-side-padding', `${value}rem`);
    localStorage.setItem('ui_content_side_padding', String(value));
  }, [contentSidePadding]);

  useEffect(() => {
    localStorage.setItem('ui_compact_mode', String(compactMode));
  }, [compactMode]);


  const getGridColumns = useCallback(() => {
    const config = gridConfigs[gridSize];
    return `repeat(auto-fill, minmax(${config.minWidth}, 1fr))`;
  }, [gridSize]);

  const getCompactGridColumns = useCallback(() => {
    const config = gridConfigs[gridSize];
    return `repeat(auto-fill, minmax(${config.compactMinWidth}, 1fr))`;
  }, [gridSize]);

  const value = useMemo(() => ({
    gridSize,
    setGridSize,
    getGridColumns,
    getCompactGridColumns,
    darkMode,
    setDarkMode,
    compactMode,
    setCompactMode,
    transparentMode,
    setTransparentMode,
    contentSidePadding,
    setContentSidePadding
  }), [gridSize, getGridColumns, getCompactGridColumns, darkMode, compactMode, transparentMode, contentSidePadding]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
