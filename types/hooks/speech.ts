/**
 * Speech Hook Types
 * 
 * Type definitions for speech recognition hooks.
 */

/**
 * Return type for useSpeechRecognition hook
 */
export interface UseSpeechRecognitionReturn {
  /** Whether speech recognition is currently listening */
  isListening: boolean;
  /** Current transcript text */
  transcript: string;
  /** Function to start listening */
  startListening: () => void;
  /** Function to stop listening */
  stopListening: () => void;
  /** Whether speech recognition is supported */
  isSupported: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to reset the transcript */
  resetTranscript: () => void;
}

/**
 * Speech recognition options
 */
export interface SpeechRecognitionOptions {
  /** Language code (e.g., 'ja-JP', 'en-US') */
  language?: string;
  /** Whether to use continuous recognition */
  continuous?: boolean;
  /** Whether to return interim results */
  interimResults?: boolean;
  /** Maximum number of alternatives */
  maxAlternatives?: number;
  /** Callback when result is received */
  onResult?: (transcript: string) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}
