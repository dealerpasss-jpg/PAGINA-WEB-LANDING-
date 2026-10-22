import ScrollExperience from "@/components/ScrollExperience";
import Hero from "@/components/Hero";
import {
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
      <ScrollExperience />
      <AcademyPreview />
      <MarginMethod compact />
      <InventoryPreview />
      <Testimonials />
      <FAQ compact />
      <PrivateCTA />
    </>
  );
}
