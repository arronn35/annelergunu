// Main app — splash, reveal, and full page composition

const REVEAL_KEY = 'arven_revealed_v1';
const AUDIO_SRC = 'assets/baby-voice.wav';

const Confetti = ({ active }) => {
  const pieces = React.useMemo(() => {
    const colors = ['#FFB6C8', '#F48FB1', '#EC407A', '#FFD6E2', '#FFC4D6', '#E8B86F', '#FFFFFF'];
    return Array.from({ length: 80 }).map((_, i) => {
      const angle = (Math.random() * Math.PI * 2);
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
      <div className="glow-burst" style={{ left: '50%', top: '50%', marginLeft: -50, marginTop: -50 }}/>
      {pieces.map((p, i) => {
        const style = {
          '--cx': `${p.cx}px`,
          '--cy': `${p.cy}px`,
          '--cs': p.cs,
          '--cr': `${p.cr}deg`,
          width: p.size, height: p.size,
          background: p.color,
          animation: `confettiFly ${p.duration}s cubic-bezier(.2,.6,.4,1) ${p.delay}s forwards`,
          boxShadow: `0 0 12px ${p.color}88`,
        };
        if (p.shape === 0) style.borderRadius = '50%';
        else if (p.shape === 1) style.borderRadius = '2px';
        else if (p.shape === 2) {
          // heart-ish
          style.borderRadius = '50% 50% 0 50%';
          style.transform = 'translate(-50%, -50%) rotate(45deg)';
        } else {
          style.clipPath = 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)';
        }
        return <div key={i} className="confetti" style={style}/>;
      })}
    </div>
  );
};

const App = () => {
  // First-visit reveal
  const [hasRevealed, setHasRevealed] = React.useState(() => {
    try { return localStorage.getItem(REVEAL_KEY) === '1'; } catch { return false; }
  });
  const [bursting, setBursting] = React.useState(false);
  const [showAudio, setShowAudio] = React.useState(false);
  const [overlayActive, setOverlayActive] = React.useState(false);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [heroFading, setHeroFading] = React.useState(false);

  // Persistent floating audio
  const persistentAudioRef = React.useRef(null);
  const revealAudioRef = React.useRef(null);

  // Lock scroll while splash visible
  React.useEffect(() => {
    if (!hasRevealed) document.body.classList.add('splash-locked');
    else document.body.classList.remove('splash-locked');
  }, [hasRevealed]);

  const triggerReveal = (firstTime = true) => {
    setOverlayActive(true);
    setBursting(true);
    if (firstTime) setHeroFading(true);
    // After confetti, show audio card with autoplay
    setTimeout(() => {
      setShowAudio(true);
      setAutoPlay(true);
    }, 700);
    if (firstTime) {
      setTimeout(() => {
        setHasRevealed(true);
        try { localStorage.setItem(REVEAL_KEY, '1'); } catch {}
      }, 1600);
    }
  };

  const closeReveal = () => {
    setShowAudio(false);
    setAutoPlay(false);
    setOverlayActive(false);
    setBursting(false);
    // pause whichever audio was playing in the modal
    if (revealAudioRef.current) revealAudioRef.current.pause();
  };

  // Sticker re-triggers (does NOT fade hero again)
  const onStickerClick = () => {
    triggerReveal(false);
  };

  // Esc closes the modal once already revealed once
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && showAudio && hasRevealed) closeReveal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Track reveal-audio playing state for waves
  const [revealPlaying, setRevealPlaying] = React.useState(false);
  React.useEffect(() => {
    const a = revealAudioRef.current;
    if (!a) return;
    const on = () => setRevealPlaying(true);
    const off = () => setRevealPlaying(false);
    a.addEventListener('play', on); a.addEventListener('pause', off); a.addEventListener('ended', off);
    return () => { a.removeEventListener('play', on); a.removeEventListener('pause', off); a.removeEventListener('ended', off); };
  }, [showAudio]);

  return (
    <>
      <PetalsLayer/>

      {/* Splash / hero — visible until first reveal completes */}
      {!hasRevealed && (
        <section className="stage" aria-label="Karşılama">
          <FloatingField/>
          <div className={`hero ${heroFading ? 'fading' : ''}`}>
            <div className="hero-eyebrow">Anneler Günü'ne özel · 2026</div>
            <h1 className="hero-title">
              Annelik sana çok yakıştı, biricik <span className="amp">ablacığım</span>
            </h1>
            <p className="hero-sub">
              Sevgili Merve, içindeki minik kalbin sana minik bir sürprizi var.
              Hediyeyi açtığında onu duyacaksın.
            </p>

            <div className="gift-wrap" onClick={() => triggerReveal(true)} role="button" aria-label="Hediyeyi aç" tabIndex={0}
                 onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerReveal(true)}>
              <div className="gift-glow"/>
              <HeartGift size={300}/>
              <div className="gift-tap-hint">↑ tıkla, sürpriz seni bekliyor</div>
            </div>
          </div>
        </section>
      )}

      {/* After first reveal: full content (header + sections) */}
      {hasRevealed && (
        <>
          <header className="stage" style={{ minHeight: '70vh' }}>
            <FloatingField/>
            <div className="hero" style={{ minHeight: '70vh', paddingBottom: 40 }}>
              <div className="hero-eyebrow">Anneler Günü'ne özel · 2026</div>
              <h1 className="hero-title">
                Annelik sana çok yakıştı, biricik <span className="amp">ablacığım</span>
              </h1>
              <p className="hero-sub">
                Sevgili Merve, bu sayfa minik prensesinin sana ilk fısıltısını,
                ona bırakacağın anıları ve sevenlerinin satırlarını saklıyor.
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
            <PhotoSlider/>
          </section>

          <section className="section notes-section" aria-label="Sevgi notları">
            <div className="section-eyebrow">sevgi defteri</div>
            <h2 className="section-title">Sevenlerinden ona ilk satırlar</h2>
            <p className="section-sub">
              Aileden ve arkadaşlardan gelen güzel dilekler burada toplanıyor.
              Sen de bir not bırak; ismin ve sözlerin onunla kalsın.
            </p>
            <NotesWall/>
          </section>

          <footer className="footer">
            sevgiyle yapıldı <span className="footer-heart">♥</span> Merve & minik prenses
          </footer>
        </>
      )}

      {/* Gift sticker (top-left) — only after first reveal */}
      {hasRevealed && (
        <>
          <button className={`gift-sticker ${hasRevealed ? 'visible' : ''}`} onClick={onStickerClick} aria-label="Sürprizi yeniden başlat">
            <HeartGift size={78}/>
          </button>
          <div className="gift-sticker-tooltip">sürprizi yeniden aç</div>
        </>
      )}

      {/* Persistent floating mini-player (top-right) — only after first reveal */}
      {hasRevealed && (
        <div className={`floating-player visible`}>
          <span className="floating-label">prensesin sesi</span>
          <PersistentMiniPlayer src={AUDIO_SRC} audioRef={persistentAudioRef}/>
        </div>
      )}

      {/* Reveal overlay (confetti + audio card) */}
      <div className={`reveal-overlay ${overlayActive ? 'active' : ''}`} onClick={(e) => {
        if (e.target.classList.contains('reveal-overlay') && hasRevealed) closeReveal();
      }}>
        <Confetti active={bursting}/>
      </div>
      <div className={`audio-reveal ${showAudio ? 'show' : ''}`}>
        <div className="audio-card">
          {hasRevealed && (
            <button className="audio-close" onClick={closeReveal} aria-label="Kapat"><CloseIcon/></button>
          )}
          <div className="audio-eyebrow">minik bir fısıltı</div>
          <div className="audio-title">Anne, sana bir merhabam var</div>
          <AudioWaves playing={revealPlaying}/>
          <AudioPlayer src={AUDIO_SRC} audioRef={revealAudioRef} autoPlay={autoPlay}/>
        </div>
      </div>
    </>
  );
};

// Small wrapper so the floating mini-player doesn't double-up audio elements with the reveal one.
const PersistentMiniPlayer = ({ src, audioRef }) => {
  const [playing, setPlaying] = React.useState(false);
  React.useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const on = () => setPlaying(true); const off = () => setPlaying(false);
    a.addEventListener('play', on); a.addEventListener('pause', off); a.addEventListener('ended', off);
    return () => { a.removeEventListener('play', on); a.removeEventListener('pause', off); a.removeEventListener('ended', off); };
  }, [audioRef]);
  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(()=>{}); }
    else a.pause();
  };
  return (
    <>
      <audio ref={audioRef} src={src} preload="metadata"/>
      <button className="play-btn" onClick={toggle} aria-label={playing ? 'Duraklat' : 'Oynat'}>
        {playing ? <PauseIcon size={18}/> : <PlayIcon size={18}/>}
      </button>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
