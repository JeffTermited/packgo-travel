import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (destination: string) => void;
  placeholder?: string;
  className?: string;
}

const popularDestinations = [
  { name: "日本", keywords: ["日本", "japan", "東京", "大阪", "京都", "北海道", "沖繩"] },
  { name: "韓國", keywords: ["韓國", "korea", "首爾", "釜山", "濟州島"] },
  { name: "泰國", keywords: ["泰國", "thailand", "曼谷", "清邁", "普吉島"] },
  { name: "新加坡", keywords: ["新加坡", "singapore"] },
  { name: "馬來西亞", keywords: ["馬來西亞", "malaysia", "吉隆坡", "檳城"] },
  { name: "越南", keywords: ["越南", "vietnam", "河內", "胡志明市", "峴港"] },
  { name: "歐洲", keywords: ["歐洲", "europe", "法國", "義大利", "西班牙", "英國", "德國"] },
  { name: "美國", keywords: ["美國", "usa", "america", "紐約", "洛杉磯", "舊金山"] },
  { name: "澳洲", keywords: ["澳洲", "australia", "雪梨", "墨爾本"] },
  { name: "紐西蘭", keywords: ["紐西蘭", "new zealand", "奧克蘭", "基督城"] },
];

export function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "請輸入目的地、景點、關鍵字",
  className,
}: DestinationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState<typeof popularDestinations>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim()) {
      const searchLower = value.toLowerCase();
      const filtered = popularDestinations.filter((dest) =>
        dest.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
      );
      setFilteredDestinations(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredDestinations([]);
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

  const handleSelect = (destination: string) => {
    onChange(destination);
    setIsOpen(false);
    onSelect?.(destination);
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
          onFocus={() => {
            if (value.trim() && filteredDestinations.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-4 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 hover:border-gray-400 transition-all"
        />
      </div>

      {isOpen && filteredDestinations.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredDestinations.map((dest, index) => (
            <button
              key={index}
              onClick={() => handleSelect(dest.name)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{dest.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
