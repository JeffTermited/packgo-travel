import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { quickInquirySchema } from "@/lib/validationSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Home, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import type { z } from "zod";

type QuickInquiryForm = z.infer<typeof quickInquirySchema>;

export default function QuickInquiry() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickInquiryForm>({
    resolver: zodResolver(quickInquirySchema),
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

  const onSubmit = (data: QuickInquiryForm) => {
    createInquiry.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="container max-w-2xl">
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              諮詢已送出！
            </h2>
            <p className="text-gray-600 mb-8">
              感謝您的諮詢，我們的專業顧問將在 24 小時內與您聯繫。
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
                繼續諮詢
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">快速諮詢</h1>
            <p className="text-gray-600">有任何旅遊問題嗎？請填寫表單，我們將盡快回覆您</p>
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
            {/* Customer Name */}
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

            {/* Customer Email */}
            <div>
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

            {/* Customer Phone */}
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

            {/* Subject */}
            <div>
              <Label htmlFor="subject">諮詢主旨 *</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="例如：日本東京五日遊詢問"
                className="rounded-full mt-2"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">諮詢內容 *</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="請詳細描述您的問題或需求..."
                rows={6}
                className="rounded-2xl mt-2"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createInquiry.isPending}
              className="w-full rounded-full h-12 text-lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {createInquiry.isPending ? "送出中..." : "送出諮詢"}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-3xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">服務時間</h3>
          <p className="text-gray-700 text-sm">
            週一至週五：09:00 - 18:00<br />
            週六：09:00 - 17:00<br />
            週日及國定假日：休息
          </p>
          <p className="text-gray-600 text-sm mt-4">
            我們將在 24 小時內回覆您的諮詢。如有緊急需求，請直接撥打客服專線：02-1234-5678
          </p>
        </div>
      </div>
    </div>
  );
}
