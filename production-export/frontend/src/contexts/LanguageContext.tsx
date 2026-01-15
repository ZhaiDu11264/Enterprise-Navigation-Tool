import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const stored = localStorage.getItem('ui_language') as Language | null;
  return stored === 'en' || stored === 'zh' ? stored : 'zh';
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('ui_language', language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
