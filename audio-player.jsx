// Custom audio player + reveal overlay logic

const formatTime = (s) => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const AudioPlayer = ({ src, audioRef, autoPlay = false, compact = false }) => {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(0);
  const trackRef = React.useRef(null);
  const internalRef = React.useRef(null);
  const ref = audioRef || internalRef;

  React.useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => {
      setCurrent(a.currentTime);
      if (a.duration) setProgress((a.currentTime / a.duration) * 100);
    };
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setProgress(0); setCurrent(0); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnd);
    if (a.readyState >= 1) onMeta();
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnd);
    };
  }, [ref]);

  React.useEffect(() => {
    if (autoPlay && ref.current) {
      const p = ref.current.play();
      if (p && p.catch) p.catch(() => {});
    }
  }, [autoPlay, ref]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(()=>{}); }
    else a.pause();
  };

  const seek = (e) => {
    const a = ref.current; const t = trackRef.current;
    if (!a || !t || !a.duration) return;
    const r = t.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    a.currentTime = pct * a.duration;
  };

  return (
    <div className="player">
      <audio ref={ref} src={src} preload="metadata"/>
      <button className="play-btn" onClick={toggle} aria-label={playing ? 'Duraklat' : 'Oynat'}>
        {playing ? <PauseIcon size={compact ? 18 : 22}/> : <PlayIcon size={compact ? 18 : 22}/>}
      </button>
      <div className="player-track" ref={trackRef} onClick={seek}>
        <div className="player-fill" style={{ width: `${progress}%` }}/>
      </div>
      <div className="player-time">{formatTime(playing || current ? current : duration)}</div>
    </div>
  );
};

const AudioWaves = ({ playing }) => (
  <div className="audio-waves" aria-hidden="true">
    {Array.from({ length: 22 }).map((_, i) => (
      <div
        key={i}
        className={`wave-bar ${playing ? '' : 'idle'}`}
        style={{
          animationDelay: `${i * 0.07}s`,
          animationDuration: `${0.9 + (i % 5) * 0.15}s`,
        }}
      />
    ))}
  </div>
);

Object.assign(window, { AudioPlayer, AudioWaves, formatTime });
