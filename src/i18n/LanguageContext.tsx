'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en.json';
import bn from './bn.json';

export type Locale = 'en' | 'bn';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, unknown>> = { en, bn };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Resolve a dot-notated key like "nav.home" from a nested JSON object.
 */
function getNestedValue(obj: Record<string, unknown>, key: string, currentLocale: Locale): string {
  const parts = key.split('.');
  
  // 1. Try current locale
  let current: unknown = obj;
  let found = true;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      found = false;
      break;
    }
  }
  if (found && typeof current === 'string' && current.trim() !== '') return current;

  // 2. Fallback to English if current locale isn't 'en'
  if (currentLocale !== 'en') {
    let enCurrent: unknown = translations.en;
    let enFound = true;
    for (const part of parts) {
      if (enCurrent && typeof enCurrent === 'object' && part in (enCurrent as Record<string, unknown>)) {
        enCurrent = (enCurrent as Record<string, unknown>)[part];
      } else {
        enFound = false;
        break;
      }
    }
    if (enFound && typeof enCurrent === 'string' && enCurrent.trim() !== '') return enCurrent;
  }

  // 3. Fallback to Bangla if current locale is 'en' but missing in 'en'
  if (currentLocale === 'en') {
    let bnCurrent: unknown = translations.bn;
    let bnFound = true;
    for (const part of parts) {
      if (bnCurrent && typeof bnCurrent === 'object' && part in (bnCurrent as Record<string, unknown>)) {
        bnCurrent = (bnCurrent as Record<string, unknown>)[part];
      } else {
        bnFound = false;
        break;
      }
    }
    if (bnFound && typeof bnCurrent === 'string' && bnCurrent.trim() !== '') return bnCurrent;
  }

  return ''; // Return empty string so JS || fallback works properly
}

const STORAGE_KEY = 'charulata-locale';

export function LanguageProvider({ 
  children,
  initialLocale = 'bn',
}: { 
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let resolvedLocale: Locale = initialLocale;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') as Locale | null;
      if (urlLang && (urlLang === 'en' || urlLang === 'bn')) {
        resolvedLocale = urlLang;
      } else {
        const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
        if (stored && (stored === 'en' || stored === 'bn')) {
          resolvedLocale = stored;
        }
      }
    }
    if (resolvedLocale && resolvedLocale !== initialLocale) {
      setLocaleState(resolvedLocale);
      document.documentElement.lang = resolvedLocale;
      try {
        document.cookie = `${STORAGE_KEY}=${resolvedLocale}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {}
    }
    setMounted(true);
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
        document.cookie = `${STORAGE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = newLocale;
      } catch {}
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[locale], key, locale);
    },
    [locale]
  );

  // Update the <html> lang attribute when locale changes
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [mounted, locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
