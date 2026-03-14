'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import { api } from '@/lib/api';

interface Deck {
    id?: number;
    name: string;
    description: string | null;
    level: string | null;
    source: string | null;
    slug?: string;
    is_official?: boolean;
    card_count?: number;
}

interface DeckFormModalProps {
    deck?: Deck;
    isOpen: boolean;
    onClose: () => void;
    onSave: (deck: Deck) => void;
}

export default function DeckFormModal({ deck, isOpen, onClose, onSave }: DeckFormModalProps) {
    const [formData, setFormData] = useState<Deck>({
        name: '',
        description: '',
        level: '',
        source: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (deck) {
            setFormData({
                id: deck.id,
                name: deck.name,
                description: deck.description || '',
                level: deck.level || '',
                source: deck.source || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                level: '',
                source: '',
            });
        }
        setError('');
    }, [deck, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let savedDeck;
            if (formData.id) {
                // Update
                savedDeck = await api.put<Deck>(`/api/v1/decks/${formData.id}`, formData);
            } else {
                // Create
                savedDeck = await api.post<Deck>('/api/v1/decks', formData);
            }

            if (savedDeck && savedDeck.id) {
                onSave(savedDeck as Deck & { id: number });
                onClose();
            } else {
                setError('Failed to save deck: Invalid response');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save deck');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={deck ? 'Edit Deck' : 'Create New Deck'}
            size="md"
            footer={
                <div className="flex justify-end gap-3">
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
                        disabled={loading}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={handleSubmit}
                    >
                        {loading ? 'Saving...' : (deck ? 'Update Deck' : 'Create Deck')}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Deck Name
                    </label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. JLPT N5 Vocabulary"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </label>
                    <Textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        placeholder="Brief description of the deck content"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Level
                        </label>
                        <div className="relative">
                            <select
                                name="level"
                                value={formData.level || ''}
                                onChange={handleChange}
                                className="w-full appearance-none rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent px-4 py-2 pr-8 transition-colors cursor-pointer"
                            >
                                <option value="">Select Level</option>
                                <option value="N5">N5 - Beginner</option>
                                <option value="N4">N4 - Elementary</option>
                                <option value="N3">N3 - Intermediate</option>
                                <option value="N2">N2 - Upper Intermediate</option>
                                <option value="N1">N1 - Advanced</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Source
                        </label>
                        <Input
                            name="source"
                            value={formData.source || ''}
                            onChange={handleChange}
                            placeholder="e.g. Textbook"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
