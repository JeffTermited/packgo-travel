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
import { Calendar, Edit, Loader2, Plus, Trash2 } from "lucide-react";
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: t('departuresTab.statusOpen'), className: "bg-green-100 text-green-800" },
      full: { label: t('departuresTab.statusFull'), className: "bg-red-100 text-red-800" },
      cancelled: { label: t('departuresTab.statusCancelled'), className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t('departuresTab.title')}</h3>
          <p className="text-sm text-gray-600">{tourTitle}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('departuresTab.addDeparture')}
        </Button>
      </div>

      {/* Departures List */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('departuresTab.colDepartureDate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('departuresTab.colReturnDate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('departuresTab.colAdultPrice')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('departuresTab.colSlots')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('departuresTab.colStatus')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {t('departuresTab.colActions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departures && departures.length > 0 ? (
              departures.map((departure) => (
                <tr key={departure.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(departure.departureDate), "yyyy/MM/dd")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(departure.returnDate), "yyyy/MM/dd")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    NT$ {departure.adultPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {departure.bookedSlots} / {departure.totalSlots}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(departure.status)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(departure)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(departure.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>{t('departuresTab.noDepartures')}</p>
                  <p className="text-sm">{t('departuresTab.noDeparturesHint')}</p>
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
            <DialogDescription>{t('departuresTab.createDesc')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">{t('departuresTab.fieldDepartureDate')}</Label>
              <Input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={(e) =>
                  setFormData({ ...formData, departureDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate">{t('departuresTab.fieldReturnDate')}</Label>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData({ ...formData, returnDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adultPrice">{t('departuresTab.fieldAdultPrice')}</Label>
              <Input
                id="adultPrice"
                type="number"
                value={formData.adultPrice}
                onChange={(e) =>
                  setFormData({ ...formData, adultPrice: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childPriceWithBed">{t('departuresTab.fieldChildPriceWithBed')}</Label>
              <Input
                id="childPriceWithBed"
                type="number"
                value={formData.childPriceWithBed || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childPriceWithBed: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childPriceNoBed">{t('departuresTab.fieldChildPriceNoBed')}</Label>
              <Input
                id="childPriceNoBed"
                type="number"
                value={formData.childPriceNoBed || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childPriceNoBed: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="infantPrice">{t('departuresTab.fieldInfantPrice')}</Label>
              <Input
                id="infantPrice"
                type="number"
                value={formData.infantPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    infantPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="singleRoomSupplement">{t('departuresTab.fieldSingleRoomSupplement')}</Label>
              <Input
                id="singleRoomSupplement"
                type="number"
                value={formData.singleRoomSupplement || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    singleRoomSupplement: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalSlots">{t('departuresTab.fieldTotalSlots')}</Label>
              <Input
                id="totalSlots"
                type="number"
                value={formData.totalSlots}
                onChange={(e) =>
                  setFormData({ ...formData, totalSlots: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t('departuresTab.fieldStatus')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t('departuresTab.statusOpen')}</SelectItem>
                  <SelectItem value="full">{t('departuresTab.statusFull')}</SelectItem>
                  <SelectItem value="cancelled">{t('departuresTab.statusCancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">{t('departuresTab.fieldNotes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
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
            <DialogDescription>{t('departuresTab.editDesc')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-departureDate">{t('departuresTab.fieldDepartureDate')}</Label>
              <Input
                id="edit-departureDate"
                type="date"
                value={formData.departureDate}
                onChange={(e) =>
                  setFormData({ ...formData, departureDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-returnDate">{t('departuresTab.fieldReturnDate')}</Label>
              <Input
                id="edit-returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) =>
                  setFormData({ ...formData, returnDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-adultPrice">{t('departuresTab.fieldAdultPrice')}</Label>
              <Input
                id="edit-adultPrice"
                type="number"
                value={formData.adultPrice}
                onChange={(e) =>
                  setFormData({ ...formData, adultPrice: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-childPriceWithBed">{t('departuresTab.fieldChildPriceWithBed')}</Label>
              <Input
                id="edit-childPriceWithBed"
                type="number"
                value={formData.childPriceWithBed || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childPriceWithBed: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-childPriceNoBed">{t('departuresTab.fieldChildPriceNoBed')}</Label>
              <Input
                id="edit-childPriceNoBed"
                type="number"
                value={formData.childPriceNoBed || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childPriceNoBed: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-infantPrice">{t('departuresTab.fieldInfantPrice')}</Label>
              <Input
                id="edit-infantPrice"
                type="number"
                value={formData.infantPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    infantPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-singleRoomSupplement">{t('departuresTab.fieldSingleRoomSupplement')}</Label>
              <Input
                id="edit-singleRoomSupplement"
                type="number"
                value={formData.singleRoomSupplement || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    singleRoomSupplement: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-totalSlots">{t('departuresTab.fieldTotalSlots')}</Label>
              <Input
                id="edit-totalSlots"
                type="number"
                value={formData.totalSlots}
                onChange={(e) =>
                  setFormData({ ...formData, totalSlots: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">{t('departuresTab.fieldStatus')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">{t('departuresTab.statusOpen')}</SelectItem>
                  <SelectItem value="full">{t('departuresTab.statusFull')}</SelectItem>
                  <SelectItem value="cancelled">{t('departuresTab.statusCancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-notes">{t('departuresTab.fieldNotes')}</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t('departuresTab.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('departuresTab.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('departuresTab.deleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedDepartureId) {
                  deleteMutation.mutate({ id: selectedDepartureId });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
