import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, ReactNode } from 'react';
import { Language, LANGUAGES, STORAGE_KEY, isLanguage, translate } from '../i18n';
import { setDomLanguage, startDomTranslator } from '../i18n/domTranslator';

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: { code: Language; name: string }[];
  /** Translate a string from the central dictionaries; falls back to the English text. */
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const readSaved = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    /* storage unavailable (private mode): stay on English */
  }
  return 'en';
};

/** The previous implementation used Google Translate cookies; make sure they cannot interfere. */
const clearLegacyCookies = () => {
  try {
    const expired = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; ${expired}`;
    document.cookie = `googtrans=; ${expired} domain=${window.location.hostname};`;
  } catch {
    /* ignore */
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(readSaved);

  // Runs after the first render's DOM exists but before paint: no flash of English for saved Tamil/Hindi.
  useLayoutEffect(() => {
    clearLegacyCookies();
    document.documentElement.lang = language;
    startDomTranslator(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
    setDomLanguage(lang);
  }, []);

  const t = useCallback((text: string) => translate(language, text), [language]);

  const languages = useMemo(() => LANGUAGES.map(l => ({ code: l.code, name: l.label })), []);

  const value = useMemo(() => ({ language, setLanguage, languages, t }), [language, setLanguage, languages, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
