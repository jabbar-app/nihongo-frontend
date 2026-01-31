'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LoaderIcon, PlusIcon, TrashIcon, XIcon, StickyNoteIcon, SaveIcon, Edit3Icon, ClockIcon, SparklesIcon } from 'lucide-react';

interface Note {
  id: number;
  title: string | null;
  content: string;
  material_id: number | null;
  created_at: string;
}

interface NoteSidebarProps {
  materialId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteSidebar({ materialId, isOpen, onClose }: NoteSidebarProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      // Reset form on open
      setIsAdding(false);
      setEditingNote(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, materialId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get<Note[]>(`/api/v1/notes?material_id=${materialId}`);
      setNotes(response);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      if (editingNote) {
        // Update
        const updated = await api.put<Note>(`/api/v1/notes/${editingNote.id}`, {
          title,
          content,
        });
        setNotes(notes.map(n => n.id === editingNote.id ? updated : n));
        setEditingNote(null);
      } else {
        // Create
        const created = await api.post<Note>('/api/v1/notes', {
          material_id: materialId,
          title,
          content,
        });
        setNotes([created, ...notes]);
        setIsAdding(false);
      }
      // Reset form
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Failed to save note', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/api/v1/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (editingNote?.id === id) {
        setEditingNote(null);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 md:top-16 right-0 bottom-[64px] md:bottom-0 w-full sm:w-96 bg-white dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gradient-to-r dark:from-teal-900/20 dark:to-cyan-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg">
              <StickyNoteIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Notes</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* Add Button - Prominent at top */}
          {!isAdding && !editingNote && (
            <button
              onClick={startAdd}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold group cursor-pointer"
            >
              <div className="p-1 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                <PlusIcon className="w-5 h-5" />
              </div>
              Create New Note
            </button>
          )}

          {/* Form (Add or Edit) */}
          {(isAdding || editingNote) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here... ✨"
                  className="w-full text-sm px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none min-h-[120px] resize-y transition-all"
                  autoFocus
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !content.trim()}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4" />
                        Save Note
                      </>
                    )}
                  </button>
                  <button
                    onClick={cancelForm}
                    disabled={saving}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && !notes.length && (
            <div className="flex flex-col items-center justify-center py-12">
              <LoaderIcon className="w-8 h-8 animate-spin text-teal-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading notes...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !notes.length && !isAdding && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <StickyNoteIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No notes yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Start taking notes to remember key points from this material
              </p>
            </div>
          )}

          {/* Note List */}
          {notes.length > 0 && (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 group transition-all ${editingNote?.id === note.id ? 'opacity-50 pointer-events-none' : ''
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      {note.title && (
                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1 truncate pr-2">
                          {note.title}
                        </h4>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        {new Date(note.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                        title="Edit note"
                      >
                        <Edit3Icon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
