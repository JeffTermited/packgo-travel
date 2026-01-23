import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ReactNode } from "react";

interface GenericPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  ctaText?: string;
  ctaLink?: string;
}

export default function GenericPage({ title, subtitle, children, ctaText, ctaLink }: GenericPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[300px] bg-black flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70"></div>
          <div className="container relative z-10 text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{title}</h1>
            {subtitle && (
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {children}
            </div>
            
            {ctaText && ctaLink && (
              <div className="text-center mt-12">
                <Link href={ctaLink}>
                  <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8">
                    {ctaText}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
