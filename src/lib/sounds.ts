const createAudio = (src: string) => {
  if (typeof window === 'undefined') return null;
  return new Audio(src);
};

const sounds = {
  key: createAudio('/sounds/key.mp3'),
  space: createAudio('/sounds/space.mp3'),
  return: createAudio('/sounds/return.mp3'),
};

let isSoundEnabled = false;

export const enableTypewriterSound = () => {
  isSoundEnabled = true;
};

export const disableTypewriterSound = () => {
  isSoundEnabled = false;
};

export const playTypewriterSound = (key: string) => {
  if (!isSoundEnabled || typeof window === 'undefined') return;

  try {
    const sound =
      key === ' ' ? sounds.space : key === 'Enter' ? sounds.return : sounds.key;

    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  } catch (error) {
    // Silently fail if sound playback fails
    console.debug('Sound playback failed:', error);
  }
};
