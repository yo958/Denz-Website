import { getAdminDb } from './firebase-admin';

export interface PageSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

export async function getPageSeo(slug: string): Promise<PageSeo> {
  try {
    const db = getAdminDb();
    if (!db) return {};
    const snap = await db.collection('page-content').doc(slug).get();
    if (!snap.exists) return {};
    return (snap.data()?.seo ?? {}) as PageSeo;
  } catch {
    return {};
  }
}
