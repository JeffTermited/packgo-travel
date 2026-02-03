import { useLocale, Currency } from '@/contexts/LocaleContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface PriceDisplayProps {
  /** 價格 */
  price: number;
  /** 原始價格的貨幣（預設為 TWD） */
  originalCurrency?: Currency;
  /** 是否顯示免責聲明提示 */
  showDisclaimer?: boolean;
  /** 自訂樣式類別 */
  className?: string;
  /** 價格大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否顯示「起」字 */
  showFrom?: boolean;
  /** 原價（用於顯示折扣） */
  originalPrice?: number;
}

/**
 * 價格顯示組件 - 自動根據用戶選擇的幣值進行轉換
 * 支援指定原始貨幣，會根據即時匯率進行轉換
 */
export function PriceDisplay({
  price,
  originalCurrency = 'TWD',
  showDisclaimer = false,
  className = '',
  size = 'md',
  showFrom = false,
  originalPrice,
}: PriceDisplayProps) {
  const { currency, formatPrice, rateDisclaimer } = useLocale();

  // 根據 size 決定字體大小
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl font-bold',
  };

  const formattedPrice = formatPrice(price, originalCurrency);
  const formattedOriginalPrice = originalPrice ? formatPrice(originalPrice, originalCurrency) : null;
  // 當目標貨幣與原始貨幣不同時，顯示轉換提示
  const isConverted = currency !== originalCurrency;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {/* 原價（如果有折扣） */}
      {formattedOriginalPrice && (
        <span className="text-muted-foreground line-through text-sm mr-1">
          {formattedOriginalPrice}
        </span>
      )}
      
      {/* 主要價格 */}
      <span className={sizeClasses[size]}>
        {formattedPrice}
      </span>
      
      {/* 「起」字 */}
      {showFrom && (
        <span className="text-sm text-muted-foreground">起</span>
      )}
      
      {/* 轉換提示（當使用非原始貨幣時） */}
      {isConverted && showDisclaimer && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs">
            <p>{rateDisclaimer}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

/**
 * 價格範圍顯示組件
 */
export function PriceRangeDisplay({
  minPrice,
  maxPrice,
  originalCurrency = 'TWD',
  className = '',
  size = 'md',
}: {
  minPrice: number;
  maxPrice: number;
  originalCurrency?: Currency;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const { formatPrice, currency, rateDisclaimer } = useLocale();
  const isConverted = currency !== originalCurrency;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={sizeClasses[size]}>
        {formatPrice(minPrice, originalCurrency)} - {formatPrice(maxPrice, originalCurrency)}
      </span>
      {isConverted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs">
            <p>{rateDisclaimer}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

export default PriceDisplay;
