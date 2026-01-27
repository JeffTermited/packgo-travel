/**
 * StickyNav Component (Sipincollection Style)
 * 固定導航列，顯示行程名稱和快速連結
 */

import React from "react";

export interface StickyNavProps {
  tourTitle: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const StickyNav: React.FC<StickyNavProps> = ({ tourTitle, colorTheme }) => {
  const navItems = [
    { label: "行程特色", href: "#features" },
    { label: "每日行程", href: "#itinerary" },
    { label: "飯店介紹", href: "#hotels" },
    { label: "費用說明", href: "#cost" },
    { label: "出發日期", href: "#departures" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // StickyNav height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className="sticky top-20 z-40 bg-white border-b shadow-sm"
      style={{
        backgroundColor: colorTheme.secondary + "20", // 20% opacity
        borderBottomColor: colorTheme.primary + "20",
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* 行程名稱 */}
          <h2
            className="text-sm lg:text-base font-bold truncate max-w-[300px] lg:max-w-[500px]"
            style={{ color: colorTheme.primary }}
            title={tourTitle}
          >
            {tourTitle.length > 40 ? tourTitle.slice(0, 40) + '...' : tourTitle}
          </h2>

          {/* 快速連結 */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-sm lg:text-base font-medium hover:underline transition-all"
                style={{
                  color: colorTheme.primary,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
