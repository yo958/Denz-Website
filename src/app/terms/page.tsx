import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

const LAST_UPDATED = '2 June 2025';
const CONTACT_EMAIL = 'hello@denzphuket.com';

export default function TermsPage() {
  return (
    <>
      <div className="pt-24 pb-16 bg-white border-b border-ink-faint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="brand" className="mb-4">Legal</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink mb-4">Terms of Service</h1>
          <p className="text-ink-muted">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-ink-muted">
          By using our website or services at Denz, located in Kathu, Phuket, Thailand, you agree to these Terms of Service. Please read them carefully.
        </p>

        <Section title="1. About Denz">
          <p>
            Denz is a coworking café, restaurant, and guesthouse operating in Kathu, Phuket 83120, Thailand.
            Our website (<a href="https://denzphuket.com">denzphuket.com</a>) lets you browse our menu, book coworking spaces, enquire about rooms, and read our guide articles.
          </p>
        </Section>

        <Section title="2. Bookings and orders">
          <ul>
            <li>Online orders and booking enquiries submitted through the website are subject to availability and confirmation by our team.</li>
            <li>We will contact you via the details you provide to confirm or decline your request.</li>
            <li>Denz reserves the right to refuse or cancel any booking at its discretion.</li>
            <li>Prices shown on the website are in Thai Baht (THB) and are subject to change without notice.</li>
          </ul>
        </Section>

        <Section title="3. Cancellations">
          <ul>
            <li><strong>Café orders</strong> — please contact us as soon as possible if you need to cancel a food order.</li>
            <li><strong>Coworking</strong> — walk-in sessions are non-refundable once started. Pre-booked sessions cancelled with less than 24 hours&apos; notice may be charged in full.</li>
            <li><strong>Rooms</strong> — cancellation terms are agreed at the time of booking. Late cancellations may incur a one-night charge.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable use">
          <p>When using our website and premises you agree not to:</p>
          <ul>
            <li>Provide false or misleading information in bookings.</li>
            <li>Use the website to transmit spam or harmful content.</li>
            <li>Attempt to gain unauthorised access to any part of our systems.</li>
            <li>Reproduce or resell any content from this website without our written permission.</li>
          </ul>
        </Section>

        <Section title="5. Intellectual property">
          <p>
            All content on this website — including text, photographs, logos, and guide articles — is owned by or licensed to Denz. You may share links to our content but may not copy, reproduce, or republish it without prior written consent.
          </p>
        </Section>

        <Section title="6. Limitation of liability">
          <p>
            To the fullest extent permitted by Thai law, Denz is not liable for any indirect, incidental, or consequential damages arising from your use of our website or services. Our total liability to you for any claim shall not exceed the amount you paid for the specific service in question.
          </p>
          <p>
            We make reasonable efforts to keep our website accurate and available but do not guarantee it will be error-free or uninterrupted.
          </p>
        </Section>

        <Section title="7. Governing law">
          <p>
            These Terms are governed by the laws of the Kingdom of Thailand. Any disputes shall be resolved in the courts of Phuket Province, Thailand.
          </p>
        </Section>

        <Section title="8. Changes to these terms">
          <p>
            We may update these Terms from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or visit our{' '}
            <Link href="/contact">Contact page</Link>.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-ink-faint/20 flex gap-6 text-sm text-ink-muted">
          <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy →</Link>
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
