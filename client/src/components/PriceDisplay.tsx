import { useLocale } from '@/contexts/LocaleContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface PriceDisplayProps {
  /** 價格（以台幣為基準） */
  price: number;
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
 */
export function PriceDisplay({
  price,
  showDisclaimer = false,
  className = '',
  size = 'md',
  showFrom = false,
  originalPrice,
}: PriceDisplayProps) {
  const { currency, formatPrice, currencySymbol } = useLocale();

  // 根據 size 決定字體大小
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl font-bold',
  };

  const formattedPrice = formatPrice(price);
  const formattedOriginalPrice = originalPrice ? formatPrice(originalPrice) : null;
  const isConverted = currency !== 'TWD';

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
      
      {/* 轉換提示（當使用非台幣時） */}
      {isConverted && showDisclaimer && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs">
            <p>轉換價格僅供參考，實際價格以屆時人員提供的報價為準</p>
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
  className = '',
  size = 'md',
}: {
  minPrice: number;
  maxPrice: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const { formatPrice, currency } = useLocale();
  const isConverted = currency !== 'TWD';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className={sizeClasses[size]}>
        {formatPrice(minPrice)} - {formatPrice(maxPrice)}
      </span>
      {isConverted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs">
            <p>轉換價格僅供參考，實際價格以屆時人員提供的報價為準</p>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

export default PriceDisplay;
