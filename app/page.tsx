import HeroSection from "@/sections/hero-section";
import StatsSection from "@/sections/stats-section";
import FeaturesSection from "@/sections/features-section";
import FaqSection from "@/sections/faq-section";
import TestimonialSection from "@/sections/testimonial-section";

export default function Page() {
    return (
        <main className="bg-white dark:bg-gray-900">
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <FaqSection />
            <TestimonialSection />
        </main>
    );
}
