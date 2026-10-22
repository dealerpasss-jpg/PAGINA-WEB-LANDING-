import Hero from "@/components/Hero";
import {
  Experience,
  AcademyPreview,
  InventoryPreview,
  PrivateCTA,
} from "@/components/BrandSections";
import MarginMethod from "@/components/MarginMethod";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
export default function HomePage() {
  return (
    <>
      <Hero />
      <Experience />
      <AcademyPreview />
      <MarginMethod compact />
      <InventoryPreview />
      <Testimonials />
      <FAQ compact />
      <PrivateCTA />
    </>
  );
}
