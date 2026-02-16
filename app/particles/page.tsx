'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon, PlayIcon, InfoIcon, XIcon, LoaderIcon } from 'lucide-react';
import { api } from '@/lib/api';
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface ParticleExample {
    japanese: string;
    romaji: string;
    english: string;
}

interface Particle {
    id: string;
    romaji: string;
    hiragana: string;
    usage: string;
    explanation: string;
    examples: ParticleExample[];
}

export default function ParticleListPage() {
    const router = useRouter();
    const [particles, setParticles] = useState<Particle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedParticle, setSelectedParticle] = useState<Particle | null>(null);

    useEffect(() => {
        fetchParticles();
    }, []);

    const fetchParticles = async () => {
        try {
            const response = await api.get<{ particles: Particle[] }>('/api/v1/particles');
            setParticles(response.particles);
        } catch (error) {
            console.error('Failed to fetch particles:', error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => setSelectedParticle(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Particle Master</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Practice All Banner */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Master Japanese Particles</h2>
                            <p className="text-teal-50 opacity-90">
                                Learn usage rules and practice with quizzes to solidify your understanding.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/particles/practice')}
                            className="w-full md:w-auto whitespace-nowrap flex items-center justify-center cursor-pointer"
                        >
                            <PlayIcon className="w-6 h-6 mr-3 fill-current flex-shrink-0" />
                            Practice All
                        </Button>
                    </div>
                </div>

                {/* Particles Grid */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5 text-teal-600" />
                    Study List
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {particles.map((particle) => (
                        <Card
                            key={particle.id}
                            onClick={() => setSelectedParticle(particle)}
                            className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-teal-500 dark:hover:border-teal-400 group"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                            {particle.hiragana}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            ({particle.romaji})
                                        </span>
                                    </div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                        {particle.usage}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                        {particle.explanation}
                                    </p>
                                </div>
                                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    <InfoIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Particle Detail Modal */}
            {selectedParticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <h2 className="text-4xl font-bold text-teal-600 dark:text-teal-400">
                                        {selectedParticle.hiragana}
                                    </h2>
                                    <span className="text-xl text-gray-500 dark:text-gray-400 font-mono">
                                        {selectedParticle.romaji}
                                    </span>
                                </div>
                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-2">
                                    {selectedParticle.usage}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 cursor-pointer"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Explanation</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {selectedParticle.explanation}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Examples</h4>
                                <div className="space-y-4">
                                    {selectedParticle.examples.map((ex, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                                {ex.japanese}
                                            </p>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                    {ex.romaji}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {ex.english}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                            <Button variant="outline" className="flex-1 cursor-pointer" onClick={closeModal}>
                                Close
                            </Button>
                            <Button
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                    router.push(`/particles/practice?particle=${selectedParticle.id}`);
                                }}
                            >
                                Practice "{selectedParticle.hiragana}"
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
