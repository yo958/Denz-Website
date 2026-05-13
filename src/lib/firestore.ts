import { doc, getDoc, onSnapshot, setDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const DATE_TAG = '__d';
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function reviver(_: string, v: unknown) {
  if (typeof v === 'string' && ISO_DATE_RE.test(v)) return new Date(v);
  if (v && typeof v === 'object' && DATE_TAG in (v as Record<string, unknown>)) {
    const iso = (v as Record<string, unknown>)[DATE_TAG];
    if (typeof iso === 'string') return new Date(iso);
  }
  return v;
}

/** One-shot read of a POS storage slice from Firestore. */
export async function fetchSlice<T>(sliceName: string): Promise<T | null> {
  try {
    const ref = doc(db, 'stores', 'default', 'slices', sliceName);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as { v: number; serialized: string };
    return JSON.parse(data.serialized, reviver) as T;
  } catch (e) {
    console.warn('[firestore] fetchSlice error', sliceName, e);
    return null;
  }
}

/** Real-time subscription to a POS storage slice. */
export function watchSlice<T>(
  sliceName: string,
  callback: (data: T | null) => void,
): () => void {
  const ref = doc(db, 'stores', 'default', 'slices', sliceName);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) { callback(null); return; }
    try {
      const data = snap.data() as { v: number; serialized: string };
      callback(JSON.parse(data.serialized, reviver) as T);
    } catch (e) {
      console.warn('[firestore] watchSlice parse error', sliceName, e);
      callback(null);
    }
  }, (err) => {
    console.warn('[firestore] watchSlice error', sliceName, err);
    callback(null);
  });
}

/** Write a website order to the website-orders collection. */
export async function submitWebOrder(order: Record<string, unknown>): Promise<string> {
  const id = `wo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ref = doc(collection(db, 'website-orders'), id);
  await setDoc(ref, { ...order, id, createdAt: new Date().toISOString() });
  return id;
}

/** Query all website orders for a given email address. */
export async function fetchOrdersByEmail(email: string): Promise<Record<string, unknown>[]> {
  try {
    const q = query(
      collection(db, 'website-orders'),
      where('customerEmail', '==', email.toLowerCase().trim()),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Record<string, unknown>);
  } catch (e) {
    console.warn('[firestore] fetchOrdersByEmail error', e);
    return [];
  }
}

/** Subscribe to a single website order for status polling. */
export function watchWebOrder(
  id: string,
  callback: (data: Record<string, unknown> | null) => void,
): () => void {
  const ref = doc(db, 'website-orders', id);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as Record<string, unknown>) : null);
  });
}
