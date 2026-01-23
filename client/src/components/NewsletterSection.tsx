import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("請輸入電子郵件地址");
      return;
    }
    subscribe.mutate({ email });
  };

  return (
    <section className="bg-black py-16 border-b border-gray-800">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white md:w-1/2">
            <h3 className="text-2xl font-serif font-bold mb-2">訂閱時事通訊</h3>
            <p className="text-gray-300">訂閱我們的電子報，獲取最新的旅遊資訊及優惠活動</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full md:w-1/2 flex gap-0">
            <div className="relative flex-grow">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="輸入您的電子郵件地址" 
                className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                disabled={subscribe.isPending}
              />
            </div>
            <Button 
              type="submit"
              disabled={subscribe.isPending}
              className="h-12 px-8 bg-white hover:bg-gray-200 text-black rounded-none font-bold tracking-wide"
            >
              {subscribe.isPending ? "訂閱中..." : "訂閱"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
