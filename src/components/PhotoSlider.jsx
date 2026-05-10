import React from 'react';
import { ChevronLeft, ChevronRight, PlusIcon, TrashIcon } from './Svgs.jsx';
import { usePhotosData } from '../services/storageService.jsx';

export const PhotoSlider = () => {
  const { photos, addPhotoFiles, removePhoto, uploadError, uploadProgress } = usePhotosData();
  const [idx, setIdx] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const trackRef = React.useRef(null);
  const idxRef = React.useRef(0);
  const startX = React.useRef(0);
  const dragOffset = React.useRef(0);
  const wheelOffset = React.useRef(0);
  const wheelTimer = React.useRef(null);
  const cardWidth = React.useRef(320);
  const inputId = React.useId();

  const items = React.useMemo(() => [{ kind: 'add' }, ...photos.map((p, i) => ({ kind: 'photo', ...p, i }))], [photos]);

  React.useEffect(() => {
    setIdx((current) => Math.min(current, Math.max(0, items.length - 1)));
  }, [items.length]);

  React.useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      cardWidth.current = w < 640 ? w * 0.78 + 24 : Math.min(460, Math.max(260, w * 0.36)) + 24;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    };
  }, []);

  const setTrackTransform = (offset = 0) => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translate3d(${-idxRef.current * cardWidth.current + offset}px, 0, 0)`;
  };

  const goTo = (i) => {
    const max = items.length - 1;
    setIdx(Math.max(0, Math.min(max, i)));
  };

  React.useEffect(() => {
    idxRef.current = idx;
    dragOffset.current = 0;
    setTrackTransform(0);
  }, [idx, items.length]);

  const settleWheel = () => {
    const threshold = cardWidth.current * 0.18;
    if (wheelOffset.current > threshold) goTo(idx + 1);
    else if (wheelOffset.current < -threshold) goTo(idx - 1);
    else setTrackTransform(0);
    wheelOffset.current = 0;
    setDragging(false);
  };

  const onWheel = (e) => {
    if (items.length <= 1 || e.target.closest('button, label, input, .add-card')) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 1) return;

    e.preventDefault();
    setDragging(true);
    wheelOffset.current += delta;
    const maxPreview = cardWidth.current * 0.45;
    setTrackTransform(Math.max(-maxPreview, Math.min(maxPreview, -wheelOffset.current)));

    if (wheelTimer.current) window.clearTimeout(wheelTimer.current);
    wheelTimer.current = window.setTimeout(settleWheel, 120);
  };

  const onPointerDown = (e) => {
    if (e.target.closest('button, label, input, .add-card')) return;
    setDragging(true);
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    if (trackRef.current) trackRef.current.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragOffset.current = x - startX.current;
    setTrackTransform(dragOffset.current);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    const threshold = cardWidth.current * 0.25;
    if (dragOffset.current > threshold) goTo(idx - 1);
    else if (dragOffset.current < -threshold) goTo(idx + 1);
    else setTrackTransform(0);
    dragOffset.current = 0;
    setDragging(false);
  };

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const added = await addPhotoFiles(files);
      if (added) setIdx(items.length + added - 1);
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
      <input id={inputId} className="photo-input" type="file" accept="image/*" multiple onChange={onPick} />
      {uploading && (
        <div className="data-status">
          Fotoğraf yükleniyor{uploadProgress !== null ? `... %${uploadProgress}` : '...'}
        </div>
      )}
      {uploadError && <div className="data-status error">{uploadError}</div>}
      <div
        className="slider-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <div
          ref={trackRef}
          className={`slider-track ${dragging ? 'dragging' : ''}`}
        >
          {items.map((it, i) => {
            const active = i === idx;
            if (it.kind === 'add') {
              return (
                <label key="add" htmlFor={inputId} className={`photo-card add-card ${active ? 'is-active' : ''}`}>
                  <div className="add-card-icon"><PlusIcon size={28} /></div>
                  <div className="add-card-title">Fotoğraf ekle</div>
                  <div className="add-card-sub">Mobilde galeriden, webde dosyalarından seç</div>
                </label>
              );
            }
            const shouldLoadImage = Math.abs(i - idx) <= 3;
            const aspectRatio = it.width && it.height ? `${it.width} / ${it.height}` : undefined;
            return (
              <div
                key={it.id}
                className={`photo-card ${active ? 'is-active' : ''}`}
                style={aspectRatio ? { '--photo-ratio': aspectRatio } : undefined}
              >
                {shouldLoadImage ? (
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
                ) : (
                  <div className="photo-placeholder" aria-hidden="true" />
                )}
                <button className="photo-delete" onClick={(e) => { e.stopPropagation(); removePhoto(it.id); }} aria-label="Kaldır">
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="slider-controls">
        <button className="slider-btn" onClick={() => goTo(idx - 1)} disabled={idx === 0} aria-label="Önceki"><ChevronLeft /></button>
        <div className="slider-dots">
          {items.map((_, i) => (
            <button key={i} className={`slider-dot ${i === idx ? 'active' : ''}`} onClick={() => goTo(i)} aria-label={`Slayt ${i + 1}`} />
          ))}
        </div>
        <button className="slider-btn" onClick={() => goTo(idx + 1)} disabled={idx >= items.length - 1} aria-label="Sonraki"><ChevronRight /></button>
      </div>
    </div>
  );
};
