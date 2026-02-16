'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from "@/sections/hero-section";
import StatsSection from "@/sections/stats-section";
import FeaturesSection from "@/sections/features-section";
import FaqSection from "@/sections/faq-section";
import TestimonialSection from "@/sections/testimonial-section";

export default function Page() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for authentication token
        const token = localStorage.getItem('auth_token');

        if (token) {
            // User is logged in, redirect to dashboard
            router.push('/dashboard');
        } else {
            // User is not logged in, show landing page
            setIsLoading(false);
        }
    }, [router]);

    // Show nothing while checking authentication status to prevent flash of content
    if (isLoading) {
        return <main className="min-h-screen bg-white dark:bg-gray-900" />;
    }

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
