import { useState } from 'react';
import { LOGO_EMBLEM_SRC } from '../game/storyData';

interface GameLogoProps {
  variant?: 'lockup' | 'crest';
  className?: string;
}

export function GameLogo({ variant = 'lockup', className = '' }: GameLogoProps) {
  const [imgError, setImgError] = useState(false);

  const CrestVisual = ({ sizeClass }: { sizeClass: string }) =>
    !imgError ? (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border border-[#E09F5A]/55 bg-[#0B1215] shadow-[0_0_28px_rgba(224,159,90,0.18)] ${sizeClass}`}
      >
        <img
          src={LOGO_EMBLEM_SRC}
          alt="After Midnight game logo crest"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full scale-[1.12] object-cover object-center"
        />
      </div>
    ) : (
      <svg
        viewBox="0 0 96 96"
        className={sizeClass}
        role="img"
        aria-label="After Midnight logo crest"
      >
        <circle cx="48" cy="48" r="44" fill="#0B1215" stroke="#E09F5A" strokeOpacity="0.6" strokeWidth="1.5" />
        <path
          d="M54 16a26 26 0 1 0 24 36.2A21.5 21.5 0 0 1 54 16Z"
          fill="#E09F5A"
          fillOpacity="0.22"
          stroke="#E09F5A"
          strokeWidth="1.6"
        />
        <path d="M35 72 L47 39 L59 72 Z" fill="#101D22" stroke="#C8D3CF" strokeWidth="1.2" />
        <circle cx="65" cy="50" r="2.5" fill="#FFF3D6" />
      </svg>
    );

  if (variant === 'crest') {
    return <CrestVisual sizeClass={className || 'h-16 w-16'} />;
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="mb-4 flex items-center gap-4">
        <CrestVisual sizeClass="h-20 w-20 sm:h-24 sm:w-24" />
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-[0.28em] text-[#E09F5A] uppercase">
            Blackpine Hollow
          </span>
          <div className="h-[1px] w-36 bg-gradient-to-r from-[#E09F5A]/80 via-[#94A39E]/40 to-transparent" />
          <span className="font-mono-num text-[11px] tracking-[0.18em] text-[#94A39E] uppercase">
            Interactive Visual Novel
          </span>
        </div>
      </div>

      {/* Primary Display Wordmark */}
      <h1 className="font-display text-5xl font-semibold tracking-tight text-[#F2ECE1] sm:text-6xl lg:text-7xl [text-wrap:balance]">
        After Midnight
      </h1>

      {/* Ornamental Filigree Underline */}
      <div className="mt-2.5 flex items-center gap-3" aria-hidden="true">
        <span className="h-[1px] w-16 bg-[#E09F5A]/80" />
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-[#E09F5A]">
          <path
            d="M8 1 L9.8 6.2 L15 8 L9.8 9.8 L8 15 L6.2 9.8 L1 8 L6.2 6.2 Z"
            fill="currentColor"
          />
        </svg>
        <span className="h-[1px] w-8 bg-[#94A39E]/40" />
      </div>
    </div>
  );
}
