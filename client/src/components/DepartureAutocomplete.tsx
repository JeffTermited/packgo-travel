import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";

interface DepartureAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (departure: string) => void;
  placeholder?: string;
  className?: string;
}

const taiwanCities = [
  { zh: "台北", en: "Taipei", keywords: ["台北", "taipei", "臺北", "北部"] },
  { zh: "桃園", en: "Taoyuan", keywords: ["桃園", "taoyuan", "機場", "airport"] },
  { zh: "新竹", en: "Hsinchu", keywords: ["新竹", "hsinchu"] },
  { zh: "台中", en: "Taichung", keywords: ["台中", "taichung", "臺中", "中部"] },
  { zh: "台南", en: "Tainan", keywords: ["台南", "tainan", "臺南", "南部"] },
  { zh: "高雄", en: "Kaohsiung", keywords: ["高雄", "kaohsiung", "南部"] },
  { zh: "花蓮", en: "Hualien", keywords: ["花蓮", "hualien", "東部"] },
  { zh: "台東", en: "Taitung", keywords: ["台東", "taitung", "臺東", "東部"] },
];

export function DepartureAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "輸入出發地",
  className,
}: DepartureAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<typeof taiwanCities>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useLocale();

  const getCityName = (city: typeof taiwanCities[0]) =>
    language === "en" ? city.en : city.zh;

  useEffect(() => {
    if (value.trim()) {
      const searchLower = value.toLowerCase();
      const filtered = taiwanCities.filter((city) =>
        city.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower)) ||
        city.en.toLowerCase().includes(searchLower) ||
        city.zh.includes(value)
      );
      setFilteredCities(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: typeof taiwanCities[0]) => {
    onChange(getCityName(city));
    setIsOpen(false);
    onSelect?.(getCityName(city));
  };

  const handleFocus = () => {
    if (value.trim()) {
      if (filteredCities.length > 0) {
        setIsOpen(true);
      }
    } else {
      setFilteredCities(taiwanCities);
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
          <MapPin className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 border-2 border-black bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all rounded-none"
        />
      </div>

      {isOpen && (filteredCities.length > 0 || !value.trim()) && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border-2 border-black shadow-none max-h-80 overflow-y-auto">
          {(value.trim() ? filteredCities : taiwanCities).map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-black hover:text-white transition-colors flex items-center gap-3 border-b border-gray-200 last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-gray-400 group-hover:text-white" />
              <span className="text-gray-900">{getCityName(city)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
