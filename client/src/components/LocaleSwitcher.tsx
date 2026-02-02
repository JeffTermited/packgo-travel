import { useLocale, Language, Currency } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';

// 語言切換組件 - 黑白簡潔風格
export function LanguageSwitcher() {
  const { language, setLanguage, languageName } = useLocale();

  const languages: { code: Language; name: string }[] = [
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-sm font-normal text-black hover:bg-transparent hover:text-black/70 border-none"
        >
          <Globe className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">{languageName}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-white border border-gray-200 rounded-lg shadow-lg">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer rounded-md ${
              language === lang.code 
                ? 'bg-black text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 幣值切換組件 - 黑白簡潔風格
export function CurrencySwitcher() {
  const { currency, setCurrency, currencySymbol } = useLocale();

  const currencies: { code: Currency; name: string; symbol: string }[] = [
    { code: 'TWD', name: 'NTS', symbol: 'NT$' },
    { code: 'USD', name: 'USD', symbol: '$' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-sm font-normal text-black hover:bg-transparent hover:text-black/70 border-none"
        >
          <span className="font-medium">$</span>
          <span className="hidden sm:inline ml-1">{currencySymbol}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-200 rounded-lg shadow-lg">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className={`cursor-pointer rounded-md ${
              currency === curr.code 
                ? 'bg-black text-white' 
                : 'hover:bg-gray-100'
            }`}
          >
            <span className="font-mono mr-2">{curr.symbol}</span>
            {curr.code}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-gray-200" />
        <div className="px-2 py-1.5 text-[10px] text-gray-500 leading-tight">
          ※ 轉換價格僅供參考
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 組合組件 - 同時顯示語言和幣值切換
export function LocaleSwitcher() {
  return (
    <div className="flex items-center">
      <LanguageSwitcher />
      <CurrencySwitcher />
    </div>
  );
}

export default LocaleSwitcher;
