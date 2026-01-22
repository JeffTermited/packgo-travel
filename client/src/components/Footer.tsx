import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo-bag-white-v3.png" 
                alt="PACK&GO Logo" 
                className="h-16 w-auto object-contain mix-blend-screen"
              />
              <div className="flex flex-col justify-center pl-1">
                <span className="text-[28px] font-bold tracking-wide text-white leading-none font-sans">
                  PACK&GO
                </span>
                <span className="text-[15px] font-medium text-gray-400 tracking-widest mt-1">
                  讓旅行更美好
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              PACK&GO 旅行社致力於為您打造獨一無二的旅遊體驗。從客製化行程到豪華郵輪，我們將帶您探索世界的每一個角落。
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-6 text-white">快速連結</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">關於我們</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">服務條款</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">隱私權政策</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">常見問題</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">聯絡我們</a></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-6 text-white">我們的服務</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">客製旅遊 / Customized Tours</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">代辦簽證 / Visa Agency</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">包團旅遊 / Package Tours</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">機票預購 / Ticket Booking</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">機場接送 / Airport Transfer</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">飯店預訂 / Hotel Booking</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-6 text-white">聯絡資訊</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>39055 Cedar Blvd #126<br />Newark CA 94560</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:1-510-634-2307" className="hover:text-white transition-colors">+1 (510) 634-2307</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:Jeffhsieh09@gmail.com" className="hover:text-white transition-colors">Jeffhsieh09@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="font-bold text-primary shrink-0 w-5 text-center">L</span>
                <span>Line: Jeffmyname</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PACK&GO Travel Agency. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <img src="/images/business-card.jpg" alt="Trust Badges" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
}
