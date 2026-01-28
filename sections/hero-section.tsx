'use client';

import Button from "@/components/ui/button";
import { SparkleIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function HeroSection() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <section className="bg-gradient-to-br from-blue-500 to-blue-400 min-h-screen flex items-center justify-center px-4 py-20 md:py-32">
            <div className="max-w-md md:max-w-2xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6 text-white text-sm">
                    <StarIcon className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    <span>Built for consistency</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    Learn Japanese with a daily plan that sticks.
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
                    Review what's due, build momentum with quick wins, and track reading + focus sessions—all in one place.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={() => router.push(isLoggedIn ? '/review' : '/login')}
                        size="lg"
                        fullWidth={false}
                        className="sm:w-auto"
                    >
                        Start studying
                    </Button>
                    <Link href="#features">
                        <Button
                            variant="outline"
                            size="lg"
                            className="bg-white/10 border-white/30 text-white hover:bg-white/20 sm:w-auto"
                        >
                            See how it works
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
