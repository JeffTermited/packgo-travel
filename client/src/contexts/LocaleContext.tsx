import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// 支援的語言
export type Language = 'zh-TW' | 'en' | 'es';

// 支援的幣值
export type Currency = 'TWD' | 'USD';

// 語言顯示名稱
export const languageNames: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
  'es': 'Español',
};

// 幣值顯示名稱和符號
export const currencyInfo: Record<Currency, { name: string; symbol: string; rate: number }> = {
  'TWD': { name: '新台幣', symbol: 'NT$', rate: 1 },
  'USD': { name: '美金', symbol: '$', rate: 0.031 }, // 約略匯率，實際以報價為準
};

interface LocaleContextType {
  // 語言相關
  language: Language;
  setLanguage: (lang: Language) => void;
  languageName: string;
  
  // 幣值相關
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  currencySymbol: string;
  currencyName: string;
  
  // 價格轉換函數
  convertPrice: (priceInTWD: number) => number;
  formatPrice: (priceInTWD: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // 從 localStorage 讀取初始值，預設繁體中文和台幣
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('packgo-language');
      if (saved && ['zh-TW', 'en', 'es'].includes(saved)) {
        return saved as Language;
      }
    }
    return 'zh-TW';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('packgo-currency');
      if (saved && ['TWD', 'USD'].includes(saved)) {
        return saved as Currency;
      }
    }
    return 'TWD';
  });

  // 設定語言並儲存到 localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('packgo-language', lang);
    }
  }, []);

  // 設定幣值並儲存到 localStorage
  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('packgo-currency', curr);
    }
  }, []);

  // 價格轉換（從台幣轉換到目標幣值）
  const convertPrice = useCallback((priceInTWD: number): number => {
    const rate = currencyInfo[currency].rate;
    return Math.round(priceInTWD * rate);
  }, [currency]);

  // 格式化價格顯示
  const formatPrice = useCallback((priceInTWD: number): string => {
    const converted = convertPrice(priceInTWD);
    const symbol = currencyInfo[currency].symbol;
    return `${symbol}${converted.toLocaleString()}`;
  }, [currency, convertPrice]);

  const value: LocaleContextType = {
    language,
    setLanguage,
    languageName: languageNames[language],
    currency,
    setCurrency,
    currencySymbol: currencyInfo[currency].symbol,
    currencyName: currencyInfo[currency].name,
    convertPrice,
    formatPrice,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
