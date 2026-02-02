import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const destinations = [
  { id: 1, name: "歐洲", image: "/images/dest-europe.webp", label: "Europe", region: "europe" },
  { id: 2, name: "中國 & 亞洲", image: "/images/dest-asia.webp", label: "China & Asia", region: "asia" },
  { id: 3, name: "南美洲", image: "/images/dest-southamerica.webp", label: "South America", region: "south-america" },
  { id: 4, name: "以色列 & 約旦", image: "/images/dest-israel.webp", label: "Israel & Jordan", region: "middle-east" },
  { id: 5, name: "埃及 & 非洲", image: "/images/dest-africa.webp", label: "Egypt & Africa", region: "africa" },
  { id: 6, name: "郵輪之旅", image: "/images/dest-cruise.webp", label: "Cruises", region: "cruise" },
];

export default function Destinations() {
  const [, setLocation] = useLocation();

  const handleDestinationClick = (region: string) => {
    setLocation(`/destinations/${region}`);
  };

  return (
    <section id="destinations" className="py-20 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 relative inline-block">
            探索目的地
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary"></span>
          </h2>
          <p className="text-gray-500 mt-4">Discover the world's most amazing places</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div 
              key={dest.id} 
              onClick={() => handleDestinationClick(dest.region)}
              className="group relative aspect-[4/3] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl"
            >
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                <p className="text-gray-300 text-sm uppercase tracking-wider mb-4">{dest.label}</p>
                <div className="flex items-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  查看行程 <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
