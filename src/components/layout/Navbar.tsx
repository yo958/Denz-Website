'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';

const BASE_NAV_LINKS = [
  { label: 'Menu', href: '/menu' },
  { label: 'Coworking', href: '/coworking' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Guides', href: '/guide' },
  { label: 'Contact', href: '/contact' },
];

const MY_ORDERS_LINK = { label: 'My Orders', href: '/dashboard' };

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const cartCount = useCart((s) => s.count());
  const { user, loading: authLoading, signOut } = useAuth();

  const navLinks = mounted && user
    ? [...BASE_NAV_LINKS, MY_ORDERS_LINK]
    : BASE_NAV_LINKS;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-ink-faint/30 shadow-sm'
            : 'bg-white/90 backdrop-blur-sm border-b border-ink-faint/20',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/denz-logo.png"
                alt="Denz"
                className="h-9 w-auto"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150',
                    pathname === link.href
                      ? 'bg-surface-muted text-ink'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-raised',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Auth button — desktop */}
              {mounted && !authLoading && (
                user ? (
                  <div className="hidden md:flex items-center gap-1.5">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
                      title={user.email ?? ''}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span className="max-w-[100px] truncate">{user.displayName ?? user.email}</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
                      aria-label="Sign out"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-ink-faint/40 text-ink hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                )
              )}

              <Link
                href="/order"
                className="hidden md:flex items-center gap-2 bg-brand text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors duration-150 relative"
              >
                <ShoppingBag className="w-4 h-4" />
                Order
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-white pt-16">
          <nav className="flex flex-col p-6 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 rounded-xl text-base font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-surface-muted text-ink'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-ink-faint/30 space-y-2">
              <Link
                href="/order"
                className="flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-full text-base font-semibold hover:bg-brand-dark transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Place an Order
              </Link>
              {mounted && !authLoading && (
                user ? (
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full text-base font-medium text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out ({user.displayName ?? user.email})
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthOpen(true); setOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full text-base font-medium text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                )
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Auth modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
