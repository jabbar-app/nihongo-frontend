
import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    SpeechRecognition,
    SpeechRecognitionEvent,
    SpeechRecognitionErrorEvent,
} from '@/types/browser/speech-recognition';

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
                const recognition = new SpeechRecognition();
                recognition.continuous = true; // Keep listening until stopped
                recognition.interimResults = true; // Show results as they are spoken
                recognition.lang = 'ja-JP'; // Set Japanese as default
                recognitionRef.current = recognition;
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;

        setError(null);
        setIsListening(true);

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error("Error starting recognition:", err);
            // It might already be started, ignore
        }

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Update transcript state - we append final results, but replace interim
            // Actually, for this use case, we probably want to just update the input field directly
            // or return the current comprehensive transcript.
            // Since 'continuous' is true, event.results accumulates. 
            // We can just grab the latest full transcript if we want to replace,
            // OR we can rely on resultIndex.

            // Simpler approach for React state: 
            // Just concatenate all results to form the full string
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                setError('Microphone permission denied');
                setIsListening(false);
            } else if (event.error === 'no-speech') {
                // Ignore no-speech, just keep listening or stop?
                // Usually better to just ignore
            } else {
                setError(`Error: ${event.error}`);
                setIsListening(false);
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    };
}
