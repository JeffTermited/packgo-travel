/**
 * 預設設計規範
 * 當 DesignLearningAgent 的 LLM 分析失敗時，使用此預設值
 * 基於 sipincollection.com 的設計風格分析
 */

export interface DesignGuideline {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textLight: string;
    background: string;
    backgroundDark: string;
  };
  typography: {
    titleSize: string;
    titleWeight: string;
    subtitleSize: string;
    bodySize: string;
    lineHeight: number;
    fontFamily: string;
  };
  spacing: {
    sectionPadding: string;
    sectionGap: string;
    paragraphGap: string;
    imageMargin: string;
  };
  layout: {
    heroImageHeight: string;
    contentMaxWidth: string;
    imageTextRatio: string;
    alternatingLayout: boolean;
    verticalTitle: boolean;
  };
  components?: {
    heroCard?: {
      position: string;
      width: string;
      padding: string;
      backgroundColor: string;
      textColor: string;
    };
    flightTable?: {
      borderColor: string;
      headerBackgroundColor: string;
      rowHoverColor: string;
    };
    attractionBlock?: {
      imageWidth: string;
      textWidth: string;
      gap: string;
      imageBorderRadius: string;
    };
    dayNavigation?: {
      position: string;
      width: string;
      itemHeight: string;
      activeColor: string;
    };
  };
  responsiveBreakpoints?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  responsiveAdjustments?: {
    mobile?: Partial<DesignGuideline['layout']> & {
      titleSize?: string;
      sectionPadding?: string;
    };
    tablet?: Partial<DesignGuideline['layout']> & {
      titleSize?: string;
      sectionPadding?: string;
    };
  };
  animations?: {
    fadeIn?: {
      duration: string;
      easing: string;
    };
    slideIn?: {
      duration: string;
      easing: string;
    };
    imageHover?: {
      scale: string;
      duration: string;
    };
  };
  accessibility?: {
    minContrastRatio?: string;
    focusOutlineColor?: string;
    focusOutlineWidth?: string;
  };
}

/**
 * 預設設計規範常數
 */
export const DEFAULT_DESIGN_GUIDELINE: DesignGuideline = {
  colorScheme: {
    primary: '#C9B8A8',
    secondary: '#FFFFFF',
    accent: '#8B7355',
    text: '#333333',
    textLight: '#666666',
    background: '#F5F5F5',
    backgroundDark: '#E0E0E0'
  },
  typography: {
    titleSize: '2.5rem',
    titleWeight: '700',
    subtitleSize: '1.5rem',
    bodySize: '1rem',
    lineHeight: 1.8,
    fontFamily: '"Noto Serif TC", "Times New Roman", serif'
  },
  spacing: {
    sectionPadding: '4rem',
    sectionGap: '6rem',
    paragraphGap: '1.5rem',
    imageMargin: '2rem'
  },
  layout: {
    heroImageHeight: '100vh',
    contentMaxWidth: '1200px',
    imageTextRatio: '50:50',
    alternatingLayout: true,
    verticalTitle: false
  },
  components: {
    heroCard: {
      position: 'bottom-right',
      width: '400px',
      padding: '2rem',
      backgroundColor: 'var(--primary-color)',
      textColor: '#FFFFFF'
    },
    flightTable: {
      borderColor: '#E0E0E0',
      headerBackgroundColor: '#F5F5F5',
      rowHoverColor: '#FAFAFA'
    },
    attractionBlock: {
      imageWidth: '50%',
      textWidth: '50%',
      gap: '3rem',
      imageBorderRadius: '8px'
    },
    dayNavigation: {
      position: 'left',
      width: '80px',
      itemHeight: '60px',
      activeColor: 'var(--accent-color)'
    }
  },
  responsiveBreakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px'
  },
  responsiveAdjustments: {
    mobile: {
      heroImageHeight: '60vh',
      titleSize: '1.75rem',
      sectionPadding: '2rem',
      imageTextRatio: '100:100',
      alternatingLayout: false
    },
    tablet: {
      heroImageHeight: '80vh',
      titleSize: '2rem',
      sectionPadding: '3rem'
    }
  },
  animations: {
    fadeIn: {
      duration: '0.6s',
      easing: 'ease-out'
    },
    slideIn: {
      duration: '0.8s',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    imageHover: {
      scale: '1.05',
      duration: '0.3s'
    }
  },
  accessibility: {
    minContrastRatio: '4.5:1',
    focusOutlineColor: 'var(--accent-color)',
    focusOutlineWidth: '2px'
  }
};

/**
 * 根據目的地調整配色方案
 */
export function adjustColorSchemeByDestination(destination: string): Partial<DesignGuideline['colorScheme']> {
  const lowerDest = destination.toLowerCase();

  // 日本：櫻花粉 + 深灰
  if (lowerDest.includes('日本') || lowerDest.includes('japan') || lowerDest.includes('tokyo') || lowerDest.includes('kyoto')) {
    return {
      primary: '#FFB7C5',
      accent: '#8B4789',
      text: '#2C2C2C'
    };
  }

  // 韓國：現代藍 + 紫
  if (lowerDest.includes('韓國') || lowerDest.includes('korea') || lowerDest.includes('seoul')) {
    return {
      primary: '#4A90E2',
      accent: '#9B59B6',
      text: '#2C3E50'
    };
  }

  // 泰國：金黃 + 橙
  if (lowerDest.includes('泰國') || lowerDest.includes('thailand') || lowerDest.includes('bangkok')) {
    return {
      primary: '#F39C12',
      accent: '#E67E22',
      text: '#34495E'
    };
  }

  // 法國：優雅藍 + 金
  if (lowerDest.includes('法國') || lowerDest.includes('france') || lowerDest.includes('paris')) {
    return {
      primary: '#2C3E50',
      accent: '#D4AF37',
      text: '#1C2833'
    };
  }

  // 義大利：托斯卡尼橙 + 橄欖綠
  if (lowerDest.includes('義大利') || lowerDest.includes('italy') || lowerDest.includes('rome')) {
    return {
      primary: '#E67E22',
      accent: '#27AE60',
      text: '#2C3E50'
    };
  }

  // 美國：星條藍 + 紅
  if (lowerDest.includes('美國') || lowerDest.includes('usa') || lowerDest.includes('america')) {
    return {
      primary: '#3498DB',
      accent: '#E74C3C',
      text: '#2C3E50'
    };
  }

  // 澳洲：海洋藍 + 陽光黃
  if (lowerDest.includes('澳洲') || lowerDest.includes('australia') || lowerDest.includes('sydney')) {
    return {
      primary: '#1ABC9C',
      accent: '#F1C40F',
      text: '#2C3E50'
    };
  }

  // 預設：使用原始配色
  return {};
}

/**
 * 合併預設設計規範和自定義調整
 */
export function mergeDesignGuideline(
  base: DesignGuideline = DEFAULT_DESIGN_GUIDELINE,
  overrides: Partial<DesignGuideline>
): DesignGuideline {
  return {
    colorScheme: { ...base.colorScheme, ...overrides.colorScheme },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    layout: { ...base.layout, ...overrides.layout },
    components: { ...base.components, ...overrides.components },
    responsiveBreakpoints: { ...base.responsiveBreakpoints, ...overrides.responsiveBreakpoints },
    responsiveAdjustments: { ...base.responsiveAdjustments, ...overrides.responsiveAdjustments },
    animations: { ...base.animations, ...overrides.animations },
    accessibility: { ...base.accessibility, ...overrides.accessibility }
  };
}
