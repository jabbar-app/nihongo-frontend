'use client';

import { useEffect, useRef, useState } from 'react';
import { AUTH_CONSTANTS } from '@/constants';
import { API_CONSTANTS } from '@/constants';

interface MnemonicImageCanvasProps {
  mnemonicId: number;
  /** Optional text for the watermark overlay (defaults to '© Manabou') */
  watermarkText?: string;
  className?: string;
  alt?: string;
}

/**
 * Renders a mnemonic image through an authenticated backend proxy onto a <canvas>.
 * 
 * Protection layers:
 * 1. Image is fetched via an auth-gated API route — real storage URL never exposed in DOM
 * 2. Image is drawn onto <canvas> — no <img> tag with downloadable src
 * 3. Right-click, context menu, drag are blocked
 * 4. A semi-transparent watermark is overlaid on the image
 * 5. CSS user-select: none, pointer-events: none on the overlay
 */
export default function MnemonicImageCanvas({
  mnemonicId,
  watermarkText = '© Manabou',
  className = '',
  alt = 'Mnemonic illustration',
}: MnemonicImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!mnemonicId) return;

    let objectUrl: string | null = null;

    async function loadImage() {
      setStatus('loading');
      try {
        const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
        if (!token) { setStatus('error'); return; }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_CONSTANTS.DEFAULT_BASE_URL;
        const res = await fetch(`${apiUrl}/api/v1/mnemonics/${mnemonicId}/image`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!res.ok) { setStatus('error'); return; }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw the image
          ctx.drawImage(img, 0, 0);

          // --- Watermark overlay ---
          const fontSize = Math.max(14, Math.floor(canvas.width * 0.035));
          ctx.font      = `${fontSize}px sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';

          const padding = fontSize * 0.6;
          ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

          setStatus('loaded');
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => { setStatus('error'); };
        img.src = objectUrl;
      } catch {
        setStatus('error');
      }
    }

    loadImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mnemonicId, watermarkText]);

  // Block context menu / drag on the canvas
  const blockEvent = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div
      className={`relative select-none ${className}`}
      role="img"
      aria-label={alt}
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
    >
      {/* Loading shimmer */}
      {status === 'loading' && (
        <div className="w-full aspect-video rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="w-full aspect-video rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-300 dark:border-gray-600">
          Image unavailable
        </div>
      )}

      {/* Canvas — hidden until loaded to avoid flash */}
      <canvas
        ref={canvasRef}
        className={`w-full rounded-2xl border border-gray-100 dark:border-gray-700 ${status === 'loaded' ? 'block' : 'hidden'}`}
        aria-hidden="true"
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
      />

      {/* Invisible overlay — blocks pointer events so the canvas cannot be right-clicked indirectly */}
      <div
        className="absolute inset-0 rounded-2xl"
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}
      />
    </div>
  );
}
