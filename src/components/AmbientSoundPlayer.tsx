import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Sound {
  id: string;
  name: string;
  icon: string;
  url: string;
}

const AMBIENT_SOUNDS: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: '🌧️',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
  },
  {
    id: 'cafe',
    name: 'Café',
    icon: '☕',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-coffee-shop-crowd-ambience-374.mp3',
  },
  {
    id: 'waves',
    name: 'Ocean',
    icon: '🌊',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1196.mp3',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌳',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-loop-1242.mp3',
  },
];

interface AmbientSoundPlayerProps {
  isPlaying: boolean;
  onClose: () => void;
}

const AmbientSoundPlayer: React.FC<AmbientSoundPlayerProps> = ({
  isPlaying,
  onClose,
}) => {
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!selectedSound) {
      // Auto-select the first sound if none is selected
      setSelectedSound(AMBIENT_SOUNDS[0]);
      return;
    }

    const audio = new Audio(selectedSound.url);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [selectedSound, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    } else if (isPlaying && audioRef.current && selectedSound) {
      audioRef.current.play().catch(console.error);
    }
  }, [isPlaying, selectedSound]);

  return (
    <div
      className={cn(
        'fixed bottom-20 right-6 bg-surface-pure dark:bg-surface-dark',
        'shadow-floating dark:shadow-floating/20 rounded-lg',
        'w-72 transition-all duration-normal ease-gentle transform',
        'border border-ink-faint/10',
        isPlaying
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-ink-faint/10">
        <h3 className="text-sm font-medium text-ink-rich dark:text-ink-inverse">
          Ambient Sounds
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-ink-muted hover:text-ink-rich hover:bg-surface-faint transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {AMBIENT_SOUNDS.map(sound => (
          <button
            key={sound.id}
            onClick={() => setSelectedSound(sound)}
            className={cn(
              'p-3 rounded-md text-center transition-all duration-normal ease-gentle',
              'hover:bg-surface-faint dark:hover:bg-surface-dim/10',
              selectedSound?.id === sound.id
                ? 'bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/20'
                : 'text-ink-muted hover:text-ink-rich dark:text-ink-muted/70 dark:hover:text-ink-inverse'
            )}
          >
            <span className="text-2xl mb-1 block sound-wave">{sound.icon}</span>
            <span className="text-xs block">{sound.name}</span>
          </button>
        ))}
      </div>

      {/* Volume Control */}
      <div className="p-3 border-t border-ink-faint/10">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-ink-muted dark:text-ink-muted/70">
              Volume
            </label>
            <span className="text-xs text-ink-muted dark:text-ink-muted/70">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-full accent-accent-primary"
          />
        </div>
      </div>
    </div>
  );
};

export default AmbientSoundPlayer;
