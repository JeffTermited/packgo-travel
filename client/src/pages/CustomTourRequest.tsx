import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { customTourSchema } from "@/lib/validationSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plane, Home, CheckCircle, CalendarIcon } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import type { z } from "zod";

type CustomTourForm = z.infer<typeof customTourSchema>;

export default function CustomTourRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CustomTourForm>({
    resolver: zodResolver(customTourSchema),
  });

  const createInquiry = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    },
    onError: (error) => {
      alert(`提交失敗：${error.message}`);
    },
  });

  const onSubmit = (data: CustomTourForm) => {
    createInquiry.mutate({
      inquiryType: "custom_tour",
      ...data,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="container max-w-2xl">
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              客製需求已送出！
            </h2>
            <p className="text-gray-600 mb-8">
              感謝您的信任，我們的專業旅遊規劃師將在 48 小時內為您量身打造專屬行程。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button className="rounded-full">
                  <Home className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="rounded-full"
              >
                繼續規劃
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">客製旅遊規劃</h1>
            <p className="text-gray-600">告訴我們您的夢想旅程，我們為您量身打造專屬行程</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="rounded-full">
              <Home className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Personal Info Section */}
            <div className="pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">聯絡資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customerName">姓名 *</Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    placeholder="請輸入您的姓名"
                    className="rounded-full mt-2"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">聯絡電話</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder="0912-345-678"
                    className="rounded-full mt-2"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="customerEmail">電子郵件 *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register("customerEmail")}
                    placeholder="example@email.com"
                    className="rounded-full mt-2"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Details Section */}
            <div className="pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">旅遊資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="destination">目的地 *</Label>
                  <Input
                    id="destination"
                    {...register("destination")}
                    placeholder="例如：日本東京、法國巴黎"
                    className="rounded-full mt-2"
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numberOfDays">旅遊天數 *</Label>
                  <Input
                    id="numberOfDays"
                    type="number"
                    {...register("numberOfDays", { valueAsNumber: true })}
                    placeholder="例如：5"
                    className="rounded-full mt-2"
                  />
                  {errors.numberOfDays && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfDays.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numberOfPeople">旅遊人數 *</Label>
                  <Input
                    id="numberOfPeople"
                    type="number"
                    {...register("numberOfPeople", { valueAsNumber: true })}
                    placeholder="例如：2"
                    className="rounded-full mt-2"
                  />
                  {errors.numberOfPeople && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="budget">預算範圍（TWD）</Label>
                  <Input
                    id="budget"
                    type="number"
                    {...register("budget", { valueAsNumber: true })}
                    placeholder="例如：50000"
                    className="rounded-full mt-2"
                  />
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>預計出發日期</Label>
                  <Controller
                    control={control}
                    name="preferredDepartureDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full rounded-full mt-2 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: zhTW })
                            ) : (
                              <span className="text-gray-500">選擇日期</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.preferredDepartureDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.preferredDepartureDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Requirements Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">需求描述</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="subject">行程主題 *</Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder="例如：親子旅遊、蜜月之旅、美食探索"
                    className="rounded-full mt-2"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">詳細需求 *</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="請告訴我們您的旅遊偏好、特殊需求、想去的景點、飲食限制等..."
                    rows={8}
                    className="rounded-2xl mt-2"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createInquiry.isPending}
              className="w-full rounded-full h-12 text-lg"
            >
              <Plane className="h-5 w-5 mr-2" />
              {createInquiry.isPending ? "送出中..." : "送出客製需求"}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-3xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">客製旅遊服務說明</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• 我們的專業旅遊規劃師將在 48 小時內與您聯繫</li>
            <li>• 根據您的需求量身打造專屬行程與報價</li>
            <li>• 提供 3 次免費行程修改服務</li>
            <li>• 全程專人服務，確保旅程完美</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
