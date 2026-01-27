/**
 * FlightInfoSection Component
 * 航班資訊區塊 - 顯示去回程航班詳情
 */

import React from "react";
import { Plane, Clock, MapPin } from "lucide-react";

export interface FlightInfo {
  airline?: string;
  outbound?: {
    flightNo?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    departureAirport?: string;
    arrivalAirport?: string;
  };
  inbound?: {
    flightNo?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    departureAirport?: string;
    arrivalAirport?: string;
  };
  description?: string;
  features?: string[];
}

export interface FlightInfoSectionProps {
  flightInfo: FlightInfo;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const FlightInfoSection: React.FC<FlightInfoSectionProps> = ({
  flightInfo,
  colorTheme,
}) => {
  if (!flightInfo) {
    return null;
  }

  const { airline, outbound, inbound, description, features = [] } = flightInfo;

  return (
    <section id="flights" className="w-full py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl lg:text-4xl font-serif font-bold text-center mb-8 lg:mb-12"
          style={{ color: colorTheme.primary }}
        >
          航班資訊
        </h2>

        {/* Airline & Description */}
        {(airline || description) && (
          <div className="text-center mb-8">
            {airline && (
              <p className="text-xl font-bold mb-2" style={{ color: colorTheme.primary }}>
                {airline}
              </p>
            )}
            {description && (
              <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Outbound Flight */}
          {outbound && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <Plane
                    className="h-5 w-5"
                    style={{ color: colorTheme.accent }}
                  />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  去程航班
                </h3>
              </div>

              <div className="space-y-4">
                {outbound.flightNo && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-600 min-w-[80px]">航班編號：</span>
                    <span className="text-gray-900 font-bold">{outbound.flightNo}</span>
                  </div>
                )}

                {outbound.departureAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorTheme.accent }} />
                    <div>
                      <p className="text-gray-900 font-medium">{outbound.departureAirport}</p>
                      {outbound.departureTime && (
                        <p className="text-sm text-gray-600">起飛時間：{outbound.departureTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {outbound.arrivalAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorTheme.accent }} />
                    <div>
                      <p className="text-gray-900 font-medium">{outbound.arrivalAirport}</p>
                      {outbound.arrivalTime && (
                        <p className="text-sm text-gray-600">抵達時間：{outbound.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {outbound.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorTheme.accent }} />
                    <span className="text-gray-900">飛行時間：{outbound.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inbound Flight */}
          {inbound && (
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <Plane
                    className="h-5 w-5 transform rotate-180"
                    style={{ color: colorTheme.accent }}
                  />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: colorTheme.primary }}
                >
                  回程航班
                </h3>
              </div>

              <div className="space-y-4">
                {inbound.flightNo && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-600 min-w-[80px]">航班編號：</span>
                    <span className="text-gray-900 font-bold">{inbound.flightNo}</span>
                  </div>
                )}

                {inbound.departureAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorTheme.accent }} />
                    <div>
                      <p className="text-gray-900 font-medium">{inbound.departureAirport}</p>
                      {inbound.departureTime && (
                        <p className="text-sm text-gray-600">起飛時間：{inbound.departureTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {inbound.arrivalAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorTheme.accent }} />
                    <div>
                      <p className="text-gray-900 font-medium">{inbound.arrivalAirport}</p>
                      {inbound.arrivalTime && (
                        <p className="text-sm text-gray-600">抵達時間：{inbound.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {inbound.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colorTheme.accent }} />
                    <span className="text-gray-900">飛行時間：{inbound.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((feature, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: colorTheme.accent + "20",
                  color: colorTheme.primary,
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
