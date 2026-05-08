import React from 'react';
import { SendIcon, TrashIcon } from './Svgs.jsx';
import { useNotesData } from '../services/storageService.jsx';

const formatRelative = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  const date = new Date(ts);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
};

const initials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
};

export const NotesWall = () => {
  const { notes, addNote, removeNote, status } = useNotesData();
  const [name, setName] = React.useState('');
  const [text, setText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    await addNote({ name, text });
    setName('');
    setText('');
    setSubmitting(false);
  };

  return (
    <div className="notes-section">
      <form className="note-form" onSubmit={submit}>
        <div className="note-form-row">
          <input
            className="note-input"
            placeholder="Adın ve soyadın"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
          />
          <textarea
            className="note-textarea"
            placeholder="Anneye ve minik prensese güzel sözlerini yaz…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={400}
            required
          />
          <button className="note-submit" type="submit" disabled={submitting}>
            <SendIcon /> Gönder
          </button>
        </div>
      </form>

      <div className="data-status">{status}</div>

      <div className="notes-grid">
        {notes.length === 0 && (
          <div className="notes-empty">İlk dileği sen bırak, bu sayfa o sıcak sözlerinle dolacak.</div>
        )}
        {notes.map((n, i) => (
          <article key={n.id} className="note-card" style={{ animationDelay: `${Math.min(i, 6) * 0.06}s` }}>
            <button className="note-delete" onClick={() => removeNote(n.id)} aria-label="Notu kaldır"><TrashIcon size={14} /></button>
            <div className="note-quote">{n.text}</div>
            <div className="note-author">
              <div className="note-avatar">{initials(n.name)}</div>
              <div>
                <div className="note-author-name">{n.name}</div>
                <div className="note-author-time">{formatRelative(n.ts)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
