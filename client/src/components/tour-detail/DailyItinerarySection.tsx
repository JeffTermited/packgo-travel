/**
 * DailyItinerarySection Component
 * 每日行程區塊 - 顯示完整的每日活動安排
 */

import React from "react";
import { Clock, MapPin, Car } from "lucide-react";

export interface DailyItinerary {
  day: number;
  title: string;
  activities: Array<{
    time: string;
    title: string;
    description: string;
    transportation?: string;
    location?: string;
  }>;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: string;
}

export interface DailyItinerarySectionProps {
  itineraries: DailyItinerary[];
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const DailyItinerarySection: React.FC<DailyItinerarySectionProps> = ({
  itineraries,
  colorTheme,
}) => {
  if (!itineraries || itineraries.length === 0) {
    return null;
  }

  return (
    <section id="itinerary" className="w-full py-8 lg:py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-2xl lg:text-3xl font-serif font-bold text-center mb-6 lg:mb-8"
          style={{ color: colorTheme.primary }}
        >
          每日行程
        </h2>

        <div className="space-y-8">
          {itineraries.map((day, dayIndex) => (
            <div
              key={day.day}
              className="relative"
            >
              {/* Day Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg text-white"
                  style={{ backgroundColor: colorTheme.accent }}
                >
                  Day {day.day}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: colorTheme.primary }}
                  >
                    {day.title}
                  </h3>
                </div>
              </div>

              {/* Activities */}
              <div className="ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
                {day.activities.map((activity, actIndex) => (
                  <div
                    key={actIndex}
                    className="relative pb-6 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div
                      className="absolute -left-[29px] top-2 w-3 h-3 rounded-full border-3 border-white"
                      style={{ backgroundColor: colorTheme.accent }}
                    />

                    {/* Activity Content */}
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Time & Title */}
                      <div className="flex items-start gap-2 mb-2">
                        <Clock
                          className="h-4 w-4 flex-shrink-0 mt-1"
                          style={{ color: colorTheme.accent }}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {activity.time}
                          </p>
                          <h4
                            className="text-base font-bold"
                            style={{ color: colorTheme.primary }}
                          >
                            {activity.title}
                          </h4>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {activity.description}
                      </p>

                      {/* Location & Transportation */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {activity.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" style={{ color: colorTheme.accent }} />
                            <span>{activity.location}</span>
                          </div>
                        )}
                        {activity.transportation && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Car className="h-4 w-4" style={{ color: colorTheme.accent }} />
                            <span>{activity.transportation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meals & Accommodation */}
              <div className="mt-4 ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Meals */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5
                    className="font-bold mb-3"
                    style={{ color: colorTheme.primary }}
                  >
                    餐食安排
                  </h5>
                  <div className="space-y-2 text-sm text-gray-700">
                    {day.meals.breakfast && (
                      <p>
                        <span className="font-medium">早餐：</span>
                        {day.meals.breakfast}
                      </p>
                    )}
                    {day.meals.lunch && (
                      <p>
                        <span className="font-medium">午餐：</span>
                        {day.meals.lunch}
                      </p>
                    )}
                    {day.meals.dinner && (
                      <p>
                        <span className="font-medium">晚餐：</span>
                        {day.meals.dinner}
                      </p>
                    )}
                  </div>
                </div>

                {/* Accommodation */}
                {day.accommodation && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5
                      className="font-bold mb-3"
                      style={{ color: colorTheme.primary }}
                    >
                      住宿安排
                    </h5>
                    <p className="text-sm text-gray-700">{day.accommodation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
