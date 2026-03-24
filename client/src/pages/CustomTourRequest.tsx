import { useState } from "react";
import SEO from "@/components/SEO";
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
import { useLocale } from "@/contexts/LocaleContext";

type CustomTourForm = z.infer<typeof customTourSchema>;

export default function CustomTourRequest() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useLocale();

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
      alert(`${t("customTourRequest.submitError").replace("{message}", error.message)}`);
    },
  });

  const onSubmit = (data: CustomTourForm) => {
    createInquiry.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <SEO title="客製行程申請" description="填寫您的旅遊需求，PACK&GO 專業顧問將為您規劃最適合的客製化行程。" url="/custom-tour-request" />
        <div className="container max-w-2xl">
          <div className="bg-white  shadow-lg p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {t("customTourRequest.successTitle2")}
            </h2>
            <p className="text-gray-600 mb-8">
              {t("customTourRequest.successDesc2")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button className="rounded-none">
                  <Home className="h-4 w-4 mr-2" />
                  {t("customTourRequest.backHome")}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="rounded-none"
              >
                {t("customTourRequest.continuePlanning")}
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
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              {t("customTourRequest.pageTitle")}
            </h1>
            <p className="text-gray-600">{t("customTourRequest.pageSubtitle")}</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="rounded-none">
              <Home className="h-4 w-4 mr-2" />
              {t("customTourRequest.backHome")}
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white  shadow-lg p-8">
          <div className="space-y-6">
            {/* Personal Info Section */}
            <div className="pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("customTourRequest.contactSection")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="customerName">{t("customTourRequest.nameRequired")}</Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    placeholder={t("customTourRequest.namePlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">{t("customTourRequest.phone")}</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder={t("customTourRequest.phonePlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="customerEmail">{t("customTourRequest.emailRequired")}</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register("customerEmail")}
                    placeholder="example@email.com"
                    className="rounded-none mt-2"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Details Section */}
            <div className="pb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("customTourRequest.travelSection")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="destination">{t("customTourRequest.destinationRequired")}</Label>
                  <Input
                    id="destination"
                    {...register("destination")}
                    placeholder={t("customTourRequest.destinationPlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numberOfDays">{t("customTourRequest.numberOfDays")}</Label>
                  <Input
                    id="numberOfDays"
                    type="number"
                    {...register("numberOfDays", { valueAsNumber: true })}
                    placeholder={t("customTourRequest.numberOfDaysPlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.numberOfDays && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfDays.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numberOfPeople">{t("customTourRequest.numberOfPeople")}</Label>
                  <Input
                    id="numberOfPeople"
                    type="number"
                    {...register("numberOfPeople", { valueAsNumber: true })}
                    placeholder={t("customTourRequest.numberOfPeoplePlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.numberOfPeople && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="budget">{t("customTourRequest.budget")}</Label>
                  <Input
                    id="budget"
                    type="number"
                    {...register("budget", { valueAsNumber: true })}
                    placeholder={t("customTourRequest.budgetPlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>{t("customTourRequest.preferredDepartureDate")}</Label>
                  <Controller
                    control={control}
                    name="preferredDepartureDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full rounded-none mt-2 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: zhTW })
                            ) : (
                              <span className="text-gray-500">
                                {t("customTourRequest.selectDate")}
                              </span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("customTourRequest.requirementSection")}
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="subject">{t("customTourRequest.subject")}</Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder={t("customTourRequest.subjectPlaceholder")}
                    className="rounded-none mt-2"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">{t("customTourRequest.message")}</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder={t("customTourRequest.messagePlaceholder")}
                    rows={8}
                    className=" mt-2"
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
              className="w-full rounded-none h-12 text-lg"
            >
              <Plane className="h-5 w-5 mr-2" />
              {createInquiry.isPending
                ? t("customTourRequest.submitPending")
                : t("customTourRequest.submitButton")}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50  p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {t("customTourRequest.serviceTitle")}
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>• {t("customTourRequest.serviceItem1")}</li>
            <li>• {t("customTourRequest.serviceItem2")}</li>
            <li>• {t("customTourRequest.serviceItem3")}</li>
            <li>• {t("customTourRequest.serviceItem4")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
