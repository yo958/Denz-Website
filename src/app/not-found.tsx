import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-ink-faint mb-6">404</p>
        <h1 className="text-2xl font-bold text-ink mb-3">Page not found</h1>
        <p className="text-ink-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
