import React from 'react';
import { ChevronLeft, ChevronRight, PlusIcon, TrashIcon } from './Svgs.jsx';
import { usePhotosData } from '../services/storageService.jsx';

export const PhotoSlider = () => {
  const { photos, addPhotoFiles, removePhoto, uploadError, uploadProgress } = usePhotosData();
  const [idx, setIdx] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const viewportRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const scrollTimer = React.useRef(null);
  const pendingScrollIndex = React.useRef(null);
  const inputId = React.useId();

  const items = React.useMemo(() => {
    const photoItems = photos
      .map((p, i) => ({ kind: 'photo', ...p, src: p.src || p.originalUrl, i }))
      .filter((p) => p.src);
    return photos.length ? [...photoItems, { kind: 'add' }] : [{ kind: 'add' }];
  }, [photos]);

  React.useEffect(() => {
    setIdx((current) => Math.min(current, Math.max(0, items.length - 1)));
  }, [items.length]);

  const scrollToIndex = (i, behavior = 'smooth') => {
    const max = items.length - 1;
    const next = Math.max(0, Math.min(max, i));
    setIdx(next);
    requestAnimationFrame(() => {
      cardRefs.current[next]?.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'center',
      });
    });
  };

  React.useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, items.length);
  }, [items.length]);

  React.useEffect(() => {
    const target = pendingScrollIndex.current;
    if (target === null) return undefined;
    pendingScrollIndex.current = null;

    const id = window.requestAnimationFrame(() => {
      scrollToIndex(target, 'smooth');
    });
    return () => window.cancelAnimationFrame(id);
  }, [items.length]);

  React.useEffect(() => {
    if (!items.length) return undefined;
    const id = window.requestAnimationFrame(() => {
      cardRefs.current[Math.min(idx, items.length - 1)]?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center',
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
  }, []);

  const syncActiveFromScroll = () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < nearestDistance) {
          nearest = i;
          nearestDistance = distance;
        }
      });
      setIdx(nearest);
    }, 80);
  };

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const added = await addPhotoFiles(files);
      if (added) {
        const target = Math.max(0, photos.length + added - 1);
        pendingScrollIndex.current = target;
        setIdx(target);
      }
    } finally {
      setUploading(false);
    }
  };

  const onPick = (e) => {
    handleFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  return (
    <div className="photos-section">
      <input id={inputId} className="photo-input" type="file" accept="image/*,.heic,.heif,.avif,.webp" multiple onChange={onPick} />
      {uploading && (
        <div className="data-status">
          Fotoğraf yükleniyor{uploadProgress !== null ? `... %${uploadProgress}` : '...'}
        </div>
      )}
      {uploadError && <div className="data-status error">{uploadError}</div>}
      <div
        ref={viewportRef}
        className="slider-viewport"
        onScroll={syncActiveFromScroll}
      >
        <div
          className="slider-track"
        >
          {items.map((it, i) => {
            const active = i === idx;
            if (it.kind === 'add') {
              return (
                <label
                  key="add"
                  ref={(el) => { cardRefs.current[i] = el; }}
                  htmlFor={inputId}
                  className={`photo-card add-card ${active ? 'is-active' : ''}`}
                >
                  <div className="add-card-icon"><PlusIcon size={28} /></div>
                  <div className="add-card-title">Fotoğraf ekle</div>
                  <div className="add-card-sub">Mobilde galeriden, webde dosyalarından seç</div>
                </label>
              );
            }
            return (
              <div
                key={it.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`photo-card ${active ? 'is-active' : ''}`}
              >
                <img
                  src={it.src}
                  alt={`Anı ${it.i + 1}`}
                  onError={(e) => {
                    if (it.originalUrl && e.currentTarget.src !== it.originalUrl) e.currentTarget.src = it.originalUrl;
                  }}
                  draggable={false}
                  loading={active ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={active ? 'high' : 'auto'}
                />
                <button className="photo-delete" onClick={(e) => { e.stopPropagation(); removePhoto(it.id); }} aria-label="Kaldır">
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="slider-controls">
        <button className="slider-btn" onClick={() => scrollToIndex(idx - 1)} disabled={idx === 0} aria-label="Önceki"><ChevronLeft /></button>
        <div className="slider-dots">
          {items.map((_, i) => (
            <button key={i} className={`slider-dot ${i === idx ? 'active' : ''}`} onClick={() => scrollToIndex(i)} aria-label={`Slayt ${i + 1}`} />
          ))}
        </div>
        <button className="slider-btn" onClick={() => scrollToIndex(idx + 1)} disabled={idx >= items.length - 1} aria-label="Sonraki"><ChevronRight /></button>
      </div>
    </div>
  );
};
