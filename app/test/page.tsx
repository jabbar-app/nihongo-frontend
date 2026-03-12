'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import CanDoList from '@/components/practice/can-do-list';
import PageContainer from '@/components/ui/page-container';
import PageHeader from '@/components/ui/page-header';

export default function CanDoPage() {
    const router = useRouter();

    return (
        <main className="min-h-[calc(100dvh-4rem)] bg-gray-50 dark:bg-gray-900">
            <PageContainer>
                <CanDoList />
            </PageContainer>
        </main>
    );
}
