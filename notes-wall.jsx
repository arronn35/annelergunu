// Notes wall — persisted to localStorage

const NOTES_KEY = 'arven_notes_v1';

const seedNotes = [
  { id: 1, name: 'Anneanne', text: 'Minik prensesimizi sabırsızlıkla bekliyoruz. Annesine de babasına da yakıştı bu mutluluk.', ts: Date.now() - 86400000 * 3 },
  { id: 2, name: 'Halası',  text: 'Daha gelmedin ama seni çoktan sevdik. Annene iyi bak küçük kalbim.', ts: Date.now() - 86400000 },
];

const useNotes = () => {
  const [notes, setNotes] = React.useState(() => {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seedNotes;
  });
  React.useEffect(() => {
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);
  return [notes, setNotes];
};

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

const NotesWall = () => {
  const [notes, setNotes] = useNotes();
  const [name, setName] = React.useState('');
  const [text, setText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    const note = { id: Date.now(), name: name.trim(), text: text.trim(), ts: Date.now() };
    setNotes(prev => [note, ...prev]);
    setName(''); setText('');
    setTimeout(() => setSubmitting(false), 300);
  };

  const remove = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <div className="notes-section">
      <form className="note-form" onSubmit={submit}>
        <div className="note-form-row">
          <input
            className="note-input"
            placeholder="Adın ve soyadın"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            required
          />
          <textarea
            className="note-textarea"
            placeholder="Anneye ve minik prensese güzel sözlerini yaz…"
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={400}
            required
          />
          <button className="note-submit" type="submit" disabled={submitting}>
            <SendIcon/> Gönder
          </button>
        </div>
      </form>

      <div className="notes-grid">
        {notes.length === 0 && (
          <div className="notes-empty">İlk dileği sen bırak, bu sayfa o sıcak sözlerinle dolacak.</div>
        )}
        {notes.map((n, i) => (
          <article key={n.id} className="note-card" style={{ animationDelay: `${Math.min(i, 6) * 0.06}s` }}>
            <button className="note-delete" onClick={() => remove(n.id)} aria-label="Notu kaldır"><TrashIcon size={14}/></button>
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

Object.assign(window, { NotesWall });
