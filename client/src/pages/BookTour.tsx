import { useEffect, useState } from "react";
import { useParams, useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Users, CreditCard, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

type BookingStep = "date" | "travelers" | "details" | "confirm";

export default function BookTour() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  // Using sonner toast
  
  const tourId = params.id ? parseInt(params.id) : 0;
  const [currentStep, setCurrentStep] = useState<BookingStep>("date");
  
  // Selected data
  const [selectedDepartureId, setSelectedDepartureId] = useState<number | null>(null);
  const [numberOfAdults, setNumberOfAdults] = useState(1);
  const [numberOfChildrenWithBed, setNumberOfChildrenWithBed] = useState(0);
  const [numberOfChildrenNoBed, setNumberOfChildrenNoBed] = useState(0);
  const [numberOfInfants, setNumberOfInfants] = useState(0);
  const [numberOfSingleRooms, setNumberOfSingleRooms] = useState(0);
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");
  
  // Participant details
  const [participants, setParticipants] = useState<any[]>([]);
  
  // Queries
  const { data: tour, isLoading: tourLoading } = trpc.tours.getById.useQuery({ id: tourId });
  const { data: departures, isLoading: departuresLoading } = trpc.departures.listByTour.useQuery({ tourId });
  const createBookingMutation = trpc.bookings.create.useMutation();
  
  const selectedDeparture = departures?.find(d => d.id === selectedDepartureId);
  
  // Pre-fill customer details from user
  useEffect(() => {
    if (user && !customerName) {
      setCustomerName(user.name || "");
      setCustomerEmail(user.email || "");
    }
  }, [user, customerName]);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedDeparture) return 0;
    
    let total = 0;
    total += numberOfAdults * selectedDeparture.adultPrice;
    if (selectedDeparture.childPriceWithBed) {
      total += numberOfChildrenWithBed * selectedDeparture.childPriceWithBed;
    }
    if (selectedDeparture.childPriceNoBed) {
      total += numberOfChildrenNoBed * selectedDeparture.childPriceNoBed;
    }
    if (selectedDeparture.infantPrice) {
      total += numberOfInfants * selectedDeparture.infantPrice;
    }
    if (selectedDeparture.singleRoomSupplement) {
      total += numberOfSingleRooms * selectedDeparture.singleRoomSupplement;
    }
    
    return total;
  };
  
  const totalPrice = calculateTotalPrice();
  const depositAmount = Math.round(totalPrice * 0.2);
  
  // Handle booking submission
  const handleSubmit = async () => {
    if (!user) {
      toast.error("請先登入", {
        description: "您需要登入才能預訂行程",
      });
      window.location.href = getLoginUrl();
      return;
    }
    
    if (!selectedDepartureId) {
      toast.error("請選擇出發日期");
      return;
    }
    
    if (numberOfAdults === 0 && numberOfChildrenWithBed === 0 && numberOfChildrenNoBed === 0) {
      toast.error("請至少選擇一位旅客");
      return;
    }
    
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error("請填寫完整的聯絡資訊");
      return;
    }
    
    // Validate participants
    const totalPeople = numberOfAdults + numberOfChildrenWithBed + numberOfChildrenNoBed + numberOfInfants;
    if (participants.length !== totalPeople) {
      toast.error("請填寫所有旅客資訊");
      return;
    }
    
    try {
      const booking = await createBookingMutation.mutateAsync({
        tourId,
        departureId: selectedDepartureId,
        customerName,
        customerEmail,
        customerPhone,
        numberOfAdults,
        numberOfChildrenWithBed,
        numberOfChildrenNoBed,
        numberOfInfants,
        numberOfSingleRooms,
        message,
        participants: participants.map(p => ({
          ...p,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
          passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : undefined,
        })),
      });
      
      toast.success("預訂成功！", {
        description: `您的預訂編號是 #${booking.id}，正在前往付款頁面...`,
      });
      
      // Navigate to booking detail page after a short delay
      setTimeout(() => {
        navigate(`/booking/${booking.id}`);
      }, 1500);
    } catch (error: any) {
      toast.error("預訂失敗", {
        description: error.message || "請稍後再試",
      });
    }
  };
  
  // Initialize participants array when traveler numbers change
  useEffect(() => {
    const totalPeople = numberOfAdults + numberOfChildrenWithBed + numberOfChildrenNoBed + numberOfInfants;
    const newParticipants = [];
    
    for (let i = 0; i < numberOfAdults; i++) {
      newParticipants.push({
        participantType: "adult",
        firstName: participants[i]?.firstName || "",
        lastName: participants[i]?.lastName || "",
        gender: participants[i]?.gender || undefined,
        dateOfBirth: participants[i]?.dateOfBirth || "",
        passportNumber: participants[i]?.passportNumber || "",
        passportExpiry: participants[i]?.passportExpiry || "",
        nationality: participants[i]?.nationality || "",
        dietaryRequirements: participants[i]?.dietaryRequirements || "",
        specialNeeds: participants[i]?.specialNeeds || "",
      });
    }
    
    for (let i = 0; i < numberOfChildrenWithBed + numberOfChildrenNoBed; i++) {
      const idx = numberOfAdults + i;
      newParticipants.push({
        participantType: "child",
        firstName: participants[idx]?.firstName || "",
        lastName: participants[idx]?.lastName || "",
        gender: participants[idx]?.gender || undefined,
        dateOfBirth: participants[idx]?.dateOfBirth || "",
        passportNumber: participants[idx]?.passportNumber || "",
        passportExpiry: participants[idx]?.passportExpiry || "",
        nationality: participants[idx]?.nationality || "",
        dietaryRequirements: participants[idx]?.dietaryRequirements || "",
        specialNeeds: participants[idx]?.specialNeeds || "",
      });
    }
    
    for (let i = 0; i < numberOfInfants; i++) {
      const idx = numberOfAdults + numberOfChildrenWithBed + numberOfChildrenNoBed + i;
      newParticipants.push({
        participantType: "infant",
        firstName: participants[idx]?.firstName || "",
        lastName: participants[idx]?.lastName || "",
        gender: participants[idx]?.gender || undefined,
        dateOfBirth: participants[idx]?.dateOfBirth || "",
        passportNumber: participants[idx]?.passportNumber || "",
        passportExpiry: participants[idx]?.passportExpiry || "",
        nationality: participants[idx]?.nationality || "",
        dietaryRequirements: participants[idx]?.dietaryRequirements || "",
        specialNeeds: participants[idx]?.specialNeeds || "",
      });
    }
    
    setParticipants(newParticipants);
  }, [numberOfAdults, numberOfChildrenWithBed, numberOfChildrenNoBed, numberOfInfants]);
  
  if (tourLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">找不到行程</h1>
          <Button onClick={() => navigate("/")}>返回首頁</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: "date", label: "選擇日期", icon: Calendar },
              { key: "travelers", label: "旅客人數", icon: Users },
              { key: "details", label: "填寫資訊", icon: CreditCard },
              { key: "confirm", label: "確認預訂", icon: CheckCircle },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = 
                (step.key === "date" && selectedDepartureId) ||
                (step.key === "travelers" && numberOfAdults > 0) ||
                (step.key === "details" && customerName && customerEmail && customerPhone);
              
              return (
                <div key={step.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        isActive
                          ? "bg-black text-white border-black"
                          : isCompleted
                          ? "bg-gray-800 text-white border-gray-800"
                          : "bg-white text-gray-400 border-gray-300"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`mt-2 text-sm ${isActive ? "font-bold" : ""}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted ? "bg-gray-800" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Tour Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{tour.title}</CardTitle>
            <CardDescription>
              {tour.destination} · {tour.duration} 天
            </CardDescription>
          </CardHeader>
        </Card>
        
        {/* Step 1: Date Selection */}
        {currentStep === "date" && (
          <Card>
            <CardHeader>
              <CardTitle>選擇出發日期</CardTitle>
              <CardDescription>請選擇您希望的出發日期</CardDescription>
            </CardHeader>
            <CardContent>
              {departuresLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : departures && departures.length > 0 ? (
                <div className="space-y-4">
                  {departures.map(departure => {
                    const availableSlots = departure.totalSlots - departure.bookedSlots;
                    const isAvailable = availableSlots > 0 && departure.status === "open";
                    
                    return (
                      <div
                        key={departure.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedDepartureId === departure.id
                            ? "border-black bg-gray-50"
                            : isAvailable
                            ? "border-gray-300 hover:border-gray-400"
                            : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                        }`}
                        onClick={() => isAvailable && setSelectedDepartureId(departure.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg">
                              {new Date(departure.departureDate).toLocaleDateString("zh-TW", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              返回日期：{new Date(departure.returnDate).toLocaleDateString("zh-TW")}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              剩餘名額：{availableSlots} / {departure.totalSlots}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {departure.currency} ${departure.adultPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">起/人</div>
                          </div>
                        </div>
                        {!isAvailable && (
                          <div className="mt-2 text-sm text-red-600 font-medium">
                            {departure.status === "cancelled" ? "已取消" : "已額滿"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  目前沒有可預訂的出發日期
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setCurrentStep("travelers")}
                  disabled={!selectedDepartureId}
                >
                  下一步
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Traveler Configuration */}
        {currentStep === "travelers" && selectedDeparture && (
          <Card>
            <CardHeader>
              <CardTitle>選擇旅客人數</CardTitle>
              <CardDescription>請選擇參加人數與房型配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">成人</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="0"
                    value={numberOfAdults}
                    onChange={(e) => setNumberOfAdults(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    ${selectedDeparture.adultPrice.toLocaleString()} / 人
                  </div>
                </div>
                
                {selectedDeparture.childPriceWithBed && (
                  <div>
                    <Label htmlFor="childrenWithBed">兒童（佔床）</Label>
                    <Input
                      id="childrenWithBed"
                      type="number"
                      min="0"
                      value={numberOfChildrenWithBed}
                      onChange={(e) => setNumberOfChildrenWithBed(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      ${selectedDeparture.childPriceWithBed.toLocaleString()} / 人
                    </div>
                  </div>
                )}
                
                {selectedDeparture.childPriceNoBed && (
                  <div>
                    <Label htmlFor="childrenNoBed">兒童（不佔床）</Label>
                    <Input
                      id="childrenNoBed"
                      type="number"
                      min="0"
                      value={numberOfChildrenNoBed}
                      onChange={(e) => setNumberOfChildrenNoBed(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      ${selectedDeparture.childPriceNoBed.toLocaleString()} / 人
                    </div>
                  </div>
                )}
                
                {selectedDeparture.infantPrice && (
                  <div>
                    <Label htmlFor="infants">嬰兒</Label>
                    <Input
                      id="infants"
                      type="number"
                      min="0"
                      value={numberOfInfants}
                      onChange={(e) => setNumberOfInfants(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      ${selectedDeparture.infantPrice.toLocaleString()} / 人
                    </div>
                  </div>
                )}
                
                {selectedDeparture.singleRoomSupplement && (
                  <div>
                    <Label htmlFor="singleRooms">單人房數量</Label>
                    <Input
                      id="singleRooms"
                      type="number"
                      min="0"
                      value={numberOfSingleRooms}
                      onChange={(e) => setNumberOfSingleRooms(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      ${selectedDeparture.singleRoomSupplement.toLocaleString()} / 間
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span>總金額</span>
                    <span className="font-bold">${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>訂金（20%）</span>
                    <span>${depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>尾款</span>
                    <span>${(totalPrice - depositAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("date")}>
                  上一步
                </Button>
                <Button
                  onClick={() => setCurrentStep("details")}
                  disabled={numberOfAdults === 0 && numberOfChildrenWithBed === 0 && numberOfChildrenNoBed === 0}
                >
                  下一步
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Customer & Participant Details */}
        {currentStep === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>填寫聯絡資訊與旅客資料</CardTitle>
              <CardDescription>請填寫完整的聯絡資訊與所有旅客資料</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Contact */}
              <div>
                <h3 className="font-bold text-lg mb-4">聯絡資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">姓名 *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">電子郵件 *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">電話 *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="message">備註</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="如有特殊需求請在此說明"
                  />
                </div>
              </div>
              
              {/* Participants */}
              <div>
                <h3 className="font-bold text-lg mb-4">旅客資料</h3>
                <div className="space-y-6">
                  {participants.map((participant, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">
                        旅客 {index + 1} ({participant.participantType === "adult" ? "成人" : participant.participantType === "child" ? "兒童" : "嬰兒"})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>名字（英文）*</Label>
                          <Input
                            value={participant.firstName}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].firstName = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label>姓氏（英文）*</Label>
                          <Input
                            value={participant.lastName}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].lastName = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label>性別</Label>
                          <Select
                            value={participant.gender}
                            onValueChange={(value) => {
                              const newParticipants = [...participants];
                              newParticipants[index].gender = value;
                              setParticipants(newParticipants);
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="選擇性別" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">男性</SelectItem>
                              <SelectItem value="female">女性</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>出生日期</Label>
                          <Input
                            type="date"
                            value={participant.dateOfBirth}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].dateOfBirth = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>護照號碼</Label>
                          <Input
                            value={participant.passportNumber}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].passportNumber = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>護照到期日</Label>
                          <Input
                            type="date"
                            value={participant.passportExpiry}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].passportExpiry = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>國籍</Label>
                          <Input
                            value={participant.nationality}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].nationality = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>飲食需求</Label>
                          <Input
                            value={participant.dietaryRequirements}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].dietaryRequirements = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                            placeholder="例：素食、海鮮過敏"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>特殊需求</Label>
                          <Input
                            value={participant.specialNeeds}
                            onChange={(e) => {
                              const newParticipants = [...participants];
                              newParticipants[index].specialNeeds = e.target.value;
                              setParticipants(newParticipants);
                            }}
                            className="mt-1"
                            placeholder="例：輪椅、嬰兒床"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("travelers")}>
                  上一步
                </Button>
                <Button onClick={() => setCurrentStep("confirm")}>
                  下一步
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: Confirmation */}
        {currentStep === "confirm" && selectedDeparture && (
          <Card>
            <CardHeader>
              <CardTitle>確認預訂</CardTitle>
              <CardDescription>請確認您的預訂資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">行程資訊</h3>
                <div className="text-sm space-y-1">
                  <div>行程：{tour.title}</div>
                  <div>
                    出發日期：{new Date(selectedDeparture.departureDate).toLocaleDateString("zh-TW")}
                  </div>
                  <div>
                    返回日期：{new Date(selectedDeparture.returnDate).toLocaleDateString("zh-TW")}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">旅客人數</h3>
                <div className="text-sm space-y-1">
                  {numberOfAdults > 0 && <div>成人：{numberOfAdults} 位</div>}
                  {numberOfChildrenWithBed > 0 && <div>兒童（佔床）：{numberOfChildrenWithBed} 位</div>}
                  {numberOfChildrenNoBed > 0 && <div>兒童（不佔床）：{numberOfChildrenNoBed} 位</div>}
                  {numberOfInfants > 0 && <div>嬰兒：{numberOfInfants} 位</div>}
                  {numberOfSingleRooms > 0 && <div>單人房：{numberOfSingleRooms} 間</div>}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">聯絡資訊</h3>
                <div className="text-sm space-y-1">
                  <div>姓名：{customerName}</div>
                  <div>電子郵件：{customerEmail}</div>
                  <div>電話：{customerPhone}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">總金額</span>
                    <span className="font-bold">${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>訂金（20%）</span>
                    <span>${depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>尾款</span>
                    <span>${(totalPrice - depositAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">付款說明：</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>點擊「確認預訂」後，系統將建立您的預訂記錄</li>
                  <li>您可以選擇支付訂金（20%）或全額付款</li>
                  <li>訂金需在 3 天內完成支付</li>
                  <li>尾款需在出發前 30 天完成支付</li>
                </ul>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("details")}>
                  上一步
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  確認預訂
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
