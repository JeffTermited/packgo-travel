import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Sparkles, Plane, Hotel, Ticket, Users, Lock, Pencil, X, Check, Upload, ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { DateRangePicker } from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";
import { DepartureAutocomplete } from "@/components/DepartureAutocomplete";
import { toast } from "sonner";
import { useHomeEdit } from "@/contexts/HomeEditContext";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
  hotKeywords: string[];
}

const defaultContent: HeroContent = {
  title: "精選旅程 折扣最後一週",
  subtitle: "* 跟著花期去旅行 *",
  backgroundImage: "/images/hero-sakura.webp",
  hotKeywords: ["北海道", "東京", "大阪", "歐洲", "土耳其", "郵輪", "滑雪"],
};

export default function EditableHero() {
  const [activeTab, setActiveTab] = useState("group");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [, setLocation] = useLocation();
  
  const { isEditMode, canEdit } = useHomeEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<HeroContent>(defaultContent);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch hero content from database
  const { data: heroData, refetch } = trpc.homepage.getContent.useQuery(
    { sectionKey: 'hero' },
    { enabled: true }
  );

  const updateContentMutation = trpc.homepage.updateContent.useMutation({
    onSuccess: () => {
      toast.success('Hero 內容已更新');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error('更新失敗: ' + error.message);
    },
  });

  // Use database content or default
  const content: HeroContent = heroData?.content || defaultContent;

  useEffect(() => {
    if (heroData?.content) {
      setEditContent(heroData.content as HeroContent);
    }
  }, [heroData]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination.trim()) {
      params.set("destination", destination.trim());
    }
    if (departure.trim()) {
      params.set("departure", departure.trim());
    }
    const queryString = params.toString();
    setLocation(`/search${queryString ? `?${queryString}` : ""}`);
  };

  const handleKeywordClick = (keyword: string) => {
    setLocation(`/search?destination=${encodeURIComponent(keyword)}`);
  };

  const handleLockedTabClick = (tabName: string) => {
    toast.info(`${tabName}功能即將推出，敬請期待！`);
  };

  const handleSaveContent = () => {
    updateContentMutation.mutate({
      sectionKey: 'hero',
      content: editContent,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片檔案');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('圖片大小不能超過 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'hero');

      const response = await fetch('/api/upload/tour-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const data = await response.json();
      setEditContent(prev => ({ ...prev, backgroundImage: data.url }));
      setShowImageDialog(false);
      toast.success('圖片上傳成功');
    } catch (error) {
      toast.error('圖片上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setEditContent(prev => ({ ...prev, hotKeywords: keywords }));
  };

  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={isEditing ? editContent.backgroundImage : content.backgroundImage} 
          alt="Cherry Blossoms Travel" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Edit Image Button */}
        {isEditMode && canEdit && isEditing && (
          <button
            onClick={() => setShowImageDialog(true)}
            className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            更換背景圖片
          </button>
        )}
      </div>

      {/* Content */}
      <div className="container relative z-10 flex flex-col items-center pt-10">
        {/* Hero Text */}
        <div className="text-center mb-8 animate-in fade-in zoom-in duration-1000 relative">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editContent.subtitle}
                onChange={(e) => setEditContent(prev => ({ ...prev, subtitle: e.target.value }))}
                className="text-white text-xl md:text-2xl font-serif mb-2 tracking-widest text-shadow bg-transparent border-b border-white/50 text-center w-full focus:outline-none focus:border-white"
              />
              <input
                type="text"
                value={editContent.title}
                onChange={(e) => setEditContent(prev => ({ ...prev, title: e.target.value }))}
                className="text-white text-4xl md:text-6xl font-bold font-serif tracking-tight text-shadow-lg bg-transparent border-b border-white/50 text-center w-full focus:outline-none focus:border-white"
              />
            </div>
          ) : (
            <>
              <h2 className="text-white text-xl md:text-2xl font-serif mb-2 tracking-widest text-shadow">
                {content.subtitle}
              </h2>
              <h1 className="text-white text-4xl md:text-6xl font-bold font-serif tracking-tight text-shadow-lg">
                {content.title}
              </h1>
            </>
          )}
          
          {/* Edit Button */}
          {isEditMode && canEdit && !isEditing && (
            <button
              onClick={() => {
                setEditContent(content);
                setIsEditing(true);
              }}
              className="absolute -top-2 -right-12 bg-black/70 hover:bg-black text-white p-2 rounded-full transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Edit Controls */}
        {isEditing && (
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleSaveContent}
              disabled={updateContentMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              儲存
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditContent(content);
              }}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/50"
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
          </div>
        )}

        {/* Search Console - Lion Travel Style */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-10 duration-700 delay-300">
          {/* Tabs */}
          <div className="flex w-full border-b border-gray-200 bg-gray-50">
            {[
              { id: "group", label: "團體旅遊", icon: <Users className="h-4 w-4" />, locked: false },
              { id: "flight", label: "機票", icon: <Plane className="h-4 w-4" />, locked: true },
              { id: "hotel", label: "訂房", icon: <Hotel className="h-4 w-4" />, locked: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.locked) {
                    handleLockedTabClick(tab.label);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex-1 py-4 px-2 text-base font-medium transition-all relative flex items-center justify-center gap-2 ${
                  tab.locked 
                    ? "text-gray-400 cursor-not-allowed bg-gray-100" 
                    : activeTab === tab.id 
                      ? "text-primary bg-white border-t-2 border-t-primary" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.locked && <Lock className="h-3 w-3 ml-1" />}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-white">
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Use flexbox with equal basis for equal widths */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  {/* Departure Location - Changed to Autocomplete */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">出發地</label>
                    <DepartureAutocomplete 
                      value={departure}
                      onChange={setDeparture}
                      placeholder="輸入出發地"
                      className="w-full [&_input]:rounded-full [&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:h-12 [&_input]:w-full"
                    />
                  </div>

                  {/* Keyword Input */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">關鍵字</label>
                    <DestinationAutocomplete 
                      value={destination}
                      onChange={setDestination}
                      onSelect={handleSearch}
                      placeholder="輸入目的地"
                      className="w-full [&_input]:rounded-full [&_input]:bg-gray-50 [&_input]:border-gray-200 [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:h-12 [&_input]:w-full"
                    />
                  </div>

                  {/* Date Range Picker */}
                  <div className="w-full" style={{ flex: '1 1 0', minWidth: 0 }}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">出發時間</label>
                    <DateRangePicker 
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="選擇日期"
                      className="h-12 rounded-full w-full"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="w-full md:w-32 flex-shrink-0">
                    <Button 
                      onClick={handleSearch}
                      className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-full font-bold shadow-md transition-all hover:shadow-lg"
                    >
                      搜尋
                    </Button>
                  </div>
                </div>


                {/* Hot Keywords - Only show for group tours */}
                {activeTab === "group" && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    <span className="font-medium text-primary">熱門搜尋：</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editContent.hotKeywords.join(', ')}
                        onChange={(e) => handleKeywordsChange(e.target.value)}
                        placeholder="用逗號分隔關鍵字"
                        className="flex-1 bg-gray-100 px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {content.hotKeywords.map((keyword) => (
                          <button 
                            key={keyword} 
                            onClick={() => handleKeywordClick(keyword)}
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>更換背景圖片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-gray-500">上傳中...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">點擊或拖放圖片到此處</p>
                  <p className="text-xs text-gray-400 mt-1">支援 JPG、PNG、WebP，最大 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div>
              <Label>或輸入圖片網址</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={editContent.backgroundImage}
                onChange={(e) => setEditContent(prev => ({ ...prev, backgroundImage: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
