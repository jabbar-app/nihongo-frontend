'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { StarIcon, Edit2Icon, CheckIcon, XIcon, PlayIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';

interface CanDoTarget {
    id: number;
    topic_title: string;
    cando_id: string;
    description_jp: string;
    description_id: string;
    stars: number;
}

interface Props {
    target: CanDoTarget;
    onProgressUpdated: () => void;
}

export default function CanDoItem({ target, onProgressUpdated }: Props) {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editJp, setEditJp] = useState(target.description_jp);
    const [editId, setEditId] = useState(target.description_id);

    const updateStars = async (stars: number) => {
        if (loading || stars === target.stars) return;
        setLoading(true);
        try {
            await api.post('/api/v1/cando-progress', {
                can_do_target_id: target.id,
                stars: stars,
            });
            onProgressUpdated();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveEdit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await api.put(`/api/v1/cando-targets/${target.id}`, {
                description_jp: editJp,
                description_id: editId,
            });
            setIsEditing(false);
            onProgressUpdated();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const deleteTarget = async () => {
        if (!confirm('Are you sure you want to delete this target?')) return;
        if (loading) return;
        setLoading(true);
        try {
            await api.delete(`/api/v1/cando-targets/${target.id}`);
            onProgressUpdated();
        } catch (e) {
            console.error(e);
            alert('Failed to delete target');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditJp(target.description_jp);
        setEditId(target.description_id);
        setIsEditing(false);
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 mb-3 bg-white dark:bg-gray-800 transition-colors">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300">
                            {target.cando_id}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {target.topic_title}
                        </span>
                        {!isEditing && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="ml-2 p-1 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded cursor-pointer"
                                    aria-label="Edit Target"
                                >
                                    <Edit2Icon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={deleteTarget}
                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded cursor-pointer"
                                    aria-label="Delete Target"
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-2 mt-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Japanese Description</label>
                                <textarea
                                    value={editJp}
                                    onChange={(e) => setEditJp(e.target.value)}
                                    className="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Indonesian Description</label>
                                <textarea
                                    value={editId}
                                    onChange={(e) => setEditId(e.target.value)}
                                    className="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    rows={2}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    onClick={saveEdit}
                                    disabled={loading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <CheckIcon className="w-3 h-3" /> Save
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    disabled={loading}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <XIcon className="w-3 h-3" /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-900 dark:text-gray-100 text-sm mb-1 leading-relaxed">{target.description_jp}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{target.description_id}</p>
                        </>
                    )}
                </div>

                <div className="flex flex-col items-end gap-3 sm:self-start self-end shrink-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map((star) => (
                            <button
                                key={star}
                                onClick={() => updateStars(star)}
                                disabled={loading}
                                className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded disabled:opacity-50 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                aria-label={`Rate ${star} star`}
                            >
                                <StarIcon
                                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${target.stars >= star
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                                        : 'text-gray-200 dark:text-gray-700 hover:text-yellow-200 dark:hover:text-yellow-900'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <Link
                        href={`/test/${target.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full transition-colors group cursor-pointer"
                    >
                        <PlayIcon className="w-3.5 h-3.5 fill-current opacity-70 group-hover:opacity-100" />
                        Practice
                    </Link>
                </div>
            </div>
        </div>
    );
}
