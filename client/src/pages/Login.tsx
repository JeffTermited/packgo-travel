import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [, setLocation] = useLocation();
  // Using sonner for toast notifications

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Login mutation
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("登入成功", {
        description: "歡迎回來！",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast.error("登入失敗", {
        description: error.message,
      });
    },
  });

  // Register mutation
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("註冊成功", {
        description: "歡迎加入 PACK&GO！",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast.error("註冊失敗", {
        description: error.message,
      });
    },
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("請填寫所有欄位");
      return;
    }
    loginMutation.mutate({ email: signInEmail, password: signInPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("請填寫所有欄位");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error("密碼不一致", {
        description: "請確認兩次輸入的密碼相同",
      });
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("密碼太短", {
        description: "密碼至少需要 8 個字元",
      });
      return;
    }

    registerMutation.mutate({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white relative">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回首頁</span>
        </Link>

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

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "signin" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-transparent border border-black rounded-full">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-black data-[state=active]:text-white text-black font-bold tracking-wide rounded-full"
              >
                登入
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-black data-[state=active]:text-white text-black font-bold tracking-wide rounded-full"
              >
                註冊
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">
                  會員登入
                </h2>
                <p className="text-gray-600 text-sm">
                  歡迎回來，繼續您的旅程
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSignIn}>
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
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-12 h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black font-medium">
                    密碼
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="輸入您的密碼"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-12 h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link href="/forgot-password" className="text-black hover:underline font-medium">
                    忘記密碼？
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold tracking-wide rounded-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "登入中..." : "登入"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">或使用</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-black hover:bg-gray-50 text-black font-bold tracking-wide rounded-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  使用 Google 登入
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">
                  建立帳號
                </h2>
                <p className="text-gray-600 text-sm">
                  開始您的旅程，探索世界
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-black font-medium">
                    姓名
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="輸入您的姓名"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-black font-medium">
                    電子郵件
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="輸入您的電子郵件"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-12 h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-black font-medium">
                    密碼
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="至少 8 個字元"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-12 h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-black font-medium">
                    確認密碼
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="再次輸入密碼"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className="pl-12 h-12 border-2 border-black rounded-full focus:ring-2 focus:ring-black"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold tracking-wide rounded-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "註冊中..." : "註冊"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">或使用</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-black hover:bg-gray-50 text-black font-bold tracking-wide rounded-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  使用 Google 註冊
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
