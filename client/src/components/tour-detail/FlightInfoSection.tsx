/**
 * FlightInfoSection Component
 * 航班資訊區塊 - 顯示去回程航班詳情
 */

import React from "react";
import { Plane, Clock, MapPin } from "lucide-react";
import { ensureReadableOnWhite } from "@/lib/colorUtils";
import { useLocale } from "@/contexts/LocaleContext";

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
  const { t } = useLocale();

  if (!flightInfo) {
    return null;
  }

  const { airline, outbound, inbound, description, features = [] } = flightInfo;

  return (
    <section id="flights" className="w-full py-8 lg:py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-2xl lg:text-3xl font-serif font-bold text-center mb-6"
          style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
        >
          {t('tourDetail.transport.flightInfo')}
        </h2>

        {/* Airline & Description */}
        {(airline || description) && (
          <div className="text-center mb-6">
            {airline && (
              <p className="text-lg font-bold mb-1.5" style={{ color: ensureReadableOnWhite(colorTheme.primary) }}>
                {airline}
              </p>
            )}
            {description && (
              <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed text-sm">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Outbound Flight */}
          {outbound && (
            <div className="bg-gray-50 rounded-none p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-none"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <Plane
                    className="h-4 w-4"
                    style={{ color: ensureReadableOnWhite(colorTheme.accent) }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {t('tourDetail.transport.outboundFlight')}
                </h3>
              </div>

              <div className="space-y-3">
                {outbound.flightNo && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-600 min-w-[80px]">{t('tourDetail.transport.flightNo')}</span>
                    <span className="text-gray-900 font-bold">{outbound.flightNo}</span>
                  </div>
                )}

                {outbound.departureAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{outbound.departureAirport}</p>
                      {outbound.departureTime && (
                        <p className="text-sm text-gray-600">{t('tourDetail.transport.flightDeparture')}{outbound.departureTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {outbound.arrivalAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{outbound.arrivalAirport}</p>
                      {outbound.arrivalTime && (
                        <p className="text-sm text-gray-600">{t('tourDetail.transport.flightArrival')}{outbound.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {outbound.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <span className="text-gray-900">{t('tourDetail.transport.flightDuration')}{outbound.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inbound Flight */}
          {inbound && (
            <div className="bg-gray-50 rounded-none p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-none"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <Plane
                    className="h-4 w-4 transform rotate-180"
                    style={{ color: ensureReadableOnWhite(colorTheme.accent) }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {t('tourDetail.transport.inboundFlight')}
                </h3>
              </div>

              <div className="space-y-3">
                {inbound.flightNo && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-600 min-w-[80px]">{t('tourDetail.transport.flightNo')}</span>
                    <span className="text-gray-900 font-bold">{inbound.flightNo}</span>
                  </div>
                )}

                {inbound.departureAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{inbound.departureAirport}</p>
                      {inbound.departureTime && (
                        <p className="text-sm text-gray-600">{t('tourDetail.transport.flightDeparture')}{inbound.departureTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {inbound.arrivalAirport && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{inbound.arrivalAirport}</p>
                      {inbound.arrivalTime && (
                        <p className="text-sm text-gray-600">{t('tourDetail.transport.flightArrival')}{inbound.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {inbound.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <span className="text-gray-900">{t('tourDetail.transport.flightDuration')}{inbound.duration}</span>
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
                className="px-4 py-2 rounded-none text-sm font-medium"
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
