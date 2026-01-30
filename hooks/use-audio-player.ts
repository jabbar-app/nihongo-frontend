
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface UseAudioPlayerReturn {
    playAudio: (messageId: number, text: string) => Promise<void>;
    loadingAudioId: number | null;
    playingAudioId: number | null;
    error: string | null;
    stopAudio: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
    const [loadingAudioId, setLoadingAudioId] = useState<number | null>(null);
    const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setPlayingAudioId(null);
    };

    const playAudio = async (messageId: number, text: string) => {
        // Stop current audio if playing
        stopAudio();
        setError(null);
        setLoadingAudioId(messageId);

        try {
            // Fetch audio URL from backend
            // Note: We're sending 'text' in body if needed (though backend can use message content)
            // The current PracticeController implementation uses message content by default, but we can pass text override.
            const response = await api.post(`/api/v1/practice/messages/${messageId}/speech`, { text });

            const audioUrl = response.audio_url; // API returns { audio_url: '...' }

            if (!audioUrl) throw new Error('No audio URL returned');

            // Create audio element
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setPlayingAudioId(null);
            };

            audio.onerror = () => {
                setPlayingAudioId(null);
                setError('Failed to play audio');
            };

            // Play
            await audio.play();
            setPlayingAudioId(messageId);
        } catch (err) {
            console.error('Audio playback failed:', err);
            setError('Failed to load audio');
        } finally {
            setLoadingAudioId(null);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return {
        playAudio,
        loadingAudioId,
        playingAudioId,
        error,
        stopAudio
    };
}
