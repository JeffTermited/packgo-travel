import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface SimilarToursProps {
  tourId: number;
  title?: string;
}

export default function SimilarTours({ tourId, title = "您可能也喜歡" }: SimilarToursProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: similarTours, isLoading } = trpc.tours.getSimilar.useQuery(
    { tourId, limit: 4 },
    { enabled: !!tourId }
  );

  if (isLoading || !similarTours || similarTours.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={() => navigate("/tours")}
            className="text-sm text-gray-500 hover:text-black transition-colors underline underline-offset-4"
          >
            查看所有行程
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(similarTours as any[]).map((tour: any) => (
            <div
              key={tour.id}
              onClick={() => navigate(`/tours/${tour.id}`)}
              className="bg-white border border-gray-200 cursor-pointer group hover:shadow-md transition-all duration-200"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
                {tour.heroImage ? (
                  <img
                    src={tour.heroImage}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.img-fallback')) {
                        const div = document.createElement('div');
                        div.className = 'img-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200';
                        div.innerHTML = '<span style="color:#9ca3af;font-size:12px">旅遊圖片</span>';
                        parent.appendChild(div);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-gray-400 text-sm">旅遊圖片</span>
                  </div>
                )}
                {tour.featured === 1 && (
                  <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 font-medium">
                    精選
                  </div>
                )}
              </div>
              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">{tour.destinationCountry} · {tour.duration} 天</p>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-black">
                  {tour.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">每人起</span>
                    <p className="text-base font-bold text-black">
                      NT$ {tour.price?.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5">
                    {tour.category === 'group' ? '團體' :
                     tour.category === 'private' ? '私人' :
                     tour.category === 'self_guided' ? '自由行' :
                     tour.category === 'cruise' ? '郵輪' :
                     tour.category === 'theme' ? '主題' : tour.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
