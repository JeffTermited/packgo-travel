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
import { useLocale } from "@/contexts/LocaleContext";

// 語言顯示名稱
const LANGUAGE_LABELS: Record<string, string> = {
  en: "English (EN)",
  es: "Español (ES)",
  ja: "日本語 (JA)",
  ko: "한국어 (KO)",
};

// 翻譯欄位顯示名稱（一般行程 + AI 生成行程）
const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  highlights: "Highlights",
  includes: "Includes",
  excludes: "Excludes",
  notes: "Notes",
  heroSubtitle: "Subtitle (AI)",
  keyFeatures: "Key Features (AI)",
  itineraryDetailed: "Itinerary Details (AI)",
  costExplanation: "Cost Explanation (AI)",
  noticeDetailed: "Notice Details (AI)",
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
  const { t } = useLocale();
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
      toast.success(t('translationsTab.batchTranslateSuccess').replace('{count}', String(data.totalTours)));
      refetchTranslations();
      setIsTranslateAllDialogOpen(false);
    },
    onError: (error) => {
      toast.error(t('translationsTab.translateError').replace('{message}', error.message));
    },
  });

  // 翻譯單一行程 mutation
  const translateTourMutation = trpc.translation.translateTour.useMutation({
    onSuccess: (data) => {
      const langs = data.translatedLanguages?.join(", ") || "EN/ES";
      toast.success(t('translationsTab.singleTranslateSuccess').replace('{langs}', langs));
      refetchTranslations();
      setIsTranslateSingleDialogOpen(false);
      setSelectedTour(null);
    },
    onError: (error) => {
      toast.error(t('translationsTab.translateError').replace('{message}', error.message));
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
  const translationSummaryMap: Record<number, { hasEn: boolean; hasEs: boolean; enCount: number; esCount: number; totalFields: number }> =
    allTranslations
      ? Object.fromEntries(
          allTranslations.map((item: any) => [
            item.tourId,
            {
              hasEn: item.hasEn,
              hasEs: item.hasEs,
              enCount: item.enFieldCount ?? 0,
              esCount: item.esFieldCount ?? 0,
              totalFields: item.totalFields ?? 0,
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
            {t('translationsTab.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t('translationsTab.subtitle')}</p>
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
          {t('translationsTab.translateAll')}
        </Button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-none p-4">
          <div className="text-2xl font-bold text-gray-900">{totalTours}</div>
          <div className="text-sm text-gray-500">{t('translationsTab.totalTours')}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-none p-4">
          <div className="text-2xl font-bold text-green-600">{translatedEnCount}</div>
          <div className="text-sm text-gray-500">{t('translationsTab.translatedEn')}</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalTours > 0 ? Math.round((translatedEnCount / totalTours) * 100) : 0}% {t('translationsTab.done')}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-none p-4">
          <div className="text-2xl font-bold text-blue-600">{translatedEsCount}</div>
          <div className="text-sm text-gray-500">{t('translationsTab.translatedEs')}</div>
          <div className="text-xs text-gray-400 mt-1">
            {totalTours > 0 ? Math.round((translatedEsCount / totalTours) * 100) : 0}% {t('translationsTab.done')}
          </div>
        </div>
      </div>

      {/* 搜尋 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t('translationsTab.searchPlaceholder')}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 行程翻譯狀態表格 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">{t('translationsTab.loading')}</span>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>{t('translationsTab.colTourName')}</TableHead>
                <TableHead className="w-24 text-center">{t('translationsTab.colStatus')}</TableHead>
                <TableHead className="w-32 text-center">{t('translationsTab.colEnglish')}</TableHead>
                <TableHead className="w-36 text-center">{t('translationsTab.colSpanish')}</TableHead>
                <TableHead className="w-28 text-center">{t('translationsTab.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {t('translationsTab.noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTours.map((tour: any) => {
                  const translationStatus = translationSummaryMap[tour.id];
                  const hasEn = translationStatus?.hasEn ?? false;
                  const hasEs = translationStatus?.hasEs ?? false;
                  const enCount = translationStatus?.enCount ?? 0;
                  const esCount = translationStatus?.esCount ?? 0;
                  const totalFields = translationStatus?.totalFields ?? Object.keys(FIELD_LABELS).length;

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
                          {tour.status === "active" ? t('translationsTab.statusActive') : tour.status === "soldout" ? t('translationsTab.statusSoldout') : t('translationsTab.statusInactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {hasEn ? (
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-400">{enCount}/{totalFields} {t('translationsTab.fields')}</span>
                          </div>
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasEs ? (
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-400">{esCount}/{totalFields} {t('translationsTab.fields')}</span>
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
                          {hasEn && hasEs ? t('translationsTab.retranslate') : t('translationsTab.translate')}
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
              {t('translationsTab.translateAll')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              {t('translationsTab.translateAllDesc').replace('{count}', String(totalTours))}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-none p-3 text-sm text-amber-700">
              <strong>{t('translationsTab.warningLabel')}</strong>{t('translationsTab.translateAllWarning')}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTranslateAllDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleTranslateAll} disabled={isTranslatingAll}>
              {isTranslatingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('translationsTab.translating')}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  {t('translationsTab.confirmTranslate')}
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
              {t('translationsTab.translateTour')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              {t('translationsTab.translateTourDesc').replace('{title}', selectedTour?.title || '')}
            </p>
            <p className="text-sm text-gray-500">
              {t('translationsTab.targetLanguages')}
            </p>
            <p className="text-sm text-gray-500">
              {t('translationsTab.translateFields')}
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleTranslateSingle} disabled={isTranslatingSingle}>
              {isTranslatingSingle ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('translationsTab.translating')}
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  {t('translationsTab.startTranslate')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
