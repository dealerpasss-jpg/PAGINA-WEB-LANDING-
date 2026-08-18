import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import SocialProofMarquee from "@/components/SocialProofMarquee";
import BenefitCards from "@/components/BenefitCards";
import HowItWorks from "@/components/HowItWorks";
import MarginMethod from "@/components/MarginMethod";
import CalculatorPreview from "@/components/CalculatorPreview";
import AcademySection from "@/components/AcademySection";
import PricingCards from "@/components/PricingCards";
import ComparisonTable from "@/components/ComparisonTable";
import FounderAuthority from "@/components/FounderAuthority";
import CaseStudies from "@/components/CaseStudies";
import AudienceFit from "@/components/AudienceFit";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Reveal><TrustBar /></Reveal>
      <Reveal><SocialProofMarquee /></Reveal>
      <Reveal><BenefitCards /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><MarginMethod /></Reveal>
      <Reveal><CalculatorPreview /></Reveal>
      <Reveal><AcademySection /></Reveal>
      <Reveal><PricingCards /></Reveal>
      <Reveal><ComparisonTable /></Reveal>
      <Reveal><FounderAuthority /></Reveal>
      <Reveal><CaseStudies /></Reveal>
      <Reveal><AudienceFit /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><FAQ /></Reveal>
      <FinalCTA />
    </>
  );
}
