'use client';

import { useEffect, useState } from 'react';
import { watchSlice } from '@/lib/firestore';

export function useFirestoreSlice<T>(sliceName: string, fallback: T): {
  data: T;
  loading: boolean;
  fromFirestore: boolean;
} {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [fromFirestore, setFromFirestore] = useState(false);

  useEffect(() => {
    const unsub = watchSlice<T>(sliceName, (result) => {
      if (result !== null) {
        setData(result);
        setFromFirestore(true);
      }
      setLoading(false);
    });
    return unsub;
  }, [sliceName]);

  return { data, loading, fromFirestore };
}
