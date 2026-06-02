import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

const LAST_UPDATED = '2 June 2025';
const CONTACT_EMAIL = 'hello@denzphuket.com';

export default function PrivacyPage() {
  return (
    <>
      <div className="pt-24 pb-16 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="brand" className="mb-4">Legal</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">Privacy Policy</h1>
          <p className="text-ink-muted">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose prose-ink">
        <p className="text-ink-muted">
          Denz (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates{' '}
          <a href="https://denzphuket.com" className="text-brand hover:underline">denzphuket.com</a>.
          This page explains what information we collect, why we collect it, and how we use it.
        </p>

        <Section title="1. Information we collect">
          <p>We collect information in the following ways:</p>
          <ul>
            <li><strong>Booking &amp; order details</strong> — name, email address, phone number, and any notes you provide when placing an online order or room enquiry.</li>
            <li><strong>Usage data</strong> — pages visited, browser type, device type, and referring URL, collected via Google Analytics (anonymised IP).</li>
            <li><strong>Cookies</strong> — session cookies used for authentication (if you create an account) and analytics cookies from Google Analytics. No advertising cookies are set.</li>
          </ul>
          <p>We do <strong>not</strong> collect payment card data directly — all payments are handled in person at the venue.</p>
        </Section>

        <Section title="2. How we use your information">
          <ul>
            <li>To process and fulfil your bookings or food orders.</li>
            <li>To contact you about your reservation or enquiry.</li>
            <li>To improve our website and services using aggregated analytics.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p>We do not sell or share your personal data with third parties for marketing purposes.</p>
        </Section>

        <Section title="3. Data retention">
          <p>
            Booking and order records are retained for up to 2 years for operational and accounting purposes, then deleted. Analytics data is retained in line with Google Analytics default settings (14 months).
          </p>
        </Section>

        <Section title="4. Third-party services">
          <p>We use the following third-party services that may process your data:</p>
          <ul>
            <li><strong>Google Analytics</strong> — website usage analytics. <a href="https://policies.google.com/privacy" className="text-brand hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.</li>
            <li><strong>Firebase (Google)</strong> — cloud database used to store bookings. Data is stored in Google Cloud infrastructure.</li>
            <li><strong>Instagram / Facebook</strong> — if you contact us via social media, your message is handled under their respective privacy policies.</li>
          </ul>
        </Section>

        <Section title="5. Your rights">
          <p>
            Under Thai PDPA (Personal Data Protection Act B.E. 2562) and applicable law, you have the right to access, correct, or request deletion of your personal data. To exercise any of these rights, email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            By continuing to use our website you consent to the use of essential and analytics cookies as described above. You can disable cookies in your browser settings at any time, though some features may not function correctly without them.
          </p>
        </Section>

        <Section title="7. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Questions about this policy? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand hover:underline">{CONTACT_EMAIL}</a> or visit our{' '}
            <Link href="/contact" className="text-brand hover:underline">Contact page</Link>.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-ink-faint/20 flex gap-6 text-sm text-ink-muted">
          <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service →</Link>
          <Link href="/contact" className="hover:text-ink transition-colors">Contact us</Link>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-ink mb-4">{title}</h2>
      <div className="text-ink-muted space-y-3 [&_a]:text-brand [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-ink [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}
