'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Minus, Plus, Trash2, Loader2, ArrowRight, ShoppingBag, CalendarDays, Clock, Monitor, BedDouble, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/store/cart';
import { submitWebOrder } from '@/lib/firestore';
import { useFirestoreSlice } from '@/hooks/useFirestoreSlice';
import Link from 'next/link';
import { Suspense } from 'react';

const PERIOD_LABELS: Record<string, string> = {
  hourly: 'Hourly', daily: 'Daily', weekly: 'Weekly',
  '2-weeks': '2 Weeks', monthly: 'Monthly',
  '3-months': '3 Months', '6-months': '6 Months', yearly: 'Yearly',
};

type OrderType = 'cafe' | 'coworking' | 'room-enquiry';

function OrderForm() {
  const router = useRouter();
  const params = useSearchParams();
  const typeParam = params.get('type') as OrderType | null;
  const spaceParam = params.get('space');
  const roomParam = params.get('room');
  const periodParam = params.get('period');
  const spaceTypeParam = params.get('spaceType');
  const bookingDateParam = params.get('bookingDate');
  const bookingTimeParam = params.get('bookingTime');

  const estimatedTotalParam = params.get('estimatedTotal');
  const hoursParam = params.get('hours');
  const isPrivateOffice = spaceTypeParam === 'private-office';

  // Look up the human-readable space/room name from Firestore
  const { data: spaces } = useFirestoreSlice<{ id: string; name: string; archived?: boolean }[]>('spaces', []);
  const { data: roomProducts } = useFirestoreSlice<{ id: string; name: string; archived?: boolean }[]>('products', []);
  const spaceName = spaces.find(s => s.id === spaceParam)?.name
    ?? spaceParam?.replace(/-/g, ' ') ?? '';
  const roomName = roomProducts.find(r => r.id === roomParam)?.name
    ?? roomParam?.replace(/-/g, ' ') ?? '';

  const { items, updateQty, removeItem, clear, total } = useCart();
  const [orderType, setOrderType] = useState<OrderType>(typeParam ?? 'cafe');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tableOrSpace, setTableOrSpace] = useState(spaceParam ?? roomParam ?? '');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasItems = items.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (orderType === 'cafe' && !hasItems) { setError('Please add at least one item.'); return; }
    if (isPrivateOffice && !duration.trim()) { setError('Please enter how long you need the office.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        note: i.note,
      }));
      const id = await submitWebOrder({
        type: orderType,
        items: orderItems,
        customerName: name.trim(),
        customerEmail: email.trim() || null,
        customerPhone: phone.trim() || null,
        tableOrSpace: tableOrSpace.trim() || null,
        duration: duration.trim() || null,
        notes: notes.trim() || null,
        status: 'pending',
        period: periodParam ?? null,
        bookingDate: bookingDateParam ?? null,
        bookingTime: bookingTimeParam ?? null,
      });
      clear();
      router.push(`/order/${id}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again or order at the counter.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Order type tabs */}
      <div className="flex gap-1 bg-surface-muted rounded-xl p-1 mb-8">
        {([
          { key: 'cafe', label: '☕  Café order' },
          { key: 'coworking', label: '💻  Desk booking' },
          { key: 'room-enquiry', label: '🛏️  Room enquiry' },
        ] as { key: OrderType; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setOrderType(t.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              orderType === t.key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cart items (café orders) */}
      {orderType === 'cafe' && (
        <div className="mb-8">
          <h2 className="font-bold text-ink mb-4">Your items</h2>
          {!hasItems ? (
            <div className="bg-surface-muted rounded-2xl p-8 text-center border border-ink-faint/20">
              <ShoppingBag className="w-8 h-8 text-ink-faint mx-auto mb-3" />
              <p className="text-ink-muted text-sm mb-4">Your basket is empty.</p>
              <Link href="/menu" className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors">
                Browse the menu
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-ink-faint/20 divide-y divide-ink-faint/10 shadow-sm">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm truncate">{item.name}</p>
                    <p className="text-xs text-ink-muted">฿{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center hover:bg-surface-raised/80 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 rounded-full bg-surface-raised flex items-center justify-center hover:bg-surface-raised/80 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-semibold text-ink text-sm w-16 text-right">
                    ฿{(item.price * item.qty).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-ink-faint hover:text-brand transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4 bg-surface-muted rounded-b-2xl">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-bold text-lg text-ink">฿{total().toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coworking booking summary card */}
      {orderType === 'coworking' && spaceParam && (
        <div className="mb-8 rounded-2xl border border-ink-faint/20 bg-white shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-ink text-white">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Monitor className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{spaceName}</p>
              {periodParam && (
                <p className="text-xs text-white/60 mt-0.5">
                  {PERIOD_LABELS[periodParam] ?? periodParam}
                  {hoursParam && ` · ${hoursParam} hour${parseInt(hoursParam) !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            {estimatedTotalParam && (
              <div className="text-right shrink-0">
                <p className="font-bold text-lg leading-tight">฿{parseInt(estimatedTotalParam).toLocaleString()}</p>
              </div>
            )}
          </div>
          {/* Card details */}
          <div className="px-5 py-4 space-y-2.5">
            {bookingDateParam && (
              <div className="flex items-center gap-2.5 text-sm text-ink">
                <CalendarDays className="w-4 h-4 text-ink-muted shrink-0" />
                <span>
                  {new Date(bookingDateParam + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {bookingTimeParam && (
              <div className="flex items-center gap-2.5 text-sm text-ink">
                <Clock className="w-4 h-4 text-ink-muted shrink-0" />
                <span>Starting at {bookingTimeParam}</span>
              </div>
            )}
            <div className="flex items-start gap-2.5 text-xs text-ink-muted pt-1 border-t border-ink-faint/20">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>We&apos;ll confirm availability by email or phone before your visit.</span>
            </div>
          </div>
        </div>
      )}

      {/* Room enquiry summary card */}
      {orderType === 'room-enquiry' && roomParam && (
        <div className="mb-8 rounded-2xl border border-ink-faint/20 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-ink text-white">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <BedDouble className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-sm leading-tight">{roomName}</p>
              <p className="text-xs text-white/60 mt-0.5">Room enquiry</p>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-2.5 text-xs text-ink-muted">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>We&apos;ll get back to you within a few hours to confirm dates, availability and pricing.</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-bold text-ink mb-2">Your details</h2>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Name <span className="text-brand">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+66 …"
              className="w-full bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
            />
          </div>
        </div>

        {orderType === 'cafe' && (
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Table / seat number</label>
            <input
              type="text"
              value={tableOrSpace}
              onChange={(e) => setTableOrSpace(e.target.value)}
              placeholder="e.g. Table 4, terrace left"
              className="w-full bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
            />
          </div>
        )}

        {isPrivateOffice && (
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              How long do you need the office? <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 2 hours, half day, full day"
              className="w-full bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
              required
            />
            <p className="text-xs text-ink-muted mt-1.5">We&apos;ll confirm availability and the exact rate when we get in touch.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Allergies, special requests, preferred dates…"
            className="w-full bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || (orderType === 'cafe' && !hasItems)}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white py-4 rounded-full font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Placing order…
            </>
          ) : (
            <>
              {orderType === 'cafe' ? 'Place order' : orderType === 'coworking' ? 'Send booking request' : 'Send enquiry'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <>
      <div className="pt-24 pb-12 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="brand" className="mb-4">Order</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-2">Your order</h1>
          <p className="text-ink-muted">Review your basket, fill in your details and submit.</p>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center py-24 gap-3 text-ink-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      }>
        <OrderForm />
      </Suspense>
    </>
  );
}
