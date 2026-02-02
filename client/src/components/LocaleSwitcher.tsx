import { useLocale, Language, Currency, languageNames, currencyInfo } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Globe, DollarSign, ChevronDown } from 'lucide-react';

// 語言切換組件
export function LanguageSwitcher() {
  const { language, setLanguage, languageName } = useLocale();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-sm font-normal">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{languageName}</span>
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          選擇語言 / Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
            {language === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 幣值切換組件
export function CurrencySwitcher() {
  const { currency, setCurrency, currencySymbol, currencyName } = useLocale();

  const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'TWD', name: '新台幣 (TWD)', symbol: 'NT$' },
    { code: 'USD', name: '美金 (USD)', symbol: '$' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-sm font-normal">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{currencySymbol}</span>
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          選擇幣值 / Currency
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className={currency === curr.code ? 'bg-accent' : ''}
          >
            <span className="font-mono mr-2">{curr.symbol}</span>
            {curr.name}
            {currency === curr.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground leading-tight">
          ※ 轉換價格僅供參考，實際價格以屆時人員提供的報價為準
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 組合組件 - 同時顯示語言和幣值切換
export function LocaleSwitcher() {
  return (
    <div className="flex items-center gap-1">
      <LanguageSwitcher />
      <CurrencySwitcher />
    </div>
  );
}

export default LocaleSwitcher;
