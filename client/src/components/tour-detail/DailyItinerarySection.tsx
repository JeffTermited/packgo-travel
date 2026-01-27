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
    <section id="itinerary" className="w-full py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl lg:text-4xl font-serif font-bold text-center mb-8 lg:mb-12"
          style={{ color: colorTheme.primary }}
        >
          每日行程
        </h2>

        <div className="space-y-12">
          {itineraries.map((day, dayIndex) => (
            <div
              key={day.day}
              className="relative"
            >
              {/* Day Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl text-white"
                  style={{ backgroundColor: colorTheme.accent }}
                >
                  Day {day.day}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: colorTheme.primary }}
                  >
                    {day.title}
                  </h3>
                </div>
              </div>

              {/* Activities */}
              <div className="ml-8 border-l-2 border-gray-200 pl-8 space-y-6">
                {day.activities.map((activity, actIndex) => (
                  <div
                    key={actIndex}
                    className="relative pb-6 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div
                      className="absolute -left-[37px] top-2 w-4 h-4 rounded-full border-4 border-white"
                      style={{ backgroundColor: colorTheme.accent }}
                    />

                    {/* Activity Content */}
                    <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Time & Title */}
                      <div className="flex items-start gap-3 mb-3">
                        <Clock
                          className="h-5 w-5 flex-shrink-0 mt-1"
                          style={{ color: colorTheme.accent }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {activity.time}
                          </p>
                          <h4
                            className="text-lg font-bold"
                            style={{ color: colorTheme.primary }}
                          >
                            {activity.title}
                          </h4>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 mb-4 leading-relaxed">
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
              <div className="mt-6 ml-8 grid grid-cols-1 md:grid-cols-2 gap-4">
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
