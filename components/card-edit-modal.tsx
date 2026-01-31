'use client';

import { useState, useEffect } from 'react';
import { XIcon, Sparkles } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface Card {
    id: number;
    kanji: string | null;
    kana: string;
    meaning_id: string;
    meaning_en: string | null;
    example_sentence_ja: string | null;
    example_sentence_id: string | null;
    example_sentence_en: string | null;
}

interface CardEditModalProps {
    card: Card;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedCard: Card) => void;
}

export default function CardEditModal({ card, isOpen, onClose, onSave }: CardEditModalProps) {
    const [formData, setFormData] = useState<Card>({ ...card });
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [targetLang, setTargetLang] = useState<'id' | 'en' | 'both'>('id');

    useEffect(() => {
        setFormData({ ...card });
    }, [card]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await api.put<Card>(`/api/v1/cards/${card.id}`, formData);
            onSave(updated);
            onClose();
        } catch (error) {
            console.error('Failed to update card', error);
            alert('Failed to update card');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAi = async () => {
        setAiLoading(true);
        try {
            const response = await api.post<{
                example_sentence_ja: string;
                example_sentence_id: string;
                example_sentence_en: string;
            }>(`/api/v1/cards/${card.id}/generate-sentence`, { target_lang: targetLang });

            setFormData((prev) => ({
                ...prev,
                example_sentence_ja: response.example_sentence_ja || prev.example_sentence_ja,
                example_sentence_id: response.example_sentence_id || prev.example_sentence_id,
                example_sentence_en: response.example_sentence_en || prev.example_sentence_en,
            }));
        } catch (error) {
            console.error('AI Generation failed', error);
            alert('AI Generation failed');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] mb-20 md:mb-0 overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Card</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSave} className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kanji (Optional)
                            </label>
                            <Input
                                name="kanji"
                                value={formData.kanji || ''}
                                onChange={handleChange}
                                placeholder="漢字"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kana
                            </label>
                            <Input
                                name="kana"
                                value={formData.kana}
                                onChange={handleChange}
                                placeholder="かな"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Meaning (Indonesian)
                            </label>
                            <Input
                                name="meaning_id"
                                value={formData.meaning_id}
                                onChange={handleChange}
                                placeholder="Arti (ID)"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Meaning (English)
                            </label>
                            <Input
                                name="meaning_en"
                                value={formData.meaning_en || ''}
                                onChange={handleChange}
                                placeholder="Meaning (EN)"
                            />
                        </div>
                    </div>

                    {/* AI Generation Section */}
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-100 dark:border-teal-800/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <h3 className="font-semibold text-teal-800 dark:text-teal-200 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                AI Sentence Generation
                            </h3>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <select
                                    value={targetLang}
                                    onChange={(e) => setTargetLang(e.target.value as 'id' | 'en' | 'both')}
                                    className="text-sm rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-teal-500 focus:border-teal-500 px-3 py-1.5"
                                >
                                    <option value="id">Indonesian Only</option>
                                    <option value="en">English Only</option>
                                    <option value="both">Both (ID + EN)</option>
                                </select>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleGenerateAi}
                                    disabled={aiLoading}
                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {aiLoading ? 'Generating...' : 'Generate Sentence'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Japanese Sentence
                                </label>
                                <Textarea
                                    name="example_sentence_ja"
                                    value={formData.example_sentence_ja || ''}
                                    onChange={handleChange}
                                    placeholder="Example sentence in Japanese"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Indonesian Translation
                                    </label>
                                    <Textarea
                                        name="example_sentence_id"
                                        value={formData.example_sentence_id || ''}
                                        onChange={handleChange}
                                        placeholder="Terjemahan (ID)"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        English Translation
                                    </label>
                                    <Textarea
                                        name="example_sentence_en"
                                        value={formData.example_sentence_en || ''}
                                        onChange={handleChange}
                                        placeholder="Translation (EN)"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[100px]"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
