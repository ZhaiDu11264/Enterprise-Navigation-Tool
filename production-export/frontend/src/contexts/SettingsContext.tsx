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
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const getInitialGridSize = (): GridSize => {
  const stored = localStorage.getItem('ui_grid_size') as GridSize | null;
  return stored === 'small' || stored === 'medium' || stored === 'large' || stored === 'extra-large' 
    ? stored 
    : 'medium';
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
    localStorage.getItem('ui_compact_mode') === 'true'
  );
  const [transparentMode, setTransparentMode] = useState(() => 
    localStorage.getItem('ui_transparent_mode') === 'true'
  );

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
    localStorage.setItem('ui_compact_mode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    document.body.classList.toggle('transparent-mode', transparentMode);
    localStorage.setItem('ui_transparent_mode', String(transparentMode));
  }, [transparentMode]);


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
    setTransparentMode
  }), [gridSize, getGridColumns, getCompactGridColumns, darkMode, compactMode, transparentMode]);

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
