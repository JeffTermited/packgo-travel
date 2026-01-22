import { Button } from "@/components/ui/button";
import { Menu, Phone, Search, X, User, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "國外團體", href: "#group-tours" },
    { label: "台灣團體", href: "#taiwan-tours" },
    { label: "機票", href: "#flights" },
    { label: "訂房", href: "#hotels" },
    { label: "自由行", href: "#packages" },
    { label: "客製旅遊", href: "#custom" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar - Lion Travel Style */}
      <div className="bg-[#F5F5F5] border-b border-gray-200 hidden md:block">
        <div className="container flex h-9 items-center justify-end gap-6 text-xs text-gray-600">
          <a href="#" className="hover:text-primary transition-colors">企業專區</a>
          <a href="#" className="hover:text-primary transition-colors">同業登入</a>
          <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
            <Globe className="h-3 w-3" />
            <span>繁體中文</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
            <span>TWD</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
            <User className="h-3 w-3" />
            會員登入
          </a>
          <a href="#" className="hover:text-primary transition-colors">訂單查詢</a>
        </div>
      </div>

      {/* Main Header */}
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img 
            src="/images/logo-bag-black-v3.png" 
            alt="PACK&GO Logo" 
            className="h-14 w-auto object-contain"
          />
          <div className="flex flex-col justify-center pl-1">
            <span className="text-[24px] font-bold tracking-wide text-black leading-none font-sans">
              PACK&GO
            </span>
            <span className="text-[13px] font-medium text-gray-600 tracking-widest mt-1">
              讓旅行更美好
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Contact Info */}
        <div className="hidden md:flex items-center gap-4">
          {/* QR Code Hover */}
          <div className="relative group/qr">
            <img 
              src="/images/qrcode-only.png" 
              alt="Line QR Code" 
              className="h-10 w-10 object-contain cursor-pointer border border-gray-200 rounded p-0.5"
            />
            <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl rounded-lg p-3 border border-gray-100 opacity-0 invisible group-hover/qr:opacity-100 group-hover/qr:visible transition-all duration-300 transform origin-top-right z-50">
              <img src="/images/contact-qrcode.png" alt="Contact Card" className="w-full h-auto rounded" />
              <p className="text-center text-xs text-gray-500 mt-2">掃描加入 LINE 好友</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">服務專線</span>
            <a href="tel:1-510-634-2307" className="flex items-center gap-1 text-lg font-bold text-primary hover:underline leading-none">
              <Phone className="h-4 w-4" />
              1 (510) 634-2307
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
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
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="flex items-center gap-1 text-gray-600">
                <User className="h-4 w-4" />
                會員登入
              </a>
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
