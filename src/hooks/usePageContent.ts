'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function usePageContent<T extends Record<string, unknown>>(slug: string): T {
  const [content, setContent] = useState<T>({} as T);

  useEffect(() => {
    void (async () => {
      try {
        const snap = await getDoc(doc(db, 'page-content', slug));
        if (snap.exists()) setContent(snap.data() as T);
      } catch {
        // silently fall back to defaults
      }
    })();
  }, [slug]);

  return content;
}
