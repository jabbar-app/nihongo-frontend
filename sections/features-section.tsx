'use client';

import { features } from "@/data/features";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { ArrowUpRightIcon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeaturesSection() {
  const router = useRouter();

  return (
    <section id="features" className="py-12 md:py-16 px-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-md md:max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">Core Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for consistent Japanese study
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Reviews, mnemonics, a daily plan, practice conversations, and time tracking—built to help you build a sustainable study habit.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {features.map((feature, index) => {
            const isLast = index === features.length - 1;
            const card = (
              <Card
                key={index}
                className={`p-5 dark:bg-gray-800 dark:border-gray-700 border border-gray-100 ${isLast ? 'md:w-full md:max-w-[calc(50%-0.75rem)]' : ''}`}
              >
                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </Card>
            );
            return isLast ? (
              <div key={index} className="md:col-span-2 flex justify-center">
                {card}
              </div>
            ) : (
              card
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => router.push('/login')}
            size="lg"
          >
            Start studying
            <ArrowUpRightIcon className="w-4 h-4 ml-2 inline" />
          </Button>
        </div>
      </div>
    </section>
  );
}
