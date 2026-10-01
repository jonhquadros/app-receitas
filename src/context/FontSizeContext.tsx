import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontScaleLevel = 0 | 1 | 2; // 0: Normal (18px base), 1: Grande (20px base), 2: Muito Grande (23px base)

interface FontSizeContextType {
  fontScale: FontScaleLevel;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  fontScaleLabel: string;
  // Utility Tailwind class generator helper for recipe text
  getTextSizeClass: (base: 'body' | 'title' | 'subtitle' | 'step') => string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState<FontScaleLevel>(() => {
    const saved = localStorage.getItem('neco_font_scale');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (parsed === 0 || parsed === 1 || parsed === 2) {
        return parsed as FontScaleLevel;
      }
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('neco_font_scale', fontScale.toString());
  }, [fontScale]);

  const increaseFontSize = () => {
    setFontScale((prev) => (prev < 2 ? ((prev + 1) as FontScaleLevel) : prev));
  };

  const decreaseFontSize = () => {
    setFontScale((prev) => (prev > 0 ? ((prev - 1) as FontScaleLevel) : prev));
  };

  const resetFontSize = () => {
    setFontScale(0);
  };

  const fontScaleLabel = fontScale === 0 ? 'Normal' : fontScale === 1 ? 'Grande' : 'Muito Grande';

  const getTextSizeClass = (type: 'body' | 'title' | 'subtitle' | 'step'): string => {
    if (type === 'body') {
      if (fontScale === 0) return 'text-[18px] leading-[1.6]';
      if (fontScale === 1) return 'text-[21px] leading-[1.65]';
      return 'text-[24px] leading-[1.7]';
    }
    if (type === 'title') {
      if (fontScale === 0) return 'text-[24px] md:text-[28px] font-bold';
      if (fontScale === 1) return 'text-[28px] md:text-[32px] font-bold';
      return 'text-[32px] md:text-[36px] font-bold';
    }
    if (type === 'subtitle') {
      if (fontScale === 0) return 'text-[20px] font-semibold';
      if (fontScale === 1) return 'text-[23px] font-semibold';
      return 'text-[26px] font-semibold';
    }
    if (type === 'step') {
      if (fontScale === 0) return 'text-[19px] leading-[1.6] font-medium';
      if (fontScale === 1) return 'text-[22px] leading-[1.65] font-medium';
      return 'text-[25px] leading-[1.7] font-medium';
    }
    return 'text-[18px]';
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontScale,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        fontScaleLabel,
        getTextSizeClass,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
