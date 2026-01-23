import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  const handleManusLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073"
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

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "signin" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-transparent border border-black">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-black data-[state=active]:text-white text-black font-bold tracking-wide"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-black data-[state=active]:text-white text-black font-bold tracking-wide"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">
                  Member Login.
                </h2>
                <p className="text-gray-600 text-sm">
                  歡迎回來，繼續您的旅程
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="輸入您的電子郵件"
                      className="pl-12 h-12 border-2 border-black focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="輸入您的密碼"
                      className="pl-12 h-12 border-2 border-black focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border-2 border-black"
                    />
                    <span className="text-gray-700">記住我</span>
                  </label>
                  <a href="#" className="text-black underline hover:no-underline">
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black text-white hover:bg-gray-800 font-bold tracking-wide text-base"
                >
                  SIGN IN
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-12 border-2 border-black hover:bg-black hover:text-white font-medium"
                  onClick={handleManusLogin}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                  LINE
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-2 border-black hover:bg-black hover:text-white font-medium"
                  onClick={handleManusLogin}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">
                  Create Account.
                </h2>
                <p className="text-gray-600 text-sm">
                  開始您的旅程探索
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-black font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="輸入您的姓名"
                    className="h-12 border-2 border-black focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-black font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="輸入您的電子郵件"
                      className="pl-12 h-12 border-2 border-black focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-black font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="設定您的密碼"
                      className="pl-12 h-12 border-2 border-black focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 border-2 border-black"
                  />
                  <span className="text-gray-700">
                    我同意{" "}
                    <a href="#" className="text-black underline hover:no-underline">
                      服務條款
                    </a>{" "}
                    與{" "}
                    <a href="#" className="text-black underline hover:no-underline">
                      隱私政策
                    </a>
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-black text-white hover:bg-gray-800 font-bold tracking-wide text-base"
                >
                  CREATE ACCOUNT
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or register with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-12 border-2 border-black hover:bg-black hover:text-white font-medium"
                  onClick={handleManusLogin}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                  LINE
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-2 border-black hover:bg-black hover:text-white font-medium"
                  onClick={handleManusLogin}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-sm text-gray-600">
            <Link href="/" className="text-black underline hover:no-underline font-medium">
              ← 返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
