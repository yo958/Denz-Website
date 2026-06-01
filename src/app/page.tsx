import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CoworkingCta } from '@/components/sections/CoworkingCta';
import { ChillSection } from '@/components/sections/ChillSection';
import { DogsSection } from '@/components/sections/DogsSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { MapSection } from '@/components/sections/MapSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CoworkingCta />
      <ChillSection />
      <DogsSection />
      <ReviewsSection />
      <FaqSection />
      <MapSection />
    </>
  );
}
