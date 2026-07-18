import { SEO } from '@/components/SEO';
import { HeroSection } from '@/sections/HeroSection';
import { EthosSection } from '@/sections/EthosSection';
import { FeaturedGridSection } from '@/sections/FeaturedGridSection';
import { MaterialitySection } from '@/sections/MaterialitySection';

export function HomePage() {
  return (
    <main>
      <SEO />
      <HeroSection />
      <EthosSection />
      <FeaturedGridSection />
      <MaterialitySection />
    </main>
  );
}
