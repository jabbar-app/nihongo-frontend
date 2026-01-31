'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FileTextIcon, LoaderIcon, FolderIcon } from 'lucide-react';

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
            } catch (error) {
                console.error('Failed to fetch materials', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Materials</h1>

            <div className="space-y-8">
                {Object.keys(groupedMaterials).length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        No materials found.
                    </div>
                ) : (
                    Object.entries(groupedMaterials).map(([source, materials]) => (
                        <div key={source} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                <FolderIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{source}</h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {materials.map((material) => (
                                    <Link
                                        key={material.id}
                                        href={`/materials/${material.id}`}
                                        className="block p-4 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl group-hover:scale-110 transition-transform">
                                                <FileTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                    {material.title}
                                                </h3>
                                                {material.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {material.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
