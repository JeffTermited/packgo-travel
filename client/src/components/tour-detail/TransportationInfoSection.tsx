/**
 * TransportationInfoSection Component
 * 交通資訊區塊 - 支援飛機、火車、郵輪、自駕等多種交通方式
 */

import React from "react";
import { Plane, Train, Ship, Car, Bus, Clock, MapPin } from "lucide-react";
import { ensureReadableOnWhite } from "@/lib/colorUtils";
import { useLocale } from "@/contexts/LocaleContext";

// 交通類型
export type TransportationType = 'FLIGHT' | 'TRAIN' | 'CAR' | 'CRUISE' | 'BUS' | 'UNKNOWN';

// 統一的交通資訊格式
export interface TransportationInfo {
  type?: TransportationType;
  typeName?: string;
  
  // 通用欄位
  outbound?: {
    vehicleNo?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    departurePoint?: string;
    arrivalPoint?: string;
  };
  inbound?: {
    vehicleNo?: string;
    departureTime?: string;
    arrivalTime?: string;
    duration?: string;
    departurePoint?: string;
    arrivalPoint?: string;
  };
  
  description?: string;
  features?: string[];
  
  // 特定類型的額外資訊
  extra?: {
    trainType?: string;
    trainName?: string;
    route?: string[];
    airline?: string;
    cruiseLine?: string;
    shipName?: string;
    carType?: string;
    rentalCompany?: string;
  };
  
  // 向後相容舊的 FlightInfo 格式
  airline?: string;
}

export interface TransportationInfoSectionProps {
  transportationInfo: TransportationInfo;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// 根據交通類型獲取圖標
const getTransportIcon = (type?: TransportationType) => {
  switch (type) {
    case 'TRAIN':
      return Train;
    case 'CRUISE':
      return Ship;
    case 'CAR':
      return Car;
    case 'BUS':
      return Bus;
    case 'FLIGHT':
    default:
      return Plane;
  }
};

export const TransportationInfoSection: React.FC<TransportationInfoSectionProps> = ({
  transportationInfo,
  colorTheme,
}) => {
  const { t } = useLocale();

  if (!transportationInfo) {
    return null;
  }

  // 檢測交通類型
  const type = transportationInfo.type || 'FLIGHT';
  const typeName = transportationInfo.typeName || transportationInfo.extra?.trainName;
  
  // 根據交通類型獲取標題
  const getSectionTitle = () => {
    if (typeName) return t('tourDetail.transport.typeInfo').replace('{type}', typeName);
    switch (type) {
      case 'TRAIN': return t('tourDetail.transport.trainInfo');
      case 'CRUISE': return t('tourDetail.transport.cruiseInfo');
      case 'CAR': return t('tourDetail.transport.carInfo');
      case 'BUS': return t('tourDetail.transport.busInfo');
      default: return t('tourDetail.transport.flightInfo');
    }
  };

  // 根據交通類型獲取標籤文字
  const getLabels = () => {
    switch (type) {
      case 'TRAIN':
        return {
          outboundTitle: t('tourDetail.transport.outboundTrain'),
          inboundTitle: t('tourDetail.transport.inboundTrain'),
          vehicleNo: t('tourDetail.transport.trainNo'),
          departureTime: t('tourDetail.transport.trainDeparture'),
          arrivalTime: t('tourDetail.transport.trainArrival'),
          duration: t('tourDetail.transport.trainDuration'),
        };
      case 'CRUISE':
        return {
          outboundTitle: t('tourDetail.transport.outboundCruise'),
          inboundTitle: t('tourDetail.transport.inboundCruise'),
          vehicleNo: t('tourDetail.transport.cruiseNo'),
          departureTime: t('tourDetail.transport.cruiseDeparture'),
          arrivalTime: t('tourDetail.transport.cruiseArrival'),
          duration: t('tourDetail.transport.cruiseDuration'),
        };
      case 'CAR':
        return {
          outboundTitle: t('tourDetail.transport.outboundCar'),
          inboundTitle: t('tourDetail.transport.inboundCar'),
          vehicleNo: t('tourDetail.transport.carType'),
          departureTime: t('tourDetail.transport.carPickup'),
          arrivalTime: t('tourDetail.transport.carReturn'),
          duration: t('tourDetail.transport.carDuration'),
        };
      case 'BUS':
        return {
          outboundTitle: t('tourDetail.transport.outboundBus'),
          inboundTitle: t('tourDetail.transport.inboundBus'),
          vehicleNo: t('tourDetail.transport.busNo'),
          departureTime: t('tourDetail.transport.busDeparture'),
          arrivalTime: t('tourDetail.transport.busArrival'),
          duration: t('tourDetail.transport.busDuration'),
        };
      case 'FLIGHT':
      default:
        return {
          outboundTitle: t('tourDetail.transport.outboundFlight'),
          inboundTitle: t('tourDetail.transport.inboundFlight'),
          vehicleNo: t('tourDetail.transport.flightNo'),
          departureTime: t('tourDetail.transport.flightDeparture'),
          arrivalTime: t('tourDetail.transport.flightArrival'),
          duration: t('tourDetail.transport.flightDuration'),
        };
    }
  };

  // 獲取圖標和標籤
  const TransportIcon = getTransportIcon(type);
  const sectionTitle = getSectionTitle();
  const labels = getLabels();
  
  // 處理資料（向後相容舊格式）
  const outbound = transportationInfo.outbound;
  const inbound = transportationInfo.inbound;
  const description = transportationInfo.description;
  const features = transportationInfo.features || [];
  const extra = transportationInfo.extra;
  
  // 顯示名稱（航空公司/火車名稱/郵輪公司等）
  const displayName = typeName || transportationInfo.airline || extra?.airline || extra?.trainName || extra?.cruiseLine;

  return (
    <section id="transportation" className="w-full py-8 lg:py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2
          className="text-2xl lg:text-3xl font-serif font-bold text-center mb-6"
          style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
        >
          {sectionTitle}
        </h2>

        {/* Name & Description */}
        {(displayName || description) && (
          <div className="text-center mb-6">
            {displayName && (
              <p className="text-lg font-bold mb-1.5" style={{ color: ensureReadableOnWhite(colorTheme.primary) }}>
                {displayName}
              </p>
            )}
            {description && (
              <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed text-sm">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Route for Train */}
        {type === 'TRAIN' && extra?.route && extra.route.length > 0 && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">{t('tourDetail.transport.trainDeparture')}</p>
            <div className="flex flex-wrap justify-center items-center gap-2">
              {extra.route.map((station, index) => (
                <React.Fragment key={index}>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: colorTheme.accent + "20",
                      color: colorTheme.primary,
                    }}
                  >
                    {station}
                  </span>
                  {index < extra.route!.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Outbound */}
          {outbound && (
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <TransportIcon
                    className="h-4 w-4"
                    style={{ color: ensureReadableOnWhite(colorTheme.accent) }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {labels.outboundTitle}
                </h3>
              </div>

              <div className="space-y-3">
                {outbound.vehicleNo && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-600 min-w-[80px]">{labels.vehicleNo}</span>
                    <span className="text-gray-900 font-bold">{outbound.vehicleNo}</span>
                  </div>
                )}

                {outbound.departurePoint && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{outbound.departurePoint}</p>
                      {outbound.departureTime && (
                        <p className="text-sm text-gray-600">{labels.departureTime}{outbound.departureTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {outbound.arrivalPoint && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{outbound.arrivalPoint}</p>
                      {outbound.arrivalTime && (
                        <p className="text-sm text-gray-600">{labels.arrivalTime}{outbound.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {outbound.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <span className="text-gray-900">{labels.duration}{outbound.duration}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inbound */}
          {inbound && (
            <div className="bg-gray-50 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: colorTheme.accent + "20" }}
                >
                  <TransportIcon
                    className={`h-4 w-4 ${type === 'FLIGHT' ? 'transform rotate-180' : ''}`}
                    style={{ color: ensureReadableOnWhite(colorTheme.accent) }}
                  />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ensureReadableOnWhite(colorTheme.primary) }}
                >
                  {labels.inboundTitle}
                </h3>
              </div>

              <div className="space-y-3">
                {inbound.vehicleNo && (
                  <div className="flex items-start gap-3">
                    <span className="font-medium text-gray-600 min-w-[80px]">{labels.vehicleNo}</span>
                    <span className="text-gray-900 font-bold">{inbound.vehicleNo}</span>
                  </div>
                )}

                {inbound.departurePoint && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{inbound.departurePoint}</p>
                      {inbound.departureTime && (
                        <p className="text-sm text-gray-600">{labels.departureTime}{inbound.departureTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {inbound.arrivalPoint && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <div>
                      <p className="text-gray-900 font-medium">{inbound.arrivalPoint}</p>
                      {inbound.arrivalTime && (
                        <p className="text-sm text-gray-600">{labels.arrivalTime}{inbound.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                )}

                {inbound.duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: ensureReadableOnWhite(colorTheme.accent) }} />
                    <span className="text-gray-900">{labels.duration}{inbound.duration}</span>
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

// 向後相容：導出 FlightInfoSection 作為別名
export const FlightInfoSection = TransportationInfoSection;
