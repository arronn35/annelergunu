// Manual drag photo slider with peek of next photo + upload via localStorage

const STORAGE_KEY = 'arven_photos_v1';

const usePhotos = () => {
  const [photos, setPhotos] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(photos)); } catch {}
  }, [photos]);
  return [photos, setPhotos];
};

const fileToDataURL = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

const PhotoSlider = () => {
  const [photos, setPhotos] = usePhotos();
  const [idx, setIdx] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const trackRef = React.useRef(null);
  const startX = React.useRef(0);
  const fileRef = React.useRef(null);

  const items = React.useMemo(() => [{ kind: 'add' }, ...photos.map((p, i) => ({ kind: 'photo', src: p, i }))], [photos]);

  const cardW = () => {
    const w = window.innerWidth;
    if (w < 640) return w * 0.78 + 24;
    return Math.min(460, Math.max(260, w * 0.36)) + 24;
  };

  const goTo = (i) => {
    const max = items.length - 1;
    setIdx(Math.max(0, Math.min(max, i)));
  };

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    setDragging(true);
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    if (trackRef.current) trackRef.current.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    setDragOffset(x - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    const threshold = cardW() * 0.25;
    if (dragOffset > threshold) goTo(idx - 1);
    else if (dragOffset < -threshold) goTo(idx + 1);
    setDragOffset(0);
    setDragging(false);
  };

  const handleFiles = async (files) => {
    const newOnes = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      try {
        const d = await fileToDataURL(f);
        newOnes.push(d);
      } catch {}
    }
    if (newOnes.length) {
      setPhotos(prev => [...prev, ...newOnes]);
      setIdx(items.length); // jump to last (new) photo, after add card
    }
  };

  const onPick = (e) => { handleFiles(Array.from(e.target.files || [])); e.target.value = ''; };
  const removePhoto = (i) => {
    setPhotos(prev => prev.filter((_, k) => k !== i));
    setIdx(prev => Math.max(0, prev - 1));
  };

  const translate = -idx * cardW() + dragOffset;

  return (
    <div className="photos-section">
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onPick}/>
      <div
        className="slider-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          ref={trackRef}
          className={`slider-track ${dragging ? 'dragging' : ''}`}
          style={{ transform: `translateX(${translate}px)` }}
        >
          {items.map((it, i) => {
            const active = i === idx;
            if (it.kind === 'add') {
              return (
                <div key="add" className={`photo-card add-card ${active ? 'is-active' : ''}`} onClick={() => fileRef.current?.click()}>
                  <div className="add-card-icon"><PlusIcon size={28}/></div>
                  <div className="add-card-title">Fotoğraf ekle</div>
                  <div className="add-card-sub">Bebeğin ilk anılarını buraya yükle</div>
                </div>
              );
            }
            return (
              <div key={i} className={`photo-card ${active ? 'is-active' : ''}`}>
                <img src={it.src} alt={`Anı ${it.i + 1}`} draggable={false}/>
                <button className="photo-delete" onClick={(e) => { e.stopPropagation(); removePhoto(it.i); }} aria-label="Kaldır">
                  <TrashIcon/>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="slider-controls">
        <button className="slider-btn" onClick={() => goTo(idx - 1)} disabled={idx === 0} aria-label="Önceki"><ChevronLeft/></button>
        <div className="slider-dots">
          {items.map((_, i) => (
            <button key={i} className={`slider-dot ${i === idx ? 'active' : ''}`} onClick={() => goTo(i)} aria-label={`Slayt ${i + 1}`}/>
          ))}
        </div>
        <button className="slider-btn" onClick={() => goTo(idx + 1)} disabled={idx >= items.length - 1} aria-label="Sonraki"><ChevronRight/></button>
      </div>
    </div>
  );
};

Object.assign(window, { PhotoSlider });
