import { useEffect, useRef, useState } from 'react';
import { SCENE_ASSETS, SceneId } from '../game/storyData';

interface SceneBackdropProps {
  scene: SceneId;
}

const SCENE_ENTRIES = Object.entries(SCENE_ASSETS) as [
  SceneId,
  { src: string; label: string },
][];

export function SceneBackdrop({ scene }: SceneBackdropProps) {
  const [failedScenes, setFailedScenes] = useState<Record<string, boolean>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSceneRef = useRef<SceneId>(scene);

  useEffect(() => {
    if (prevSceneRef.current === scene) return;
    prevSceneRef.current = scene;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    setIsTransitioning(true);
    const timer = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [scene]);

  return (
    <div
      data-testid="scene-backdrop"
      data-scene={scene}
      data-transitioning={isTransitioning ? 'true' : 'false'}
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0B1215]"
    >
      {/* Cross-fading scene background layers */}
      {SCENE_ENTRIES.map(([id, asset]) => {
        const isActive = id === scene;
        const hasFailed = Boolean(failedScenes[id]);

        if (hasFailed) {
          return isActive ? (
            <div
              key={id}
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#1a2c32_0%,#0b1215_75%)] transition-opacity duration-700 ease-in-out motion-reduce:transition-none opacity-100"
            />
          ) : null;
        }

        return (
          <img
            key={id}
            src={asset.src}
            alt={isActive ? asset.label : ''}
            aria-hidden={isActive ? undefined : true}
            referrerPolicy="no-referrer"
            onError={() =>
              setFailedScenes((prev) => ({ ...prev, [id]: true }))
            }
            className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-700 ease-in-out motion-reduce:transition-none ${
              isActive
                ? 'z-[1] scale-[1.04] opacity-100'
                : 'z-0 scale-[1.07] opacity-0'
            }`}
          />
        );
      })}

      {/* Atmospheric cross-fade overlay pulse during location changes */}
      <div
        aria-hidden="true"
        data-testid="scene-crossfade-overlay"
        className={`absolute inset-0 z-[2] bg-[#070B0D] transition-opacity duration-500 ease-out motion-reduce:transition-none ${
          isTransitioning ? 'opacity-40' : 'opacity-0'
        }`}
      />

      {/* Subtle nocturnal lighting scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3] bg-gradient-to-t from-[#080E11] via-[#0B1215]/30 to-[#080E11]/45"
      />
    </div>
  );
}
