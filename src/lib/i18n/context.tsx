import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  dateLocale: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isRTL: false, dateLocale: 'id-ID' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false, dateLocale: 'en-US' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false, dateLocale: 'ja-JP' },
];

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLanguage: LanguageConfig;
  languages: LanguageConfig[];
  t: (key: keyof TranslationKeys) => string;
  isRTL: boolean;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const LANGUAGE_KEY = 'rafiq-nihon-language';

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
      return saved || 'id';
    }
    return 'id';
  });

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const isRTL = currentLanguage.isRTL;

  // Update document attributes when language changes
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Update CSS variable for RTL-aware styles
    document.documentElement.style.setProperty('--direction', isRTL ? 'rtl' : 'ltr');
  }, [language, isRTL]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
  }, []);

  // Translation function
  const t = useCallback((key: keyof TranslationKeys): string => {
    return translations[language]?.[key] || translations.id[key] || key;
  }, [language]);

  // Date formatting
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    return new Intl.DateTimeFormat(currentLanguage.dateLocale, defaultOptions).format(d);
  }, [currentLanguage.dateLocale]);

  // Time formatting
  const formatTime = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    return new Intl.DateTimeFormat(currentLanguage.dateLocale, defaultOptions).format(d);
  }, [currentLanguage.dateLocale]);

  // Relative time formatting
  const formatRelativeTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    const rtf = new Intl.RelativeTimeFormat(currentLanguage.dateLocale, { numeric: 'auto' });

    if (diffSecs < 60) {
      return rtf.format(-diffSecs, 'second');
    } else if (diffMins < 60) {
      return rtf.format(-diffMins, 'minute');
    } else if (diffHours < 24) {
      return rtf.format(-diffHours, 'hour');
    } else if (diffDays < 7) {
      return rtf.format(-diffDays, 'day');
    } else if (diffWeeks < 4) {
      return rtf.format(-diffWeeks, 'week');
    } else {
      return rtf.format(-diffMonths, 'month');
    }
  }, [currentLanguage.dateLocale]);

  // Number formatting
  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(currentLanguage.dateLocale, options).format(num);
  }, [currentLanguage.dateLocale]);

  // Currency formatting
  const formatCurrency = useCallback((amount: number, currency: string = 'IDR'): string => {
    return new Intl.NumberFormat(currentLanguage.dateLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [currentLanguage.dateLocale]);

  const value: I18nContextType = {
    language,
    setLanguage,
    currentLanguage,
    languages: LANGUAGES,
    t,
    isRTL,
    formatDate,
    formatTime,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// For backward compatibility
export function useTranslation() {
  const { t, language } = useI18n();
  return { t, language };
}

export function useLanguage() {
  const context = useI18n();
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    currentLanguage: context.currentLanguage,
    languages: context.languages,
  };
}
