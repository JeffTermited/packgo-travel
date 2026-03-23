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
import { useLocale } from "@/contexts/LocaleContext";
import type { z } from "zod";

type QuickInquiryForm = z.infer<typeof quickInquirySchema>;

export default function QuickInquiry() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useLocale();

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
      alert(`${t('common.error')}：${error.message}`);
    },
  });

  const onSubmit = (data: QuickInquiryForm) => {
    createInquiry.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="container max-w-2xl">
          <div className="bg-white  shadow-lg p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {t('quickInquiry.success.title')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('quickInquiry.success.description')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button className="rounded-none">
                  <Home className="h-4 w-4 mr-2" />
                  {t('common.backToHome')}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="rounded-none"
              >
                {t('common.submit')}
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
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{t('quickInquiry.title')}</h1>
            <p className="text-gray-600">{t('quickInquiry.subtitle')}</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="rounded-none">
              <Home className="h-4 w-4 mr-2" />
              {t('common.backToHome')}
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white  shadow-lg p-8">
          <div className="space-y-6">
            {/* Customer Name */}
            <div>
              <Label htmlFor="customerName">{t('quickInquiry.form.name')} *</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder={t('quickInquiry.form.namePlaceholder')}
                className="rounded-none mt-2"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <Label htmlFor="customerEmail">{t('quickInquiry.form.email')} *</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register("customerEmail")}
                placeholder={t('quickInquiry.form.emailPlaceholder')}
                className="rounded-none mt-2"
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
              )}
            </div>

            {/* Customer Phone */}
            <div>
              <Label htmlFor="customerPhone">{t('quickInquiry.form.phone')}</Label>
              <Input
                id="customerPhone"
                {...register("customerPhone")}
                placeholder={t('quickInquiry.form.phonePlaceholder')}
                className="rounded-none mt-2"
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">{t('quickInquiry.form.subject')} *</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder={t('quickInquiry.form.subjectPlaceholder')}
                className="rounded-none mt-2"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">{t('quickInquiry.form.message')} *</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder={t('quickInquiry.form.messagePlaceholder')}
                rows={6}
                className=" mt-2"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createInquiry.isPending}
              className="w-full rounded-none h-12 text-lg"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {createInquiry.isPending ? t('quickInquiry.form.submitting') : t('quickInquiry.form.submitButton')}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50  p-6">
          <h3 className="font-semibold text-gray-900 mb-3">{t('contactUs.businessHours')}</h3>
          <p className="text-gray-700 text-sm">
            {t('contactUs.weekdays')}：09:00 - 18:00<br />
            {t('contactUs.saturday')}：09:00 - 17:00<br />
            {t('contactUs.sunday')}：{t('contactUs.closed')}
          </p>
          <p className="text-gray-600 text-sm mt-4">
            {t('quickInquiry.success.description')}
          </p>
        </div>
      </div>
    </div>
  );
}
