/**
 * LionAttractionsSection.tsx
 * 雄獅旅遊風格的景點卡片組件
 * 採用網格佈局展示景點資訊
 */

import React from "react";
import { MapPin, Star } from "lucide-react";

interface Attraction {
  id: number;
  name: string;
  description: string;
  image?: string;
  category?: string;
  rating?: number;
  visitDuration?: string;
}

interface LionAttractionsSectionProps {
  attractions: Attraction[];
  title?: string;
}

export function LionAttractionsSection({
  attractions,
  title = "行程特色景點",
}: LionAttractionsSectionProps) {
  if (!attractions || attractions.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container-lion">
        {/* Section 標題 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <div className="w-16 h-1 bg-red-600"></div>
        </div>

        {/* 景點網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div
              key={attraction.id}
              className="card-lion overflow-hidden group cursor-pointer"
            >
              {/* 景點圖片 */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={
                    attraction.image ||
                    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
                  }
                  alt={attraction.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {attraction.category && (
                  <div className="absolute top-3 left-3">
                    <span className="tag-lion-primary">{attraction.category}</span>
                  </div>
                )}
                {attraction.rating && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{attraction.rating}</span>
                  </div>
                )}
              </div>

              {/* 景點資訊 */}
              <div className="p-4">
                {/* 景點名稱 */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
                  {attraction.name}
                </h3>

                {/* 景點描述 */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {attraction.description}
                </p>

                {/* 底部資訊 */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>景點</span>
                  </div>
                  {attraction.visitDuration && (
                    <span className="text-gray-400">{attraction.visitDuration}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多按鈕 (如果景點數量超過 6 個) */}
        {attractions.length > 6 && (
          <div className="mt-8 text-center">
            <button className="btn-lion-secondary">
              查看所有景點 ({attractions.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
