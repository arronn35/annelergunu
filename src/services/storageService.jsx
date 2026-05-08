import React from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString, uploadBytes } from 'firebase/storage';
import { authReady, db, firebaseEnabled, storage } from './firebase.js';

export const REVEAL_KEY = 'arven_revealed_v1';
export const NOTES_KEY = 'arven_notes_v1';
export const PHOTOS_KEY = 'arven_photos_v1';

const QUEUE_KEY = 'arven_pending_ops_v1';
const MIGRATION_KEY = 'arven_migration_v1';

const seedNotes = [
  {
    id: 'seed-anneanne',
    name: 'Anneanne',
    text: 'Minik prensesimizi sabırsızlıkla bekliyoruz. Annesine de babasına da yakıştı bu mutluluk.',
    ts: Date.now() - 86400000 * 3,
  },
  {
    id: 'seed-halasi',
    name: 'Halası',
    text: 'Daha gelmedin ama seni çoktan sevdik. Annene iyi bak küçük kalbim.',
    ts: Date.now() - 86400000,
  },
];

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const enqueue = (op) => {
  const queue = readJson(QUEUE_KEY, []);
  writeJson(QUEUE_KEY, [...queue, { ...op, queuedAt: Date.now() }]);
};

const safeName = (name = 'photo') => name.replace(/[^\w.-]+/g, '-').slice(0, 80) || 'photo';

const makeId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const dataUrlHash = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
};

const normalizeNote = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    text: data.text,
    ts: data.createdAt || Date.now(),
  };
};

const normalizePhoto = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    src: data.imageUrl,
    storagePath: data.storagePath,
    ts: data.createdAt || Date.now(),
  };
};

const localNotes = () => readJson(NOTES_KEY, seedNotes);
const localPhotos = () => readJson(PHOTOS_KEY, []);
let migrationPromise = null;

const ensureUser = async () => {
  if (!firebaseEnabled) return null;
  return authReady;
};

const createNoteInFirebase = async ({ id = makeId('note'), name, text, ts = Date.now() }) => {
  const user = await ensureUser();
  if (!user || !db) throw new Error('Firebase is not ready.');
  const targetDoc = doc(db, 'notes', id);
  const existing = await getDoc(targetDoc);
  if (existing.exists()) return existing.data();
  const cleanNote = {
    id,
    name: name.trim().slice(0, 60),
    text: text.trim().slice(0, 400),
    createdAt: ts,
    createdBy: user.uid,
    deletedAt: null,
  };
  await setDoc(targetDoc, cleanNote);
  return cleanNote;
};

const createPhotoFromDataUrl = async ({ id = makeId('photo'), dataUrl, name = 'photo.jpg', ts = Date.now() }) => {
  const user = await ensureUser();
  if (!user || !db || !storage) throw new Error('Firebase is not ready.');
  const targetDoc = doc(db, 'photos', id);
  const existing = await getDoc(targetDoc);
  if (existing.exists()) return existing.data();
  const storagePath = `photos/${id}/${safeName(name)}`;
  const photoRef = ref(storage, storagePath);
  await uploadString(photoRef, dataUrl, 'data_url');
  const imageUrl = await getDownloadURL(photoRef);
  const photoDoc = { id, imageUrl, storagePath, createdAt: ts, createdBy: user.uid, deletedAt: null };
  await setDoc(targetDoc, photoDoc);
  return photoDoc;
};

const createPhotoFromFile = async (file) => {
  const user = await ensureUser();
  if (!user || !db || !storage) throw new Error('Firebase is not ready.');
  const id = makeId('photo');
  const storagePath = `photos/${id}/${safeName(file.name)}`;
  const photoRef = ref(storage, storagePath);
  await uploadBytes(photoRef, file, { contentType: file.type || 'image/jpeg' });
  const imageUrl = await getDownloadURL(photoRef);
  const photoDoc = { id, imageUrl, storagePath, createdAt: Date.now(), createdBy: user.uid, deletedAt: null };
  await setDoc(doc(db, 'photos', id), photoDoc);
  return photoDoc;
};

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const flushPendingQueue = async () => {
  if (!firebaseEnabled) return;
  const queue = readJson(QUEUE_KEY, []);
  if (!queue.length) return;

  const remaining = [];
  for (const op of queue) {
    try {
      if (op.type === 'addNote') await createNoteInFirebase(op.payload);
      if (op.type === 'addPhoto') await createPhotoFromDataUrl(op.payload);
      if (op.type === 'deleteNote') await updateDoc(doc(db, 'notes', op.id), { deletedAt: Date.now() });
      if (op.type === 'deletePhoto') await updateDoc(doc(db, 'photos', op.id), { deletedAt: Date.now() });
    } catch {
      remaining.push(op);
    }
  }
  writeJson(QUEUE_KEY, remaining);
};

const migrateLocalData = async () => {
  if (!firebaseEnabled) return;
  const migration = readJson(MIGRATION_KEY, {});

  if (!migration.seedNotesDone) {
    await Promise.all(seedNotes.map((note) => createNoteInFirebase(note)));
    writeJson(MIGRATION_KEY, { ...migration, seedNotesDone: true });
  }

  const latestMigration = readJson(MIGRATION_KEY, {});
  if (!latestMigration.notesDone) {
    const rawNotes = readJson(NOTES_KEY, null);
    if (Array.isArray(rawNotes) && rawNotes.length) {
      await Promise.all(
        rawNotes.map((note) =>
          createNoteInFirebase({
            id: `migrated-note-${note.id}`,
            name: note.name,
            text: note.text,
            ts: note.ts || Date.now(),
          }),
        ),
      );
    }
    writeJson(MIGRATION_KEY, { ...readJson(MIGRATION_KEY, {}), notesDone: true });
  }

  if (!readJson(MIGRATION_KEY, {}).photosDone) {
    const rawPhotos = readJson(PHOTOS_KEY, null);
    if (Array.isArray(rawPhotos) && rawPhotos.length) {
      await Promise.all(
        rawPhotos.map((dataUrl, index) =>
          createPhotoFromDataUrl({
            id: `migrated-photo-${dataUrlHash(dataUrl)}`,
            dataUrl,
            name: `local-photo-${index + 1}.jpg`,
            ts: Date.now() + index,
          }),
        ),
      );
    }
    writeJson(MIGRATION_KEY, { ...readJson(MIGRATION_KEY, {}), photosDone: true });
  }
};

const runMigrationOnce = () => {
  if (!migrationPromise) {
    migrationPromise = migrateLocalData().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }
  return migrationPromise;
};

export const useNotesData = () => {
  const [notes, setNotes] = React.useState(localNotes);
  const [status, setStatus] = React.useState(firebaseEnabled ? 'Firebase bağlanıyor...' : 'Yerel demo modu');

  React.useEffect(() => {
    if (!firebaseEnabled || !db) return undefined;
    let alive = true;
    runMigrationOnce()
      .then(flushPendingQueue)
      .catch((error) => console.warn('Local note migration failed.', error));

    const notesQuery = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        if (!alive) return;
        const next = snapshot.docs
          .filter((item) => !item.data().deletedAt)
          .map(normalizeNote);
        setNotes(next);
        writeJson(NOTES_KEY, next);
        setStatus('Firebase aktif');
      },
      (error) => {
        console.warn('Notes subscription failed; local fallback is active.', error);
        setStatus('Firebase okunamadı, yerel yedek aktif');
      },
    );

    window.addEventListener('online', flushPendingQueue);
    return () => {
      alive = false;
      unsubscribe();
      window.removeEventListener('online', flushPendingQueue);
    };
  }, []);

  const addNote = async ({ name, text }) => {
    const note = { id: makeId('note'), name: name.trim(), text: text.trim(), ts: Date.now() };
    if (!note.name || !note.text) return;

    try {
      setStatus('Not kaydediliyor...');
      await createNoteInFirebase(note);
      setStatus('Firebase aktif');
    } catch {
      enqueue({ type: 'addNote', payload: note });
      setNotes((prev) => {
        const next = [note, ...prev];
        writeJson(NOTES_KEY, next);
        return next;
      });
      setStatus('Bağlantı yok, not yerel kuyruğa alındı');
    }
  };

  const removeNote = async (id) => {
    setNotes((prev) => {
      const next = prev.filter((note) => note.id !== id);
      writeJson(NOTES_KEY, next);
      return next;
    });
    try {
      if (!firebaseEnabled || !db) throw new Error('Firebase is not ready.');
      await updateDoc(doc(db, 'notes', id), { deletedAt: Date.now() });
      setStatus('Firebase aktif');
    } catch {
      enqueue({ type: 'deleteNote', id });
      setStatus('Silme işlemi yerel kuyruğa alındı');
    }
  };

  return { notes, addNote, removeNote, status };
};

export const usePhotosData = () => {
  const [photos, setPhotos] = React.useState(() =>
    localPhotos().map((src, index) => (typeof src === 'string' ? { id: `local-photo-${index}`, src } : src)),
  );
  const [status, setStatus] = React.useState(firebaseEnabled ? 'Firebase bağlanıyor...' : 'Yerel demo modu');

  React.useEffect(() => {
    if (!firebaseEnabled || !db) return undefined;
    let alive = true;
    runMigrationOnce()
      .then(flushPendingQueue)
      .catch((error) => console.warn('Local photo migration failed.', error));

    const photosQuery = query(collection(db, 'photos'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      photosQuery,
      (snapshot) => {
        if (!alive) return;
        const next = snapshot.docs
          .filter((item) => !item.data().deletedAt)
          .map(normalizePhoto);
        setPhotos(next);
        writeJson(PHOTOS_KEY, next.map((photo) => photo.src));
        setStatus('Firebase aktif');
      },
      (error) => {
        console.warn('Photos subscription failed; local fallback is active.', error);
        setStatus('Firebase okunamadı, yerel yedek aktif');
      },
    );

    window.addEventListener('online', flushPendingQueue);
    return () => {
      alive = false;
      unsubscribe();
      window.removeEventListener('online', flushPendingQueue);
    };
  }, []);

  const addPhotoFiles = async (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return 0;
    let added = 0;

    for (const file of imageFiles) {
      try {
        setStatus('Fotoğraf Firebase Storage’a yükleniyor...');
        const photoDoc = await createPhotoFromFile(file);
        added += 1;
        if (!firebaseEnabled) throw new Error('Firebase is not ready.');
        setPhotos((prev) => (prev.some((photo) => photo.id === photoDoc.id) ? prev : [...prev, normalizePhoto({ id: photoDoc.id, data: () => photoDoc })]));
        setStatus('Firebase aktif');
      } catch {
        const dataUrl = await fileToDataURL(file);
        const localPhoto = { id: makeId('local-photo'), src: dataUrl, ts: Date.now() };
        enqueue({ type: 'addPhoto', payload: { id: localPhoto.id, dataUrl, name: file.name, ts: localPhoto.ts } });
        setPhotos((prev) => {
          const next = [...prev, localPhoto];
          writeJson(PHOTOS_KEY, next.map((photo) => photo.src));
          return next;
        });
        setStatus('Bağlantı yok, fotoğraf yerel kuyruğa alındı');
        added += 1;
      }
    }

    return added;
  };

  const removePhoto = async (id) => {
    setPhotos((prev) => {
      const next = prev.filter((photo) => photo.id !== id);
      writeJson(PHOTOS_KEY, next.map((photo) => photo.src));
      return next;
    });
    try {
      if (!firebaseEnabled || !db) throw new Error('Firebase is not ready.');
      await updateDoc(doc(db, 'photos', id), { deletedAt: Date.now() });
      setStatus('Firebase aktif');
    } catch {
      enqueue({ type: 'deletePhoto', id });
      setStatus('Silme işlemi yerel kuyruğa alındı');
    }
  };

  return { photos, addPhotoFiles, removePhoto, status };
};
