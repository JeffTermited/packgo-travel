import { Badge } from "@/components/ui/badge";

interface HotelSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  description: string;
  roomTypes: string[];
  policies: string[];
  facilities: {
    free: string[];
    paid: string[];
  };
  images: Array<{
    url: string;
    caption: string;
  }>;
}

export default function LionHotelSection({
  title,
  subtitle,
  badge,
  description,
  roomTypes,
  policies,
  facilities,
  images,
}: HotelSectionProps) {
  return (
    <section className="py-12 bg-white">
      <div className="container">
        {/* 標題區塊 */}
        <div className="mb-8">
          {badge && (
            <div className="mb-2">
              <Badge className="bg-lion-primary text-white px-4 py-1 text-sm font-bold">
                {badge}
              </Badge>
            </div>
          )}
          {subtitle && (
            <h3 className="text-lg text-lion-secondary mb-2">{subtitle}</h3>
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        </div>

        {/* 飯店描述 */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>

        {/* 房型說明 */}
        {roomTypes && roomTypes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">房型說明</h3>
            <div className="space-y-2">
              {roomTypes.map((roomType, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-lion-primary font-bold mt-1">註{index + 1}：</span>
                  <p className="text-gray-700 flex-1">{roomType}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 設施列表 */}
        {facilities && (facilities.free.length > 0 || facilities.paid.length > 0) && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">活動樂翻天</h3>
            
            {/* 免費活動 */}
            {facilities.free.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  ＊＊免費活動＊＊
                </h4>
                <ul className="space-y-2">
                  {facilities.free.map((facility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-lion-primary">◎</span>
                      <span className="text-gray-700">{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 付費活動 */}
            {facilities.paid.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  ＊＊付費活動＊＊
                </h4>
                <ul className="space-y-2">
                  {facilities.paid.map((facility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-lion-primary">◎</span>
                      <span className="text-gray-700">{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 免責聲明 */}
            <p className="text-sm text-gray-500 italic">
              *以上活動渡假村保留天氣或海潮不佳等安全因素取消水上及陸上活動之權利
            </p>
          </div>
        )}

        {/* 政策和注意事項 */}
        {policies && policies.length > 0 && (
          <div className="mb-8">
            <div className="space-y-2">
              {policies.map((policy, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-lion-primary font-bold mt-1">註{index + 1}：</span>
                  <p className="text-gray-700 flex-1">{policy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 圖片展示區 */}
        {images && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div key={index} className="flex flex-col">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm text-gray-600 font-medium">
                  {image.caption}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
