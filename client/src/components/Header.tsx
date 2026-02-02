import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, Phone, Search, X, User, Globe, ChevronDown, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "客製旅遊", href: "/custom-tours", isLink: true },
    { label: "代辦簽證", href: "/visa-services", isLink: true },
    { label: "包團旅遊", href: "/search", isLink: true },
    { label: "機票預購", href: "/flight-booking", isLink: true },
    { label: "機場接送", href: "/airport-transfer", isLink: true },
    { label: "飯店預訂", href: "/hotel-booking", isLink: true },
    { label: "聯絡我們", href: "/contact-us", isLink: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">


      {/* Main Header */}
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img 
            src="/images/logo-bag-black-v3.png" 
            alt="PACK&GO Logo" 
           className="h-10 w-10 object-contain"          />
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
          {navItems.map((item) =>
            item.isLink ? (
              <Link
                key={item.label}
                href={item.href}
                className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-[15px] font-medium text-gray-700 hover:text-primary transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            )
          )}
        </nav>

        {/* Locale Switcher & Contact Info */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language & Currency Switcher */}
          <LocaleSwitcher />
          
          {isAuthenticated && user?.role === "admin" && (
            <>
              <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-full transition-all">
                <Shield className="h-4 w-4" />
                <span>管理後台</span>
              </Link>
            </>
          )}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-gray-500 tracking-wider">會員專區</span>
            {isAuthenticated && user ? (
              <Link href="/profile" className="flex items-center gap-2 text-base font-bold text-black hover:text-gray-700 transition-colors">
                <User className="h-4 w-4" />
                <span>{user.name || user.email}</span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-base font-bold text-black hover:text-gray-700 transition-colors">
                <User className="h-4 w-4" />
                <span>登入 / 註冊</span>
              </Link>
            )}
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
          {navItems.map((item) =>
            item.isLink ? (
              <Link
                key={item.label}
                href={item.href}
                className="text-base font-medium text-gray-800 py-2 border-b border-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-base font-medium text-gray-800 py-2 border-b border-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          )}
          {/* Mobile Locale Switcher */}
          <div className="flex items-center justify-center py-2 border-t border-gray-100 mt-2">
            <LocaleSwitcher />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              {isAuthenticated && user ? (
                <Link href="/profile" className="flex items-center gap-1 text-black font-medium">
                  <User className="h-4 w-4" />
                  {user.name || user.email}
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-1 text-gray-600">
                  <User className="h-4 w-4" />
                  會員登入
                </Link>
              )}
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
