'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from "@/components/header-context";
import { ChevronLeftIcon } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';
import CanDoList from '@/components/practice/can-do-list';

export default function CanDoPage() {
    const { setHeaderContent } = useHeader();
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setHeaderContent(
                <div className="flex items-center justify-between w-full h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                            Can-do Checklist
                        </h1>
                    </div>
                    <ThemeToggle />
                </div>
            );
        } else {
            setHeaderContent(null);
        }
        return () => setHeaderContent(null);
    }, [setHeaderContent, isMobile, router]);

    return (
        <main className="min-h-[calc(100dvh-4rem)] bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <CanDoList />
        </main>
    );
}
