import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useRecaptcha } from "@/hooks/useRecaptcha";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { executeRecaptcha } = useRecaptcha();

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("重設密碼連結已發送", {
        description: "請檢查您的電子郵件",
      });
    },
    onError: (error) => {
      toast.error("發送失敗", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("請輸入電子郵件");
      return;
    }

    // Execute reCAPTCHA v3 before submitting
    const recaptchaToken = await executeRecaptcha("forgot_password");

    requestResetMutation.mutate({
      email,
      recaptchaToken: recaptchaToken ?? undefined,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
          alt="Travel"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-start justify-center px-16 text-white">
          <h1 className="text-5xl font-serif font-bold mb-4 tracking-tight">
            TRAVEL NOIR
          </h1>
          <p className="text-xl text-gray-300 font-light tracking-wide">
            讓旅行更美好
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-bold text-black">
              <img
                src="/logo.png"
                alt="PACK&GO"
                className="h-10 w-auto"
              />
              <div className="flex flex-col items-start">
                <span className="text-2xl tracking-tight">PACK&GO</span>
                <span className="text-xs font-normal text-gray-600 tracking-wide">
                  讓旅行更美好
                </span>
              </div>
            </Link>
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回登入
                </Link>
                <h2 className="text-3xl font-bold text-black mb-2">
                  忘記密碼？
                </h2>
                <p className="text-gray-600 text-sm">
                  輸入您的電子郵件，我們將發送重設密碼的連結給您
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">
                    電子郵件
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="輸入您的電子郵件"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold tracking-wide rounded-full"
                  disabled={requestResetMutation.isPending}
                >
                  {requestResetMutation.isPending ? "發送中..." : "發送重設連結"}
                </Button>

                {/* reCAPTCHA disclosure */}
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  受 Google reCAPTCHA 保護 ·{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-600"
                  >
                    隱私權政策
                  </a>
                  {" "}及{" "}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-600"
                  >
                    服務條款
                  </a>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  檢查您的電子郵件
                </h2>
                <p className="text-gray-600 text-sm">
                  我們已經發送重設密碼的連結到
                </p>
                <p className="text-black font-medium mt-1">{email}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>沒有收到郵件？</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-black hover:underline font-medium mt-1"
                >
                  重新發送
                </button>
              </div>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-black hover:bg-gray-50 text-black font-bold tracking-wide rounded-full"
                >
                  返回登入
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
