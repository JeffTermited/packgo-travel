import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Languages, RefreshCw, CheckCircle, XCircle, Search, Globe } from "lucide-react";
import { toast } from "sonner";

// 語言顯示名稱
const LANGUAGE_LABELS: Record<string, string> = {
  en: "英文 (EN)",
  es: "西班牙文 (ES)",
  ja: "日文 (JA)",
  ko: "韓文 (KO)",
};

// 翻譯欄位顯示名稱
const FIELD_LABELS: Record<string, string> = {
  title: "標題",
  description: "描述",
  heroSubtitle: "副標題",
  itineraryDetailed: "行程詳情",
  keyFeatures: "特色亮點",
  costExplanation: "費用說明",
  noticeDetailed: "注意事項",
};

type TourWithTranslationStatus = {
  id: number;
  title: string;
  status: string;
  hasEn: boolean;
  hasEs: boolean;
  enFieldCount: number;
  esFieldCount: number;
};

export default function TranslationsTab() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isTranslateAllDialogOpen, setIsTranslateAllDialogOpen] = useState(false);
  const [isTranslateSingleDialogOpen, setIsTranslateSingleDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<{ id: number; title: string } | null>(null);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [isTranslatingSingle, setIsTranslatingSingle] = useState(false);

  // 取得所有行程
  const { data: tours, isLoading: toursLoading, refetch: refetchTours } = trpc.tours.list.useQuery(undefined);

  // 取得所有翻譯狀態（使用 getAllTourTranslations 批次查詢）
  // 注意：這裡我們用一個 summary endpoint
  const { data: allTranslations, isLoading: translationsLoading, refetch: refetchTranslations } =
    trpc.translation.getAllTranslationsSummary.useQuery(undefined, {
      retry: false,
    });

  // 翻譯所有行程 mutation
  const translateAllMutation = trpc.translation.translateAllTours.useMutation({
    onSuccess: (data) => {
      toast.success(`批次翻譯完成！共翻譯 ${data.totalTours} 個行程`);
      refetchTranslations();
      setIsTranslateAllDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`翻譯失敗：${error.message}`);
    },
  });

  // 翻譯單一行程 mutation
  const translateTourMutation = trpc.translation.translateTour.useMutation({
    onSuccess: (data) => {
      const langs = data.translatedLanguages?.join(", ") || "EN/ES";
      toast.success(`行程翻譯完成！已翻譯至：${langs}`);
      refetchTranslations();
      setIsTranslateSingleDialogOpen(false);
      setSelectedTour(null);
    },
    onError: (error) => {
      toast.error(`翻譯失敗：${error.message}`);
    },
  });

  const handleTranslateAll = async () => {
    setIsTranslatingAll(true);
    try {
      await translateAllMutation.mutateAsync({
        targetLanguages: ["en", "es"],
      });
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const handleTranslateSingle = async () => {
    if (!selectedTour) return;
    setIsTranslatingSingle(true);
    try {
      await translateTourMutation.mutateAsync({
        tourId: selectedTour.id,
        targetLanguages: ["en", "es"],
      });
    } finally {
      setIsTranslatingSingle(false);
    }
  };

  // 建立行程翻譯狀態映射
  const translationSummaryMap: Record<number, { hasEn: boolean; hasEs: boolean; enCount: number; esCount: number }> =
    allTranslations
      ? Object.fromEntries(
          allTranslations.map((item: any) => [
            item.tourId,
            {
              hasEn: item.hasEn,
              hasEs: item.hasEs,
              enCount: item.enFieldCount ?? 0,
              esCount: item.esFieldCount ?? 0,
            },
          ])
        )
      : {};

  const tourList = Array.isArray(tours) ? tours : [];
  const filteredTours = tourList.filter((t: any) =>
    !searchKeyword ||
    t.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const totalTours = tourList.length;
  const translatedEnCount = Object.values(translationSummaryMap).filter((v) => v.hasEn).length;
  const translatedEsCount = Object.values(translationSummaryMap).filter((v) => v.hasEs).length;

  const isLoading = toursLoading || translationsLoading;

  return (
    <div className="space-y-6">
      {/* 標題與統計 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="h-6 w-6" />
            多語言翻譯管理
          </h2>
          <p className="text-sm text-gray-500 mt-1">管理行程的英文和西班牙文翻譯</p>
        </div>
        <Button
          onClick={() => setIsTranslateAllDialogOpen(true)}
          className="flex items-center gap-2"
          disabled={isTranslatingAll}
        >
          {isTranslatingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          翻譯所有行程
        </Button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{totalTours}</div>
          <div className="text-sm text-gray-500">行程總數</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{translatedEnCount}</div>
          <div className="text-sm text-gray-500">已翻譯英文</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalTours > 0 ? Math.round((translatedEnCount / totalTours) * 100) : 0}% 完成
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{translatedEsCount}</div>
          <div className="text-sm text-gray-500">已翻譯西班牙文</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalTours > 0 ? Math.round((translatedEsCount / totalTours) * 100) : 0}% 完成
          </div>
        </div>
      </div>

      {/* 搜尋 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜尋行程名稱或目的地..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 行程翻譯狀態表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">載入中...</span>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>行程名稱</TableHead>
                <TableHead className="w-24 text-center">狀態</TableHead>
                <TableHead className="w-32 text-center">英文 (EN)</TableHead>
                <TableHead className="w-36 text-center">西班牙文 (ES)</TableHead>
                <TableHead className="w-28 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    沒有符合條件的行程
                  </TableCell>
                </TableRow>
              ) : (
                filteredTours.map((tour: any) => {
                  const translationStatus = translationSummaryMap[tour.id];
                  const hasEn = translationStatus?.hasEn ?? false;
                  const hasEs = translationStatus?.hasEs ?? false;
                  const enCount = translationStatus?.enCount ?? 0;
                  const esCount = translationStatus?.esCount ?? 0;
                  const totalFields = Object.keys(FIELD_LABELS).length;

                  return (
                    <TableRow key={tour.id} className="hover:bg-gray-50">
                      <TableCell className="text-gray-400 text-sm">{tour.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 line-clamp-1">{tour.title}</div>
                        <div className="text-xs text-gray-400">{tour.destination}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tour.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tour.status === "active" ? "上架" : tour.status === "soldout" ? "售完" : "下架"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {hasEn ? (
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-400">{enCount}/{totalFields} 欄位</span>
                          </div>
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasEs ? (
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-400">{esCount}/{totalFields} 欄位</span>
                          </div>
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTour({ id: tour.id, title: tour.title });
                            setIsTranslateSingleDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {hasEn && hasEs ? "重新翻譯" : "翻譯"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 翻譯所有行程確認對話框 */}
      <Dialog open={isTranslateAllDialogOpen} onOpenChange={setIsTranslateAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              翻譯所有行程
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              將對所有 <strong>{totalTours}</strong> 個行程進行英文和西班牙文翻譯。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              <strong>注意：</strong>此操作會消耗大量 AI Token，且可能需要數分鐘時間。
              已有翻譯的行程將被覆蓋更新。
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTranslateAllDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleTranslateAll} disabled={isTranslatingAll}>
              {isTranslatingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  翻譯中...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  確認翻譯
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 翻譯單一行程確認對話框 */}
      <Dialog open={isTranslateSingleDialogOpen} onOpenChange={setIsTranslateSingleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              翻譯行程
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              將翻譯行程：<strong className="text-gray-900">{selectedTour?.title}</strong>
            </p>
            <p className="text-sm text-gray-500">
              目標語言：英文 (EN)、西班牙文 (ES)
            </p>
            <p className="text-sm text-gray-500">
              翻譯欄位：標題、描述、副標題、行程詳情、特色亮點、費用說明、注意事項
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTranslateSingleDialogOpen(false);
                setSelectedTour(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleTranslateSingle} disabled={isTranslatingSingle}>
              {isTranslatingSingle ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  翻譯中...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  開始翻譯
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
