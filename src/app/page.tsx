import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { PhotoStrip } from '@/components/sections/PhotoStrip';
import { AboutSection } from '@/components/sections/AboutSection';
import { CoworkingCta } from '@/components/sections/CoworkingCta';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { MapSection } from '@/components/sections/MapSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PhotoStrip />
      <AboutSection />
      <CoworkingCta />
      <ReviewsSection />
      <MapSection />
    </>
  );
}
