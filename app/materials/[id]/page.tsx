'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { ArrowLeftIcon, LoaderIcon, FileTextIcon, StickyNoteIcon } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { useHeader } from '@/components/header-context';
import NoteSidebar from '@/components/note-sidebar';

interface Material {
  id: number;
  title: string;
  source: string;
  description: string | null;
  file_path: string;
}

export default function MaterialViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const { showMaterialHeader } = useHeader();

  // Note Sidebar State
  const [isNoteSidebarOpen, setIsNoteSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await api.get<{ data: Material[] }>('/api/v1/materials');
        const found = response.data.find(m => m.id === Number(id));
        setMaterial(found || null);
      } catch (error) {
        console.error('Failed to fetch material', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoaderIcon className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Material Not Found</h1>
        <Link href="/materials">
          <Button>Back to Materials</Button>
        </Link>
      </div>
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const pdfUrl = `${backendUrl}${material.file_path}`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header - Toggleable via navbar button */}
      {showMaterialHeader && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm z-30 relative">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/materials">
              <Button variant="secondary" size="sm" className="-ml-2 flex items-center cursor-pointer">
                <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                {material.title}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {material.source}
                </span>
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsNoteSidebarOpen(!isNoteSidebarOpen)}
            className={`cursor-pointer flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 border-teal-500 dark:border-teal-400 ${
              isNoteSidebarOpen
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                : 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10'
            }`}
          >
            <StickyNoteIcon className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Notes</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* PDF Viewer */}
        <div className={`flex-1 bg-gray-100 dark:bg-gray-900 transition-all duration-300 ${isNoteSidebarOpen ? 'mr-0 sm:mr-96' : ''}`}>
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 block"
            title={material.title}
          />
        </div>

        {/* Note Sidebar */}
        <NoteSidebar
          materialId={material.id}
          isOpen={isNoteSidebarOpen}
          onClose={() => setIsNoteSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
