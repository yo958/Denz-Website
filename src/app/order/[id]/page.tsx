'use client';

import { use, useEffect, useState } from 'react';
import { CheckCircle2, Clock, ChefHat, Package, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { watchWebOrder } from '@/lib/firestore';

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'done' | 'cancelled';

const ALL_STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ElementType; cafeOnly?: boolean }[] = [
  { key: 'pending',   label: 'Order received',    icon: Clock },
  { key: 'accepted',  label: 'Accepted by staff',  icon: CheckCircle2 },
  { key: 'preparing', label: 'Being prepared',     icon: ChefHat,   cafeOnly: true },
  { key: 'ready',     label: 'Ready for you!',     icon: Package,   cafeOnly: true },
];

function getSteps(type: string | undefined) {
  return type === 'cafe'
    ? ALL_STATUS_STEPS
    : ALL_STATUS_STEPS.filter(s => !s.cafeOnly);
}

function statusIndex(s: OrderStatus, steps: typeof ALL_STATUS_STEPS): number {
  if (s === 'cancelled') return -1;
  if (s === 'done') return steps.length - 1;
  const idx = steps.findIndex(st => st.key === s);
  return idx === -1 ? 0 : idx;
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchWebOrder(id, (data) => {
      setOrder(data);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const status = (order?.status as OrderStatus) ?? 'pending';
  const steps = getSteps(order?.type as string | undefined);
  const currentStep = statusIndex(status, steps);
  const isCancelled = status === 'cancelled';
  const isDone = status === 'done';

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading your order…</p>
          </div>
        ) : !order ? (
          <div className="text-center py-24">
            <p className="text-ink-muted mb-6">We couldn&apos;t find this order. It may have expired.</p>
            <Link href="/menu" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors">
              Back to menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
                isCancelled ? 'bg-red-100' : isDone ? 'bg-green-100' : 'bg-brand/10'
              }`}>
                {isCancelled ? (
                  <span className="text-2xl">✕</span>
                ) : isDone ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-brand" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-ink mb-2">
                {isCancelled ? 'Order cancelled' : isDone ? 'All done!' : 'Order confirmed!'}
              </h1>
              <p className="text-ink-muted text-sm">
                {isCancelled
                  ? 'This order was cancelled. Please see staff for assistance.'
                  : isDone
                  ? 'Thanks for your order. Come back anytime!'
                  : 'Your order is with our team. We\'ll update the status below.'}
              </p>
              <p className="text-xs text-ink-subtle mt-2 font-mono">#{id.slice(0, 12)}</p>
            </div>

            {/* Status tracker */}
            {!isCancelled && !isDone && (
              <div className="bg-white rounded-2xl border border-ink-faint/20 p-6 shadow-sm mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-5">Order status</p>
                <div className="space-y-4">
                  {steps.map((step, i) => {
                    const done = i <= currentStep;
                    const isLastStep = i === steps.length - 1;
                    // "active" only applies mid-journey — the final reached step is treated as fully done
                    const active = i === currentStep && !isLastStep;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          done ? 'bg-green-500' : active ? 'bg-brand' : 'bg-surface-raised'
                        }`}>
                          {done ? (
                            <step.icon className="w-4 h-4 text-white" />
                          ) : active ? (
                            <step.icon className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs text-ink-faint">{i + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${done ? 'text-green-600' : active ? 'text-ink' : 'text-ink-muted'}`}>
                          {step.label}
                          {active && <span className="ml-2 inline-flex items-center gap-1 text-xs text-brand"><Loader2 className="w-3 h-3 animate-spin" /> updating…</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order summary */}
            {order.items && Array.isArray(order.items) && (order.items as unknown[]).length > 0 && (
              <div className="bg-white rounded-2xl border border-ink-faint/20 p-5 shadow-sm mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-4">Items ordered</p>
                <div className="space-y-2">
                  {(order.items as Array<{ name: string; qty: number; price: number }>).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{item.qty}× {item.name}</span>
                      <span className="font-medium text-ink">฿{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.duration && (
              <div className="bg-surface-muted rounded-xl px-5 py-3 mb-3 text-sm text-ink-muted border border-ink-faint/20">
                <strong className="text-ink">Duration requested: </strong>{String(order.duration)}
              </div>
            )}

            {order.notes && (
              <div className="bg-surface-muted rounded-xl px-5 py-3 mb-8 text-sm text-ink-muted border border-ink-faint/20">
                <strong className="text-ink">Notes: </strong>{String(order.notes)}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/menu" className="flex-1 flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors">
                Order more
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="flex-1 flex items-center justify-center bg-surface-muted text-ink py-3 rounded-full text-sm font-semibold hover:bg-surface-raised transition-colors border border-ink-faint/20">
                Back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
