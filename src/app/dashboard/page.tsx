'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, ArrowRight, Clock, CheckCircle2, ChefHat, Package, XCircle, CheckCheck, LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { fetchOrdersByEmail } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import Link from 'next/link';

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'done' | 'cancelled';
type OrderType = 'cafe' | 'coworking' | 'room-enquiry';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  items?: OrderItem[];
  tableOrSpace?: string;
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock },
  accepted:  { label: 'Accepted',  color: 'bg-blue-100 text-blue-700 border-blue-200',      icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ChefHat },
  ready:     { label: 'Ready!',    color: 'bg-green-100 text-green-700 border-green-200',    icon: Package },
  done:      { label: 'Complete',  color: 'bg-surface-raised text-ink-muted border-ink-faint/40', icon: CheckCheck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
};

const TYPE_LABELS: Record<OrderType, string> = {
  'cafe': 'Café order',
  'coworking': 'Desk booking',
  'room-enquiry': 'Room enquiry',
};

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const isActive = order.status !== 'done' && order.status !== 'cancelled';
  const orderTotal = order.items?.reduce((sum, i) => sum + i.price * i.qty, 0) ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-ink-faint/20 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-faint/10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-ink-muted">#{order.id.slice(0, 12)}</span>
          <span className="text-xs text-ink-subtle bg-surface-muted border border-ink-faint/20 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[order.type] ?? order.type}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="px-5 py-4">
        {order.items && order.items.length > 0 && (
          <div className="space-y-1 mb-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">{item.qty}× {item.name}</span>
                <span className="font-medium text-ink">฿{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            {orderTotal > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-ink-faint/10 mt-2">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-bold text-ink">฿{orderTotal.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {order.tableOrSpace && (
          <p className="text-xs text-ink-muted mb-1">
            <span className="font-medium text-ink">Location:</span> {order.tableOrSpace}
          </p>
        )}
        {order.notes && (
          <p className="text-xs text-ink-muted mb-1">
            <span className="font-medium text-ink">Notes:</span> {order.notes}
          </p>
        )}

        <p className="text-xs text-ink-subtle mt-2">
          {new Date(order.createdAt).toLocaleString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {isActive && (
        <div className="px-5 pb-4">
          <Link
            href={`/order/${order.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            Track this order <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // When a user is signed in, auto-fetch their orders by email
  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    setSearched(false);
    fetchOrdersByEmail(user.email).then(results => {
      setOrders(results as unknown as Order[]);
      setSubmittedEmail(user.email!);
      setSearched(true);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const results = await fetchOrdersByEmail(email.trim());
      setOrders(results as unknown as Order[]);
      setSubmittedEmail(email.trim());
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'done' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'done' || o.status === 'cancelled');

  return (
    <>
      {/* Header */}
      <div className="pt-24 pb-16 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="brand" className="mb-4">Dashboard</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-2">Your orders</h1>
          {user ? (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-ink-muted">Signed in as <strong className="text-ink">{user.displayName ?? user.email}</strong></p>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <p className="text-ink-muted">Enter the email you used when placing your order to see your history.</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Show auth loading shimmer */}
        {authLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {/* Search form — only shown when not signed in */}
        {!authLoading && !user && (
          <>
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white border border-ink-faint/40 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/50 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {/* Sign-in prompt */}
            <div className="flex items-center gap-3 mb-10 px-4 py-3 bg-surface-muted rounded-xl border border-ink-faint/20">
              <LogIn className="w-4 h-4 text-brand shrink-0" />
              <p className="text-sm text-ink-muted flex-1">
                <button onClick={() => setAuthOpen(true)} className="text-brand font-semibold hover:underline cursor-pointer">Sign in</button>
                {' '}to automatically see all your orders without searching.
              </p>
            </div>
          </>
        )}

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Looking up your orders…</span>
          </div>
        )}

        {searched && !loading && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-ink-faint" />
            </div>
            <p className="font-semibold text-ink mb-1">No orders found</p>
            <p className="text-sm text-ink-muted">
              We couldn&apos;t find any orders for <strong>{submittedEmail}</strong>.<br />
              Double-check the email address or place a new order.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 mt-6 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
            >
              Browse the menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {searched && !loading && orders.length > 0 && (
          <div className="space-y-8">
            <p className="text-sm text-ink-muted">
              Found <strong className="text-ink">{orders.length} order{orders.length !== 1 ? 's' : ''}</strong> for {submittedEmail}
            </p>

            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">Active orders</h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">Past orders</h2>
                <div className="space-y-4">
                  {pastOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state when not signed in and no search yet */}
        {!searched && !loading && !authLoading && !user && (
          <div className="text-center py-12 text-ink-muted">
            <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4 border border-ink-faint/20">
              <Search className="w-6 h-6 text-ink-faint" />
            </div>
            <p className="text-sm">Enter your email above to find your orders.</p>
          </div>
        )}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
