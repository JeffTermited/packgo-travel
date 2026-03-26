import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartureAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (departure: string) => void;
  placeholder?: string;
  className?: string;
}

const taiwanCities = [
  { name: "台北", keywords: ["台北", "taipei", "臺北", "北部"] },
  { name: "桃園", keywords: ["桃園", "taoyuan", "機場"] },
  { name: "新竹", keywords: ["新竹", "hsinchu"] },
  { name: "台中", keywords: ["台中", "taichung", "臺中", "中部"] },
  { name: "台南", keywords: ["台南", "tainan", "臺南", "南部"] },
  { name: "高雄", keywords: ["高雄", "kaohsiung", "南部"] },
  { name: "花蓮", keywords: ["花蓮", "hualien", "東部"] },
  { name: "台東", keywords: ["台東", "taitung", "臺東", "東部"] },
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

  useEffect(() => {
    if (value.trim()) {
      const searchLower = value.toLowerCase();
      const filtered = taiwanCities.filter((city) =>
        city.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
      );
      setFilteredCities(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      // Show all cities when input is empty but focused
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

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    onSelect?.(city);
  };

  const handleFocus = () => {
    if (value.trim()) {
      if (filteredCities.length > 0) {
        setIsOpen(true);
      }
    } else {
      // Show all cities when focused with empty input
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
          className="w-full h-12 pl-12 pr-4 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 hover:border-gray-400 transition-all rounded-lg"
        />
      </div>

      {isOpen && (filteredCities.length > 0 || !value.trim()) && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto" style={{ minHeight: filteredCities.length > 0 || !value.trim() ? 'auto' : '0' }}>
          {(value.trim() ? filteredCities : taiwanCities).map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelect(city.name)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{city.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
