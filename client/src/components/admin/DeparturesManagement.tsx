import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar, Edit, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocale } from "@/contexts/LocaleContext";

type DepartureFormData = {
  tourId: number;
  departureDate: string;
  returnDate: string;
  adultPrice: number;
  childPriceWithBed?: number;
  childPriceNoBed?: number;
  infantPrice?: number;
  singleRoomSupplement?: number;
  totalSlots: number;
  status: "open" | "full" | "cancelled";
  currency: string;
  notes?: string;
};

interface DeparturesManagementProps {
  tourId: number;
  tourTitle: string;
}

export default function DeparturesManagement({ tourId, tourTitle }: DeparturesManagementProps) {
  const { t } = useLocale();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartureId, setSelectedDepartureId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DepartureFormData>({
    tourId,
    departureDate: "",
    returnDate: "",
    adultPrice: 0,
    childPriceWithBed: 0,
    childPriceNoBed: 0,
    infantPrice: 0,
    singleRoomSupplement: 0,
    totalSlots: 20,
    status: "open",
    currency: "TWD",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: departures, isLoading } = trpc.departures.listByTour.useQuery({ tourId });

  const createMutation = trpc.departures.create.useMutation({
    onSuccess: () => {
      utils.departures.listByTour.invalidate({ tourId });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success(t('departuresTab.createSuccess'));
    },
    onError: (error) => {
      toast.error(t('departuresTab.createError').replace('{message}', error.message));
    },
  });

  const updateMutation = trpc.departures.update.useMutation({
    onSuccess: () => {
      utils.departures.listByTour.invalidate({ tourId });
      setIsEditDialogOpen(false);
      resetForm();
      toast.success(t('departuresTab.updateSuccess'));
    },
    onError: (error) => {
      toast.error(t('departuresTab.updateError').replace('{message}', error.message));
    },
  });

  const deleteMutation = trpc.departures.delete.useMutation({
    onSuccess: () => {
      utils.departures.listByTour.invalidate({ tourId });
      setIsDeleteDialogOpen(false);
      setSelectedDepartureId(null);
      toast.success(t('departuresTab.deleteSuccess'));
    },
    onError: (error) => {
      toast.error(t('departuresTab.deleteError').replace('{message}', error.message));
    },
  });

  const resetForm = () => {
    setFormData({
      tourId,
      departureDate: "",
      returnDate: "",
      adultPrice: 0,
      childPriceWithBed: 0,
      childPriceNoBed: 0,
      infantPrice: 0,
      singleRoomSupplement: 0,
      totalSlots: 20,
      status: "open",
      currency: "TWD",
      notes: "",
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      departureDate: new Date(formData.departureDate),
      returnDate: new Date(formData.returnDate),
    });
  };

  const handleUpdate = () => {
    if (!selectedDepartureId) return;
    updateMutation.mutate({
      id: selectedDepartureId,
      departureDate: new Date(formData.departureDate),
      returnDate: new Date(formData.returnDate),
      adultPrice: formData.adultPrice,
      childPriceWithBed: formData.childPriceWithBed,
      childPriceNoBed: formData.childPriceNoBed,
      infantPrice: formData.infantPrice,
      singleRoomSupplement: formData.singleRoomSupplement,
      totalSlots: formData.totalSlots,
      status: formData.status as "open" | "full" | "cancelled",
      currency: formData.currency,
      notes: formData.notes || undefined,
    });
  };

  const handleEdit = (departure: any) => {
    setSelectedDepartureId(departure.id);
    setFormData({
      tourId,
      departureDate: format(new Date(departure.departureDate), "yyyy-MM-dd"),
      returnDate: format(new Date(departure.returnDate), "yyyy-MM-dd"),
      adultPrice: departure.adultPrice,
      childPriceWithBed: departure.childPriceWithBed || 0,
      childPriceNoBed: departure.childPriceNoBed || 0,
      infantPrice: departure.infantPrice || 0,
      singleRoomSupplement: departure.singleRoomSupplement || 0,
      totalSlots: departure.totalSlots,
      status: departure.status,
      currency: departure.currency || "TWD",
      notes: departure.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setSelectedDepartureId(id);
    setIsDeleteDialogOpen(true);
  };

  const getStatusConfig = (status: string) => {
    const config = {
      open: { label: t('departuresTab.statusOpen'), className: "bg-green-100 text-green-800 border border-green-200" },
      full: { label: t('departuresTab.statusFull'), className: "bg-red-100 text-red-800 border border-red-200" },
      cancelled: { label: t('departuresTab.statusCancelled'), className: "bg-gray-100 text-gray-600 border border-gray-200" },
    };
    return config[status as keyof typeof config] || config.open;
  };

  // Reusable form fields
  const renderFormFields = () => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldDepartureDate')}</Label>
        <Input
          type="date"
          value={formData.departureDate}
          onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldReturnDate')}</Label>
        <Input
          type="date"
          value={formData.returnDate}
          onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldAdultPrice')}</Label>
        <Input
          type="number"
          value={formData.adultPrice}
          onChange={(e) => setFormData({ ...formData, adultPrice: Number(e.target.value) })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldChildPriceWithBed')}</Label>
        <Input
          type="number"
          value={formData.childPriceWithBed || ""}
          onChange={(e) => setFormData({ ...formData, childPriceWithBed: e.target.value ? Number(e.target.value) : undefined })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldChildPriceNoBed')}</Label>
        <Input
          type="number"
          value={formData.childPriceNoBed || ""}
          onChange={(e) => setFormData({ ...formData, childPriceNoBed: e.target.value ? Number(e.target.value) : undefined })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldInfantPrice')}</Label>
        <Input
          type="number"
          value={formData.infantPrice || ""}
          onChange={(e) => setFormData({ ...formData, infantPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldSingleRoomSupplement')}</Label>
        <Input
          type="number"
          value={formData.singleRoomSupplement || ""}
          onChange={(e) => setFormData({ ...formData, singleRoomSupplement: e.target.value ? Number(e.target.value) : undefined })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldTotalSlots')}</Label>
        <Input
          type="number"
          value={formData.totalSlots}
          onChange={(e) => setFormData({ ...formData, totalSlots: Number(e.target.value) })}
          className="border-gray-300"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldStatus')}</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger className="border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">{t('departuresTab.statusOpen')}</SelectItem>
            <SelectItem value="full">{t('departuresTab.statusFull')}</SelectItem>
            <SelectItem value="cancelled">{t('departuresTab.statusCancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">幣別</Label>
        <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
          <SelectTrigger className="border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TWD">TWD 新台幣</SelectItem>
            <SelectItem value="USD">USD 美元</SelectItem>
            <SelectItem value="JPY">JPY 日圓</SelectItem>
            <SelectItem value="EUR">EUR 歐元</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('departuresTab.fieldNotes')}</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="備註（選填）"
          className="border-gray-300 text-sm"
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{t('departuresTab.title')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{tourTitle}</p>
        </div>
        <Button
          onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}
          className="bg-black text-white hover:bg-gray-800 h-8 text-xs px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          {t('departuresTab.addDeparture')}
        </Button>
      </div>

      {/* Departures List */}
      <div className="border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departuresTab.colDepartureDate')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departuresTab.colReturnDate')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departuresTab.colAdultPrice')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departuresTab.colSlots')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departuresTab.colStatus')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('departuresTab.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {departures && departures.length > 0 ? (
              departures.map((departure) => {
                const statusConfig = getStatusConfig(departure.status);
                const occupancyPct = Math.round((departure.bookedSlots / departure.totalSlots) * 100);
                return (
                  <tr key={departure.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {format(new Date(departure.departureDate), "yyyy/MM/dd")}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {format(new Date(departure.returnDate), "yyyy/MM/dd")}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {departure.currency || "NT$"} {departure.adultPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{departure.bookedSlots}/{departure.totalSlots}</span>
                        <div className="w-16 h-1.5 bg-gray-200 overflow-hidden">
                          <div
                            className={`h-full ${occupancyPct >= 90 ? "bg-red-500" : occupancyPct >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${occupancyPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(departure)}
                          className="h-7 w-7 p-0 hover:bg-gray-100"
                        >
                          <Edit className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(departure.id)}
                          className="h-7 w-7 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm font-medium text-gray-600">{t('departuresTab.noDepartures')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('departuresTab.noDeparturesHint')}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('departuresTab.createTitle')}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">{t('departuresTab.createDesc')}</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-300">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-black text-white hover:bg-gray-800">
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('departuresTab.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('departuresTab.editTitle')}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">{t('departuresTab.editDesc')}</DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-300">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-black text-white hover:bg-gray-800">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('departuresTab.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('departuresTab.deleteTitle')}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {t('departuresTab.deleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-300">
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => { if (selectedDepartureId) deleteMutation.mutate({ id: selectedDepartureId }); }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
