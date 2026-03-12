'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FileTextIcon, FolderIcon, BookOpenIcon } from 'lucide-react';
import PageContainer from '@/components/ui/page-container';
import PageHeader from '@/components/ui/page-header';
import LoadingScreen from '@/components/ui/loading-screen';
import EmptyState from '@/components/ui/empty-state';
import ErrorScreen from '@/components/ui/error-screen';

interface Material {
    id: number;
    title: string;
    source: string;
    description: string | null;
    file_path: string;
}

interface GroupedMaterials {
    [source: string]: Material[];
}

export default function MaterialsPage() {
    const [groupedMaterials, setGroupedMaterials] = useState<GroupedMaterials>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await api.get<{ data: Material[] }>('/api/v1/materials');
                const materials = response.data;

                // Group by source
                const grouped = materials.reduce((acc, material) => {
                    if (!acc[material.source]) {
                        acc[material.source] = [];
                    }
                    acc[material.source].push(material);
                    return acc;
                }, {} as GroupedMaterials);

                setGroupedMaterials(grouped);

                const sources = Object.keys(grouped);
                if (sources.length > 0) {
                    setActiveTab(sources[0]);
                }
            } catch (error) {
                console.error('Failed to fetch materials', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    if (loading) return <LoadingScreen message="Fetching materials..." />;
    
    if (error) return <ErrorScreen onRetry={() => window.location.reload()} />;

    const sources = Object.keys(groupedMaterials);
    const activeMaterials = activeTab ? groupedMaterials[activeTab] || [] : [];

    return (
        <PageContainer>
            <PageHeader
                title="Learning Materials"
                titleJa="学習資料"
                description="Access and study from your course books."
                icon={<BookOpenIcon className="w-6 h-6" />}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Learning Materials' }
                ]}
            />

            {sources.length === 0 ? (
                <EmptyState 
                    title="No materials available"
                    description="Access and study will be available once materials are uploaded."
                    icon={<BookOpenIcon className="w-10 h-10 opacity-40" />}
                />
            ) : (
                <div className="space-y-8">
                    {/* Horizontal Scrollable Tabs */}
                    <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 dark:border-gray-700 pt-2 shrink-0">
                        <div className="flex gap-6 px-1">
                            {sources.map((source) => (
                                <button
                                    key={source}
                                    onClick={() => setActiveTab(source)}
                                    className={`whitespace-nowrap py-4 px-2 font-medium text-sm transition-all border-b-2 cursor-pointer ${activeTab === source
                                            ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {source}
                                    <span className={`ml-2 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full ${activeTab === source ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                        {groupedMaterials[source].length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Materials Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {activeMaterials.map((material) => (
                            <Link
                                key={material.id}
                                href={`/materials/${material.id}`}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-700/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-transform">
                                        <FileTextIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                        PDF
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-2 line-clamp-2">
                                    {material.title}
                                </h3>
                                {material.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mt-auto pt-2 border-t border-gray-50 dark:border-gray-700/50">
                                        {material.description}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
