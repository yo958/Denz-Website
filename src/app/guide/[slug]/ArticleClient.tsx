'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TableOfContents, type TocItem } from './TableOfContents';

export function ArticleClient({ toc, hasInstagram }: { toc: TocItem[]; hasInstagram: boolean }) {
  const [activeId, setActiveId] = useState('');
  const [mounted, setMounted] = useState(false);

  // Mount flag — portals require the DOM to exist
  useEffect(() => { setMounted(true); }, []);

  // Track active heading via IntersectionObserver on the server-rendered article body
  useEffect(() => {
    const body = document.getElementById('guide-article-body');
    if (!body) return;
    const headings = body.querySelectorAll('h2[id], h3[id]');
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px' },
    );
    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  // Load Instagram embed script
  useEffect(() => {
    if (!hasInstagram) return;
    const w = window as Window & { instgrm?: { Embeds: { process: () => void } } };
    const timer = setTimeout(() => {
      if (w.instgrm) { w.instgrm.Embeds.process(); return; }
      if (document.querySelector('script[src*="instagram.com/embed"]')) return;
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embeds.js';
      script.async = true;
      script.onload = () => w.instgrm?.Embeds.process();
      document.body.appendChild(script);
    }, 100);
    return () => clearTimeout(timer);
  }, [hasInstagram]);

  if (!mounted) return null;

  const mobilSlot = document.getElementById('mobile-toc-slot');
  const desktopSlot = document.getElementById('desktop-toc-slot');
  const tocEl = <TableOfContents toc={toc} activeId={activeId} />;

  return (
    <>
      {toc.length >= 3 && mobilSlot && createPortal(tocEl, mobilSlot)}
      {toc.length >= 2 && desktopSlot && createPortal(tocEl, desktopSlot)}
    </>
  );
}
