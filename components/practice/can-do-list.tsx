'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import CanDoItem from './can-do-item';
import { LoaderIcon, PlusIcon, XIcon, CheckIcon, Edit2Icon } from 'lucide-react';

interface CanDoTarget {
    id: number;
    topic_title: string;
    cando_id: string;
    description_jp: string;
    description_id: string;
    stars: number;
}

interface ChapterGroup {
    id: number;
    chapter_number: number;
    chapter_title: string;
    targets: CanDoTarget[];
}

export default function CanDoList() {
    const [chapters, setChapters] = useState<ChapterGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chapter Modal State
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
    const [chapterForm, setChapterForm] = useState({
        chapter_number: 1,
        chapter_title: '',
    });

    // Item Modal State
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingTargetId, setEditingTargetId] = useState<number | null>(null);
    const [targetFormChapterId, setTargetFormChapterId] = useState<number | null>(null);
    const [targetForm, setTargetForm] = useState({
        topic_title: '',
        cando_id: '',
        description_jp: '',
        description_id: '',
    });

    const [isSaving, setIsSaving] = useState(false);

    const openAddChapterModal = () => {
        setEditingChapterId(null);
        const nextChapterNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1;
        setChapterForm({
            chapter_number: nextChapterNum,
            chapter_title: '',
        });
        setShowChapterModal(true);
    };

    const handleSaveChapter = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (editingChapterId) {
                await api.put(`/api/v1/cando-chapters/${editingChapterId}`, chapterForm);
            } else {
                await api.post('/api/v1/cando-chapters', chapterForm);
            }
            setShowChapterModal(false);
            fetchTargets(); // Refresh list
        } catch (e) {
            console.error('Failed to save chapter', e);
            alert(e instanceof Error ? e.message : 'Failed to save chapter');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveItem = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (editingTargetId) {
                await api.put(`/api/v1/cando-targets/${editingTargetId}`, targetForm);
            } else if (targetFormChapterId) {
                await api.post(`/api/v1/cando-chapters/${targetFormChapterId}/targets`, targetForm);
            }
            setShowItemModal(false);
            fetchTargets();
        } catch (e) {
            console.error('Failed to save item', e);
            alert(e instanceof Error ? e.message : 'Failed to save new item');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchTargets = async () => {
        try {
            const data = await api.get<ChapterGroup[]>('/api/v1/cando-targets');
            console.log('Fetched Can-do Targets:', data);

            // Validate data is an array
            if (Array.isArray(data)) {
                setChapters(data);
            } else {
                // If the backend returns an object with numeric keys, handle that
                console.log('Data is not an array, attempting to format...', typeof data);
                if (data && typeof data === 'object') {
                    setChapters(Object.values(data));
                } else {
                    setChapters([]);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch Can-do targets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTargets();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoaderIcon className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Can-do Checklist</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Evaluate your progress across all chapters.
                    </p>
                </div>
                <button
                    onClick={openAddChapterModal}
                    className="flex shrink-0 items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto shadow-sm hover:shadow"
                >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add New Chapter</span>
                </button>
            </div>

            {chapters.map((chapter) => {
                const total = chapter.targets.length;
                const filled = chapter.targets.filter(t => t.stars > 0).length;
                const defaultExpanded = chapter.chapter_number === 1;

                return (
                    <ChapterSection
                        key={chapter.chapter_number}
                        chapter={chapter}
                        filled={filled}
                        total={total}
                        defaultExpanded={defaultExpanded}
                        onProgressUpdated={fetchTargets}
                        onEditChapter={() => {
                            setEditingChapterId(chapter.id);
                            setChapterForm({
                                chapter_number: chapter.chapter_number,
                                chapter_title: chapter.chapter_title,
                            });
                            setShowChapterModal(true);
                        }}
                        onAddItem={() => {
                            setEditingTargetId(null);
                            setTargetFormChapterId(chapter.id);
                            setTargetForm({
                                topic_title: '',
                                cando_id: '',
                                description_jp: '',
                                description_id: '',
                            });
                            setShowItemModal(true);
                        }}
                    />
                );
            })}

            {/* Add/Edit Chapter Modal */}
            {showChapterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-lg">
                                {editingChapterId ? 'Edit Chapter' : 'Add New Chapter'}
                            </h3>
                            <button onClick={() => setShowChapterModal(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter Number</label>
                                <input
                                    type="number"
                                    value={chapterForm.chapter_number}
                                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: parseInt(e.target.value) || 1 })}
                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 第1課：はじめまして"
                                    value={chapterForm.chapter_title}
                                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_title: e.target.value })}
                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowChapterModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChapter}
                                disabled={isSaving || !chapterForm.chapter_title}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                {editingChapterId ? 'Update Chapter' : 'Save Chapter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-semibold text-lg">
                                {editingTargetId ? 'Edit Target Item' : 'Add Target Item'}
                            </h3>
                            <button onClick={() => setShowItemModal(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Can-do ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1"
                                        value={targetForm.cando_id}
                                        onChange={(e) => setTargetForm({ ...targetForm, cando_id: e.target.value })}
                                        className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. あいさつをする"
                                        value={targetForm.topic_title}
                                        onChange={(e) => setTargetForm({ ...targetForm, topic_title: e.target.value })}
                                        className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Japanese)</label>
                                <textarea
                                    value={targetForm.description_jp}
                                    onChange={(e) => setTargetForm({ ...targetForm, description_jp: e.target.value })}
                                    rows={3}
                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Indonesian)</label>
                                <textarea
                                    value={targetForm.description_id}
                                    onChange={(e) => setTargetForm({ ...targetForm, description_id: e.target.value })}
                                    rows={3}
                                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveItem}
                                disabled={isSaving || !targetForm.topic_title || !targetForm.description_jp}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                                Save Target Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ChapterSection({ chapter, filled, total, defaultExpanded, onProgressUpdated, onEditChapter, onAddItem }: { chapter: ChapterGroup, filled: number, total: number, defaultExpanded: boolean, onProgressUpdated: () => void, onEditChapter: () => void, onAddItem: () => void }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left px-5 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer focus:outline-none"
            >
                <div className="flex-1 min-w-0 pr-4">
                    <h2 className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                        Chapter {chapter.chapter_number}
                        <button
                            onClick={(e) => { e.stopPropagation(); onEditChapter(); }}
                            className="p-1 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded cursor-pointer"
                            aria-label="Edit Chapter"
                        >
                            <Edit2Icon className="w-3.5 h-3.5" />
                        </button>
                    </h2>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {chapter.chapter_title}
                    </h3>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {filled} / {total}
                    </div>
                    <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {expanded && (
                <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    {chapter.targets.map(target => (
                        <CanDoItem
                            key={target.id}
                            target={target}
                            onProgressUpdated={onProgressUpdated}
                        />
                    ))}
                    <button
                        onClick={onAddItem}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium rounded-lg transition-colors cursor-pointer mt-4"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Item
                    </button>
                </div>
            )}
        </div>
    );
}
