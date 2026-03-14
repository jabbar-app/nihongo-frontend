/**
 * Audio Hook Types
 * 
 * Type definitions for audio player hooks.
 */

/**
 * Return type for useAudioPlayer hook
 */
export interface UseAudioPlayerReturn {
  /** Function to play audio */
  playAudio: (id: number, text: string) => Promise<void>;
  /** Function to stop audio */
  stopAudio: () => void;
  /** ID of the audio currently loading */
  loadingAudioId: number | null;
  /** ID of the audio currently playing */
  playingAudioId: number | null;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Current playback position in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Volume level (0-1) */
  volume: number;
  /** Function to set volume */
  setVolume: (volume: number) => void;
  /** Function to seek to a position */
  seek: (time: number) => void;
}

/**
 * Audio player options
 */
export interface AudioPlayerOptions {
  /** Auto-play when audio is loaded */
  autoPlay?: boolean;
  /** Loop the audio */
  loop?: boolean;
  /** Initial volume (0-1) */
  volume?: number;
  /** Callback when audio ends */
  onEnded?: () => void;
  /** Callback when audio errors */
  onError?: (error: Error) => void;
}
