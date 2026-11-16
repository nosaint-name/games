import { useEffect, useState } from 'react';
import {
  CharacterMood,
  CHARACTER_PORTRAITS,
  PORTRAIT_ASSETS,
} from '../game/storyData';

interface CharacterPortraitProps {
  speaker: string;
  mood: CharacterMood;
}

export function CharacterPortrait({ speaker, mood }: CharacterPortraitProps) {
  const [imgError, setImgError] = useState(false);

  const normalizedSpeaker = speaker.trim().toLowerCase();
  const speakerSet = CHARACTER_PORTRAITS[normalizedSpeaker];
  const portraitAsset =
    speakerSet?.[mood] ?? speakerSet?.neutral ?? PORTRAIT_ASSETS[mood];

  useEffect(() => {
    setImgError(false);
  }, [portraitAsset.src]);

  return (
    <div
      data-testid="character-portrait"
      data-speaker={speaker}
      className="pointer-events-none fixed inset-x-0 bottom-16 z-15 flex justify-center sm:bottom-12 md:justify-end md:pr-[8%] lg:pr-[12%]"
    >
      <div className="relative h-[56vh] max-h-[620px] w-[300px] sm:h-[64vh] sm:w-[360px] lg:h-[72vh] lg:w-[420px]">
        {!imgError ? (
          <img
            key={portraitAsset.src}
            src={portraitAsset.src}
            alt={portraitAsset.alt}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top transition-opacity duration-300"
            style={{
              maskImage:
                'radial-gradient(ellipse 48% 48% at 50% 48%, black 34%, rgba(0, 0, 0, 0.55) 66%, transparent 96%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 48% 48% at 50% 48%, black 34%, rgba(0, 0, 0, 0.55) 66%, transparent 96%)',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-t-lg border border-[#94A39E]/20 bg-[#121D22]">
            <span className="font-display text-5xl text-[#E09F5A]">
              {speaker.slice(0, 1).toUpperCase() || 'J'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
