'use client';

import Button from "@/components/ui/button";
import { FlameIcon, BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroSection() {
  const router = useRouter();
  const [isLoggedIn] = useState(() =>
    typeof window !== "undefined" ? !!localStorage.getItem("auth_token") : false
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 md:py-32 overflow-hidden">
      {/* Gradient background - teal (app primary) with dark mode variant */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-500 to-teal-600 dark:from-teal-600 dark:via-teal-700 dark:to-teal-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.08),transparent)]" />

      <div className="relative max-w-md md:max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-white text-sm border border-white/20">
          <FlameIcon className="w-4 h-4 text-amber-300" />
          <span>Built for consistency</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:px-4 md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-sm">
          Learn Japanese with a daily plan that sticks.
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
          Spaced repetition reviews, mnemonics, decks, and practice conversations—all in one place. Start studying and track your progress.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
          <Button
            variant="primary"
            onClick={() => router.push(isLoggedIn ? '/review' : '/login')}
            size="lg"
            className="w-full sm:w-52 cursor-pointer"
          >
            Start studying
          </Button>
          <Link href="#features" className="w-full sm:w-52 flex cursor-pointer">
            <Button
              variant="secondary"
              size="lg"
              className="w-full whitespace-nowrap cursor-pointer"
            >
              See how it works
            </Button>
          </Link>
        </div>

        {/* Quick app teaser */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-white/80 text-sm">
          <span className="flex items-center gap-1.5">
            <BookOpenIcon className="w-4 h-4" /> Reviews
          </span>
          <span className="flex items-center gap-1.5">
            <FlameIcon className="w-4 h-4 text-amber-300" /> Streaks
          </span>
          <span>Decks • Mnemonics • Practice</span>
        </div>
      </div>
    </section>
  );
}
