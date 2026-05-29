'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, List } from 'lucide-react';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  const sections = toc.reduce<{ h2: TocItem; h3s: TocItem[] }[]>((acc, item) => {
    if (item.level === 2) acc.push({ h2: item, h3s: [] });
    else if (acc.length > 0) acc[acc.length - 1].h3s.push(item);
    return acc;
  }, []);

  const [open, setOpen] = useState<Set<string>>(() => new Set(toc.filter(t => t.level === 2).map(t => t.id)));

  useEffect(() => {
    const active = toc.find(t => t.id === activeId);
    if (!active) return;
    if (active.level === 2) {
      setOpen(prev => new Set([...prev, active.id]));
    } else {
      const idx = toc.indexOf(active);
      for (let i = idx - 1; i >= 0; i--) {
        if (toc[i].level === 2) { setOpen(prev => new Set([...prev, toc[i].id])); break; }
      }
    }
  }, [activeId, toc]);

  if (toc.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-2xl bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <List size={15} className="text-brand shrink-0" />
        <span className="text-sm font-semibold text-ink">Contents</span>
      </div>
      <ol className="space-y-0.5">
        {sections.map(({ h2, h3s }) => {
          const isOpen = open.has(h2.id);
          const h2Active = activeId === h2.id;
          const h3Active = h3s.some(h => h.id === activeId);
          return (
            <li key={h2.id}>
              <div className="flex items-center gap-1">
                <a
                  href={`#${h2.id}`}
                  className={`flex-1 text-sm py-1 leading-snug transition-colors hover:text-brand ${
                    h2Active ? 'text-brand font-semibold' : 'text-ink font-medium'
                  }`}
                >
                  {h2.text}
                </a>
                {h3s.length > 0 && (
                  <button
                    onClick={() => setOpen(prev => { const n = new Set(prev); n.has(h2.id) ? n.delete(h2.id) : n.add(h2.id); return n; })}
                    className="p-0.5 rounded text-ink-muted hover:text-brand transition-colors shrink-0"
                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                  >
                    <ChevronRight size={13} className={`transition-transform duration-200 ${(isOpen || h3Active) ? 'rotate-90' : ''}`} />
                  </button>
                )}
              </div>
              {h3s.length > 0 && (isOpen || h3Active) && (
                <ol className="ml-3 border-l border-ink/10 pl-3 mt-0.5 mb-1 space-y-0.5">
                  {h3s.map(h3 => (
                    <li key={h3.id}>
                      <a
                        href={`#${h3.id}`}
                        className={`block text-xs py-0.5 leading-snug transition-colors hover:text-brand ${
                          activeId === h3.id ? 'text-brand font-medium' : 'text-ink-muted'
                        }`}
                      >
                        {h3.text}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
