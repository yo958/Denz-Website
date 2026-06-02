'use client';

import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CoworkingCta } from '@/components/sections/CoworkingCta';
import { ChillSection } from '@/components/sections/ChillSection';
import { DogsSection } from '@/components/sections/DogsSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { MapSection } from '@/components/sections/MapSection';
import { usePageContent } from '@/hooks/usePageContent';

export default function HomePage() {
  const content = usePageContent<Record<string, unknown>>('home');

  const hero  = content.hero  as { headline?: string; subtext?: string; cta1?: string; cta2?: string; locationPill?: string; pills?: string[] } | undefined;
  const about = content.about as { title?: string; body1?: string; body2?: string } | undefined;
  const faq   = content.faq   as { items?: { q: string; a: string }[] } | undefined;

  return (
    <>
      <HeroSection content={hero} />
      <FeaturesSection />
      <AboutSection content={about} />
      <CoworkingCta />
      <ChillSection />
      <DogsSection />
      <ReviewsSection />
      <FaqSection content={faq} />
      <MapSection />
    </>
  );
}
