'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Clock, CheckCircle2, ChefHat, Package, XCircle, CheckCheck, LogOut, ClipboardList, ShieldCheck } from 'lucide-react';
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

// ── Auth gate shown when user is not signed in ─────────────────────────────
function AuthGate({ onOpen }: { onOpen: (mode: 'signin' | 'signup') => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-8 h-8 text-brand" />
      </div>
      <h2 className="text-2xl font-bold text-ink mb-2">Sign in to view your orders</h2>
      <p className="text-ink-muted mb-8 max-w-sm">
        Create an account or sign in to track your café orders, desk bookings, and room enquiries all in one place.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => onOpen('signin')}
          className="flex-1 py-3 px-6 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          Sign in
        </button>
        <button
          onClick={() => onOpen('signup')}
          className="flex-1 py-3 px-6 rounded-xl border border-ink-faint/40 text-ink text-sm font-semibold hover:bg-surface-muted transition-colors cursor-pointer"
        >
          Create account
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full text-left">
        {[
          { icon: ClipboardList, title: 'Order history', desc: 'See all your past and active orders in one place.' },
          { icon: Clock, title: 'Real-time status', desc: 'Track the status of your café and desk bookings.' },
          { icon: CheckCircle2, title: 'Booking confirmations', desc: 'Know when your desk or room enquiry has been accepted.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border border-ink-faint/20 p-4">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-brand" />
            </div>
            <p className="text-sm font-semibold text-ink mb-1">{title}</p>
            <p className="text-xs text-ink-muted">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-fetch orders when signed in
  useEffect(() => {
    if (!user?.email) { setOrders([]); return; }
    setLoading(true);
    fetchOrdersByEmail(user.email)
      .then(results => setOrders(results as unknown as Order[]))
      .finally(() => setLoading(false));
  }, [user]);

  function openAuth(mode: 'signin' | 'signup') {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  const activeOrders = orders.filter((o) => o.status !== 'done' && o.status !== 'cancelled');
  const pastOrders   = orders.filter((o) => o.status === 'done'  || o.status === 'cancelled');

  return (
    <>
      {/* Header */}
      <div className="pt-24 pb-12 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="brand" className="mb-4">My Orders</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-2">
            {user ? `Hi, ${user.displayName ?? user.email?.split('@')[0]}` : 'My orders'}
          </h1>
          {user && (
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <p className="text-ink-muted text-sm">{user.email}</p>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading auth state */}
        {authLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
          </div>
        )}

        {/* Not signed in — show auth gate */}
        {!authLoading && !user && <AuthGate onOpen={openAuth} />}

        {/* Signed in — show orders */}
        {!authLoading && user && (
          <>
            {loading && (
              <div className="flex items-center justify-center py-16 gap-3 text-ink-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading your orders…</span>
              </div>
            )}

            {!loading && orders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mx-auto mb-4 border border-ink-faint/20">
                  <ClipboardList className="w-6 h-6 text-ink-faint" />
                </div>
                <p className="font-semibold text-ink mb-1">No orders yet</p>
                <p className="text-sm text-ink-muted mb-6">
                  Orders placed with <strong>{user.email}</strong> will appear here.
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
                >
                  Browse the menu <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {!loading && orders.length > 0 && (
              <div className="space-y-8">
                <p className="text-sm text-ink-muted">
                  <strong className="text-ink">{orders.length} order{orders.length !== 1 ? 's' : ''}</strong> found
                </p>

                {activeOrders.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">Active</h2>
                    <div className="space-y-4">
                      {activeOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                    </div>
                  </div>
                )}

                {pastOrders.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">Past orders</h2>
                    <div className="space-y-4">
                      {pastOrders.map((order) => <OrderCard key={order.id} order={order} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {authOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </>
  );
}
