/**
 * Web Speech API Types
 * 
 * Type definitions for the Web Speech API (Speech Recognition).
 * These types extend the standard browser APIs.
 */

/**
 * Speech recognition event
 */
export interface SpeechRecognitionEvent extends Event {
  /** Index of the result */
  resultIndex: number;
  /** List of recognition results */
  results: SpeechRecognitionResultList;
}

/**
 * Speech recognition result list
 */
export interface SpeechRecognitionResultList {
  /** Length of the result list */
  length: number;
  /** Get result at index */
  item(index: number): SpeechRecognitionResult;
  /** Array-like access */
  [index: number]: SpeechRecognitionResult;
}

/**
 * Speech recognition result
 */
export interface SpeechRecognitionResult {
  /** Length of alternatives */
  length: number;
  /** Whether this is a final result */
  isFinal: boolean;
  /** Get alternative at index */
  item(index: number): SpeechRecognitionAlternative;
  /** Array-like access */
  [index: number]: SpeechRecognitionAlternative;
}

/**
 * Speech recognition alternative
 */
export interface SpeechRecognitionAlternative {
  /** Transcript text */
  transcript: string;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Speech recognition error event
 */
export interface SpeechRecognitionErrorEvent extends Event {
  /** Error type */
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  /** Error message */
  message: string;
}

/**
 * Speech recognition interface
 */
export interface SpeechRecognition extends EventTarget {
  /** Language for recognition */
  lang: string;
  /** Whether to use continuous recognition */
  continuous: boolean;
  /** Whether to return interim results */
  interimResults: boolean;
  /** Maximum number of alternatives */
  maxAlternatives: number;
  /** Start recognition */
  start(): void;
  /** Stop recognition */
  stop(): void;
  /** Abort recognition */
  abort(): void;
  /** Result event handler */
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  /** Error event handler */
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  /** End event handler */
  onend: (() => void) | null;
  /** Start event handler */
  onstart: (() => void) | null;
}

/**
 * Speech recognition constructor
 */
export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

/**
 * Extend Window interface with speech recognition
 */
export {};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
