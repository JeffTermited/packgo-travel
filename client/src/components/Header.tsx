import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, Phone, X, User, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { useLocale } from "@/contexts/LocaleContext";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLocale();

  const navItems = [
    { labelKey: "nav.customTours", href: "/custom-tours", isLink: true },
    { labelKey: "nav.visaServices", href: "/visa-services", isLink: true },
    { labelKey: "nav.groupTours", href: "/search", isLink: true },
    { labelKey: "nav.flightBooking", href: "/flight-booking", isLink: true },
    { labelKey: "nav.airportTransfer", href: "/airport-transfer", isLink: true },
    { labelKey: "nav.hotelBooking", href: "/hotel-booking", isLink: true },
    { labelKey: "nav.contactUs", href: "/contact-us", isLink: true },
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
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col justify-center pl-1">
            <span className="text-[24px] font-bold tracking-wide text-black leading-none font-sans">
              PACK&GO
            </span>
            <span className="text-[13px] font-medium text-gray-600 tracking-widest mt-1">
              {t('home.slogan')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navItems.map((item) =>
            item.isLink ? (
              <Link
                key={item.labelKey}
                href={item.href}
                className="text-[14px] font-medium text-gray-700 hover:text-primary transition-colors relative group py-2 whitespace-nowrap"
              >
                {t(item.labelKey)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ) : (
              <a
                key={item.labelKey}
                href={item.href}
                className="text-[14px] font-medium text-gray-700 hover:text-primary transition-colors relative group py-2 whitespace-nowrap"
              >
                {t(item.labelKey)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            )
          )}
        </nav>

        {/* Right Side - Locale Switcher & User */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language & Currency Switcher */}
          <LocaleSwitcher />
          
          {/* Divider */}
          <div className="h-8 w-px bg-gray-200"></div>
          
          {/* Admin Panel Link */}
          {isAuthenticated && user?.role === "admin" && (
            <>
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black transition-colors whitespace-nowrap"
              >
                <Shield className="h-4 w-4" />
                <span>{t('nav.adminPanel')}</span>
              </Link>
              <div className="h-8 w-px bg-gray-200"></div>
            </>
          )}
          
          {/* Member Area */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 tracking-wider leading-none mb-0.5">
              {t('nav.memberArea')}
            </span>
            {isAuthenticated && user ? (
              <Link 
                href="/profile" 
                className="flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 transition-colors whitespace-nowrap"
              >
                <User className="h-3.5 w-3.5" />
                <span>{user.name || user.email}</span>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 transition-colors whitespace-nowrap"
              >
                <User className="h-3.5 w-3.5" />
                <span>{t('nav.loginRegister')}</span>
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
                key={item.labelKey}
                href={item.href}
                className="text-base font-medium text-gray-800 py-2 border-b border-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <a
                key={item.labelKey}
                href={item.href}
                className="text-base font-medium text-gray-800 py-2 border-b border-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.labelKey)}
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
                  {t('nav.memberLogin')}
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
