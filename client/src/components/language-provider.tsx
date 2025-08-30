import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('burkebooks-language');
    if (saved && ['af', 'en', 'nl'].includes(saved)) {
      return saved as Language;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('af')) return 'af';
    if (browserLang.startsWith('nl')) return 'nl';
    if (browserLang.startsWith('en')) return 'en';
    
    // Default to Afrikaans
    return 'af';
  });

  useEffect(() => {
    localStorage.setItem('burkebooks-language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { t } = useLanguage();
  return t;
}