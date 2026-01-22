import { Button } from "@/components/ui/button";
import { Menu, Phone, Search, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "熱門目的地", href: "#destinations" },
    { label: "客製小團", href: "#custom-tours" },
    { label: "精選旅程", href: "#featured-tours" },
    { label: "聯絡我們", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <div className="container flex h-24 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/images/logo-bag-black-v3.png" 
            alt="PACK&GO Logo" 
            className="h-16 w-auto object-contain"
          />
          <div className="flex flex-col justify-center pl-1">
            <span className="text-[28px] font-bold tracking-wide text-black leading-none font-sans">
              PACK&GO
            </span>
            <span className="text-[15px] font-medium text-gray-600 tracking-widest mt-1">
              讓旅行更美好
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="text-xs text-gray-400">ENGLISH</span>
            <span>|</span>
            <span className="font-medium text-black">中文</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Call Us</span>
            <a href="tel:1-510-634-2307" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
              <Phone className="h-3 w-3" />
              1 (510) 634-2307
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-base font-medium text-gray-800 py-2 border-b border-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">EN</span>
              <span className="font-medium text-black">中文</span>
            </div>
            <a href="tel:1-510-634-2307" className="flex items-center gap-1 text-sm font-bold text-primary">
              <Phone className="h-4 w-4" />
              1 (510) 634-2307
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
