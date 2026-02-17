'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  UploadIcon,
  FileTextIcon,
  MessageSquareIcon,
  LoaderIcon,
  CheckCircleIcon,
  PlayIcon,
  BookOpenIcon,
  MicIcon
} from 'lucide-react';
import { api } from '@/lib/api';
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { useHeader } from "@/components/header-context";
import PracticeConversation from '@/components/practice/practice-conversation';
import { toast } from 'sonner';



interface Reading {
  id: number;
  type: string;
  title: string;
  content: string;
  created_at: string;
}

interface PracticeSession {
  id: number;
  messages: any[];
  context: string | null;
  reading_id: number | null;
  // ... other fields
}

export default function InterviewPracticePage() {
  const router = useRouter();
  const { setHeaderContent } = useHeader();

  // State
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState<Reading[]>([]);
  const [scripts, setScripts] = useState<Reading[]>([]);
  const [activeTab, setActiveTab] = useState<'resumes' | 'scripts'>('resumes');

  // Selection & Process State
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Active Session
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);

  // Memorization Mode
  const [memorizeMode, setMemorizeMode] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);

  const parseFurigana = (text: string) => {
    const parts = text.split(/(\{.+?\|.+?\})/g);
    return parts.map((part, index) => {
      const match = part.match(/\{(.+?)\|(.+?)\}/);
      if (match) {
        return (
          <ruby key={index} className="mx-0.5">
            {match[1]}
            <rt className={`text-xs text-teal-500 select-none ${showFurigana ? 'visible' : 'invisible'}`}>{match[2]}</rt>
          </ruby>
        );
      }
      return part;
    });
  };

  const parseScript = (content: string) => {
    return content.split('\n').map((line, i) => {
      const cleanLine = line.trim();
      if (!cleanLine) return null;

      if (cleanLine.startsWith('**') || cleanLine.startsWith('M:') || cleanLine.startsWith('P:')) {
        const isInterviewer = cleanLine.includes('面接官') || cleanLine.startsWith('**M:**') || cleanLine.startsWith('M:');
        // Remove prefixes like **M:** or **P:**
        const text = cleanLine.replace(/^\*\*[A-Z]:\*\*\s*/, '').replace(/^[A-Z]:\s*/, '');

        return (
          <div key={i} className={`flex gap-4 p-4 rounded-xl ${isInterviewer ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isInterviewer ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {isInterviewer ? 'M' : 'P'}
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {isInterviewer ? '面接官 (Interviewer)' : '私 (You)'}
              </p>
              <p className="text-lg leading-loose text-gray-800 dark:text-gray-200 font-medium">
                {parseFurigana(text)}
              </p>
            </div>
          </div>
        );
      }
      return <p key={i} className="mb-4 text-gray-500 italic text-center text-sm">{cleanLine}</p>;
    });
  };

  // Clue State (for PracticeConversation)
  const [clue, setClue] = useState<{ structure: string; vocabulary: string } | null>(null);
  const [loadingClue, setLoadingClue] = useState(false);

  // Fetch Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [resumesRes, scriptsRes] = await Promise.all([
        api.get('/api/v1/readings?type=resume'),
        api.get('/api/v1/readings?type=interview_script')
      ]);
      setResumes(resumesRes.readings.data);
      setScripts(scriptsRes.readings.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load practice materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // restore session if needed? For now, simple start.
  }, []);

  // Header
  useEffect(() => {
    if (session) {
      setHeaderContent(
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="!p-1.5 h-8 w-8 rounded-full"
            onClick={() => {
              if (confirm('End current session?')) {
                endSession();
              }
            }}
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
              Interview Session
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedReading?.title}
            </span>
          </div>
        </div>
      );
    } else {
      setHeaderContent(null);
    }
    return () => setHeaderContent(null);
  }, [session, selectedReading]);

  // Actions
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', e.target.files[0]);

      const res = await api.post('/api/v1/interview/upload', formData);

      toast.success('Resume uploaded successfully');
      setResumes([res, ...resumes]);
      setActiveTab('resumes');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateScript = async (resume: Reading) => {
    try {
      setGenerating(true);
      const res = await api.post('/api/v1/interview/generate-script', { resume_id: resume.id });
      toast.success('Script generated successfully');
      setScripts([res, ...scripts]);
      setActiveTab('scripts');
      setSelectedReading(res);
      setMemorizeMode(true); // Auto-open script
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate script');
    } finally {
      setGenerating(false);
    }
  };

  const startSession = async (reading: Reading) => {
    try {
      setLoading(true);
      const res = await api.post('/api/v1/practice/sessions/start', {
        reading_id: reading.id
      });
      setSession(res.session);
      setSelectedReading(reading);
      setMemorizeMode(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;
    try {
      setEnding(true);
      await api.post(`/api/v1/practice/sessions/${session.id}/end`);
      setSession(null);
      // Optional: Show summary
    } catch (err) {
      console.error(err);
    } finally {
      setEnding(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!session) return;
    try {
      setSending(true);
      const res = await api.post(`/api/v1/practice/sessions/${session.id}/messages`, { message: text });

      // Optimistic update or refresh
      const { user_message, assistant_message } = res;
      setSession((prev: PracticeSession | null) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, user_message, assistant_message]
        };
      });
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getClue = async () => {
    if (!session) return;
    setLoadingClue(true);
    try {
      const res = await api.get(`/api/v1/practice/sessions/${session.id}/clue`);
      setClue(res);
    } catch (err) {
      console.error('Failed to get clue:', err);
    } finally {
      setLoadingClue(false);
    }
  };


  // Views
  if (session) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <PracticeConversation
          session={session}
          onSendMessage={sendMessage}
          onEndSession={endSession}
          onGetClue={getClue}
          sending={sending}
          ending={ending}
          clue={clue}
          loadingClue={loadingClue}
          setClue={setClue}
        />
      </div>
    );
  }

  if (memorizeMode && selectedReading) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => setMemorizeMode(false)} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Script Memorization</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-t-4 border-teal-500">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedReading.title}</h2>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <button
                  onClick={() => setShowFurigana(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!showFurigana ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  Kanji
                </button>
                <button
                  onClick={() => setShowFurigana(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${showFurigana ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  Furigana
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-4">
              {parseScript(selectedReading.content)}
            </div>
          </div>

          <div className="sticky bottom-8 flex justify-center">
            <Button
              onClick={() => startSession(selectedReading)}
              className="flex items-center text-sm px-8 py-4 shadow-xl shadow-teal-500/20 hover:scale-105 transition-transform"
            >
              <MicIcon className="w-5 h-5 mr-2" />
              Start Role-Play Practice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Interview Practice</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your resume, generate scripts, and practice mock interviews.</p>
          </div>
          <Button
            variant="primary"
            className="flex items-center relative overflow-hidden"
          >
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            {uploading ? <LoaderIcon className="w-4 h-4 animate-spin mr-2" /> : <UploadIcon className="w-4 h-4 mr-2" />}
            Upload Resume
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'resumes' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Resumes
          </button>
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'scripts' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Generated Scripts
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderIcon className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : (

          <div className="space-y-6">
            {activeTab === 'resumes' && resumes.map((resume: Reading) => (
              <Card key={resume.id} className="group hover:border-teal-500 transition-all duration-300 hover:shadow-lg w-full">
                <div className="p-6 h-full flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <FileTextIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" title={resume.title}>
                          {resume.title}
                        </h3>
                        <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                          Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4 md:mb-0">
                      {resume.content}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                    <Button
                      variant="outline"
                      onClick={() => startSession(resume)}
                      className="flex items-center text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-800"
                    >
                      <MicIcon className="w-4 h-4 mr-2 text-teal-500" />
                      Start Interview
                    </Button>
                    {(() => {
                      const linkedScript = scripts.find((s: Reading) => s.title === `Interview Script for ${resume.title}`);
                      return (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            if (linkedScript) {
                              setSelectedReading(linkedScript);
                              setMemorizeMode(true);
                            } else {
                              handleGenerateScript(resume);
                            }
                          }}
                          disabled={generating}
                          className="flex items-center text-sm cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          {generating ? (
                            <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                          ) : linkedScript ? (
                            <BookOpenIcon className="w-4 h-4 mr-2 text-purple-500" />
                          ) : (
                            <MessageSquareIcon className="w-4 h-4 mr-2 text-blue-500" />
                          )}
                          {linkedScript ? "View Script" : "Generate Script"}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            ))}

            {activeTab === 'scripts' && (
              <div className="space-y-6">
                {scripts.map((script: Reading) => (
                  <Card key={script.id} className="group hover:border-teal-500 transition-all duration-300 hover:shadow-lg w-full cursor-pointer" onClick={() => {
                    setSelectedReading(script);
                    setMemorizeMode(true);
                  }}>
                    <div className="p-6 h-full flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <BookOpenIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" title={script.title}>
                              {script.title}
                            </h3>
                            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                              Generated on {new Date(script.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4 md:mb-0 font-serif">
                          {script.content}
                        </p>
                      </div>

                      <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReading(script);
                            setMemorizeMode(true);
                          }}
                          className="flex items-center flex-1 text-sm justify-start cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800"
                        >
                          <BookOpenIcon className="w-4 h-4 mr-2 text-purple-500" />
                          Review Script
                        </Button>
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            startSession(script);
                          }}
                          className="flex items-center flex-1 text-sm justify-start cursor-pointer hover:bg-teal-600 shadow-md shadow-teal-500/20"
                        >
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Start Practice
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {((activeTab === 'resumes' && resumes.length === 0) || (activeTab === 'scripts' && scripts.length === 0)) && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                  {activeTab === 'resumes' ? <UploadIcon className="w-8 h-8 text-gray-400" /> : <FileTextIcon className="w-8 h-8 text-gray-400" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No {activeTab} found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  {activeTab === 'resumes'
                    ? "Upload a resume to get started with interview practice."
                    : "Generate a script from your resume to seeing it here."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
}
