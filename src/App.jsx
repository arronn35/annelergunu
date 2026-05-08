import React from 'react';
import { AudioPlayer, AudioWaves } from './components/AudioPlayer.jsx';
import { FloatingField, PetalsLayer } from './components/FloatingField.jsx';
import { NotesWall } from './components/NotesWall.jsx';
import { PhotoSlider } from './components/PhotoSlider.jsx';
import { CloseIcon, HeartGift, PauseIcon, PlayIcon } from './components/Svgs.jsx';
import { REVEAL_KEY } from './services/storageService.jsx';

const AUDIO_SRC = '/assets/baby-voice.wav';

const Confetti = ({ active }) => {
  const pieces = React.useMemo(() => {
    const colors = ['#FFB6C8', '#F48FB1', '#EC407A', '#FFD6E2', '#FFC4D6', '#E8B86F', '#FFFFFF'];
    return Array.from({ length: 80 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 500;
      return {
        cx: Math.cos(angle) * dist,
        cy: Math.sin(angle) * dist,
        cs: 0.4 + Math.random() * 1.4,
        cr: Math.random() * 720 - 360,
        color: colors[i % colors.length],
        delay: Math.random() * 0.3,
        duration: 1.4 + Math.random() * 1.4,
        size: 8 + Math.random() * 14,
        shape: i % 4,
      };
    });
  }, [active]);

  if (!active) return null;
  return (
    <div className="confetti-burst">
      <div className="glow-burst" style={{ left: '50%', top: '50%', marginLeft: -50, marginTop: -50 }} />
      {pieces.map((p, i) => {
        const style = {
          '--cx': `${p.cx}px`,
          '--cy': `${p.cy}px`,
          '--cs': p.cs,
          '--cr': `${p.cr}deg`,
          width: p.size,
          height: p.size,
          background: p.color,
          animation: `confettiFly ${p.duration}s cubic-bezier(.2,.6,.4,1) ${p.delay}s forwards`,
          boxShadow: `0 0 12px ${p.color}88`,
        };
        if (p.shape === 0) style.borderRadius = '50%';
        else if (p.shape === 1) style.borderRadius = '2px';
        else if (p.shape === 2) {
          style.borderRadius = '50% 50% 0 50%';
          style.transform = 'translate(-50%, -50%) rotate(45deg)';
        } else {
          style.clipPath = 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)';
        }
        return <div key={i} className="confetti" style={style} />;
      })}
    </div>
  );
};

const PersistentMiniPlayer = ({ src, audioRef }) => {
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    audio.addEventListener('play', on);
    audio.addEventListener('pause', off);
    audio.addEventListener('ended', off);
    return () => {
      audio.removeEventListener('play', on);
      audio.removeEventListener('pause', off);
      audio.removeEventListener('ended', off);
    };
  }, [audioRef]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button className="play-btn" onClick={toggle} aria-label={playing ? 'Duraklat' : 'Oynat'}>
        {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
      </button>
    </>
  );
};

export const App = () => {
  const [hasRevealed, setHasRevealed] = React.useState(() => {
    try {
      return localStorage.getItem(REVEAL_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [bursting, setBursting] = React.useState(false);
  const [showAudio, setShowAudio] = React.useState(false);
  const [overlayActive, setOverlayActive] = React.useState(false);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [heroFading, setHeroFading] = React.useState(false);
  const [revealPlaying, setRevealPlaying] = React.useState(false);

  const persistentAudioRef = React.useRef(null);
  const revealAudioRef = React.useRef(null);

  React.useEffect(() => {
    if (!hasRevealed) document.body.classList.add('splash-locked');
    else document.body.classList.remove('splash-locked');
  }, [hasRevealed]);

  const triggerReveal = (firstTime = true) => {
    setOverlayActive(true);
    setBursting(true);
    if (firstTime) setHeroFading(true);
    setTimeout(() => {
      setShowAudio(true);
      setAutoPlay(true);
    }, 700);
    if (firstTime) {
      setTimeout(() => {
        setHasRevealed(true);
        try {
          localStorage.setItem(REVEAL_KEY, '1');
        } catch {}
      }, 1600);
    }
  };

  const closeReveal = () => {
    setShowAudio(false);
    setAutoPlay(false);
    setOverlayActive(false);
    setBursting(false);
    if (revealAudioRef.current) revealAudioRef.current.pause();
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && showAudio && hasRevealed) closeReveal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  React.useEffect(() => {
    const audio = revealAudioRef.current;
    if (!audio) return undefined;
    const on = () => setRevealPlaying(true);
    const off = () => setRevealPlaying(false);
    audio.addEventListener('play', on);
    audio.addEventListener('pause', off);
    audio.addEventListener('ended', off);
    return () => {
      audio.removeEventListener('play', on);
      audio.removeEventListener('pause', off);
      audio.removeEventListener('ended', off);
    };
  }, [showAudio]);

  return (
    <>
      <PetalsLayer />

      {!hasRevealed && (
        <section className="stage" aria-label="Karşılama">
          <FloatingField />
          <div className={`hero ${heroFading ? 'fading' : ''}`}>
            <div className="hero-eyebrow">Anneler Günü'ne özel · 2026</div>
            <h1 className="hero-title">
              Annelik sana çok yakışacak, <span className="amp">canım ablam.</span>
            </h1>
            <p className="hero-sub">
              Sevgili Merve, bu sayfa minik prensesinin sana ilk fısıltısını,
              ona bırakacağın anıları saklayacak.
            </p>

            <div
              className="gift-wrap"
              onClick={() => triggerReveal(true)}
              role="button"
              aria-label="Hediyeyi aç"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerReveal(true)}
            >
              <div className="gift-glow" />
              <HeartGift size={300} />
              <div className="gift-tap-hint">↑ tıkla, sürpriz seni bekliyor</div>
            </div>
          </div>
        </section>
      )}

      {hasRevealed && (
        <>
          <header className="stage" style={{ minHeight: '70vh' }}>
            <FloatingField />
            <div className="hero" style={{ minHeight: '70vh', paddingBottom: 40 }}>
              <div className="hero-eyebrow">Anneler Günü'ne özel · 2026</div>
              <h1 className="hero-title">
                Annelik sana çok yakışacak, <span className="amp">canım ablam.</span>
              </h1>
              <p className="hero-sub">
                Sevgili Merve, bu sayfa minik prensesinin sana ilk fısıltısını,
                ona bırakacağın anıları saklayacak.
              </p>
              <div className="scroll-cue">aşağı kaydır ↓</div>
            </div>
          </header>

          <section className="section photos-section" aria-label="Fotoğraflar">
            <div className="section-eyebrow">küçük anılar</div>
            <h2 className="section-title">Birlikte biriktireceğimiz kareler</h2>
            <p className="section-sub">
              Minik prensesin büyürken hatırlamak isteyeceği anları buraya bırakabilirsin.
              Sürükle-bırak ile fotoğraflar arasında gezin.
            </p>
            <PhotoSlider />
          </section>

          <section className="section notes-section" aria-label="Sevgi notları">
            <div className="section-eyebrow">sevgi defteri</div>
            <h2 className="section-title">Sevenlerinden ona ilk satırlar</h2>
            <p className="section-sub">
              Aileden ve arkadaşlardan gelen güzel dilekler burada toplanıyor.
              Sen de bir not bırak; ismin ve sözlerin onunla kalsın.
            </p>
            <NotesWall />
          </section>

          <footer className="footer">
            sevgiyle yapıldı <span className="footer-heart">♥</span> Merve & minik prenses
          </footer>
        </>
      )}

      {hasRevealed && (
        <>
          <button className="gift-sticker visible" onClick={() => triggerReveal(false)} aria-label="Sürprizi yeniden başlat">
            <HeartGift size={78} />
          </button>
          <div className="gift-sticker-tooltip">sürprizi yeniden aç</div>
        </>
      )}

      {hasRevealed && (
        <div className="floating-player visible">
          <span className="floating-label">prensesin sesi</span>
          <PersistentMiniPlayer src={AUDIO_SRC} audioRef={persistentAudioRef} />
        </div>
      )}

      <div
        className={`reveal-overlay ${overlayActive ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('reveal-overlay') && hasRevealed) closeReveal();
        }}
      >
        <Confetti active={bursting} />
      </div>
      <div className={`audio-reveal ${showAudio ? 'show' : ''}`}>
        <div className="audio-card">
          {hasRevealed && (
            <button className="audio-close" onClick={closeReveal} aria-label="Kapat"><CloseIcon /></button>
          )}
          <div className="audio-eyebrow">minik bir fısıltı</div>
          <div className="audio-title">Anne, sana bir merhabam var</div>
          <AudioWaves playing={revealPlaying} />
          <AudioPlayer src={AUDIO_SRC} audioRef={revealAudioRef} autoPlay={autoPlay} />
        </div>
      </div>
    </>
  );
};
