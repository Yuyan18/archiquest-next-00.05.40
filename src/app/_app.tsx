import type { AppProps } from 'next/app';
import { useEffect, useRef } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/path/to/your/music.mp3');
    audio.loop = true;
    audioRef.current = audio;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          // Automatic playback started!
        })
        .catch((error) => {
          // Automatic playback failed.
          // Show a UI element to let the user manually start playback.
          console.error('Failed to play audio:', error);
        });
    }

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;