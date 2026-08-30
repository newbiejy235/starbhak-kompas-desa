"use client";

import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";

import Navbar from "@/components/landingpage/Navbar";
import DotPattern from "@/components/ui/DotPattern";
import { DotAnimation } from "@/components/ui/DotAnimation";
import PageLoader from "@/components/landingpage/PageLoader";
import BentoGridStats from "@/components/landingpage/berandaCard/cardBeranda";
import ChatWidget from "@/components/shared/chatbot/ChatWidget";
import ScrollReveal from "@/components/animation/ScrollReveal";
import ScrollToTop from "@/components/landingpage/backtotop/BacktoTop";

const InvitationSection = dynamic(
  () => import("@/components/landingpage/ajakanBergabung/page"),
  { ssr: false }
);

const PartnerSection = dynamic(
  () => import("@/components/landingpage/mitra/Mitra"),
  { ssr: false }
);

const About = dynamic(
  () => import("@/components/landingpage/about/About").then(
    (mod) => mod.About
  ),
  { ssr: false }
);

const AlurWebsite = dynamic(
  () => import("@/components/landingpage/about/WebsiteFlow").then(
    (mod) => mod.AlurWebsite
  ),
  { ssr: false }
);

const KomoditasMarquee = dynamic(
  () =>
    import("@/components/landingpage/about/komoditasList").then(
      (mod) => mod.KomoditasMarquee
    ),
  { ssr: false }
);

const CardBenefit = dynamic(
  () => import("@/components/landingpage/cardBenefit/card"),
  { ssr: false }
);

const CardMembership = dynamic(
  () =>
    import("@/components/landingpage/cardEndorse/membership").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

const Testimonial = dynamic(
  () => import("@/components/landingpage/testimonial/testi"),
  { ssr: false }
);

const Footer = dynamic(
  () => import("@/components/landingpage/Footer"),
  { ssr: false }
);

const Keamanan = dynamic(
  () =>
    import("@/components/landingpage/keamanan/KeamananSection").then(
      (mod) => mod.KeamananSec
    ),
  { ssr: false }
);

const FiturUtama = dynamic(
  () =>
    import("@/components/landingpage/kebutuhanplatform/KebutuhanPlatform").then(
      (mod) => mod.FiturUtamaSec
    ),
  { ssr: false }
);

const FAQSection = dynamic(
  () =>
    import("@/components/landingpage/faq/Pertanyaanajukan").then(
      (mod) => mod.FAQSection
    ),
  { ssr: false }
);

export default function KompasDesaPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-[999] w-full">
        <Navbar />
      </div>
      <PageLoader>
        <div className="landing-page relative min-h-screen bg-white overflow-x-hidden flex flex-col">
          <DotAnimation />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen overflow-hidden"
          >
            <DotPattern className="opacity-7" />
          </div>
          <main className="relative z-25 grow w-full landing-theme">
            <section id="beranda" className="w-full">
              <ScrollReveal>
                <BentoGridStats />
              </ScrollReveal>
            </section>

            <PartnerSection />

            <section id="tentang" className="bg-white w-full scroll-mt-24">
              <ScrollReveal>
                <About />
              </ScrollReveal>
            </section>

            <section id="alurweb" className="bg-white w-full scroll-mt-24">
              <ScrollReveal>
                <AlurWebsite />
              </ScrollReveal>
            </section>

            <section
              id="komoditaslist"
              className="bg-white w-full scroll-mt-24"
            >
              <ScrollReveal>
                <KomoditasMarquee />
              </ScrollReveal>
            </section>

            <section id="keamanan" className="bg-white w-full scroll-mt-24">
              <ScrollReveal>
                <Keamanan />
              </ScrollReveal>
            </section>

            <section
              id="fiturutama"
              className="bg-white w-full scroll-mt-24"
            >
              <ScrollReveal>
                <FiturUtama />
              </ScrollReveal>
            </section>

            <section id="layanan" className="bg-white w-full scroll-mt-24">
              <ScrollReveal>
                <CardBenefit />
              </ScrollReveal>
            </section>

            <section
              id="membership"
              className="bg-white w-full py-6 sm:py-12 scroll-mt-24"
            >
              <ScrollReveal>
                <CardMembership />
              </ScrollReveal>
            </section>

            <section
              id="testimoni"
              className="bg-white w-full scroll-mt-24"
            >
              <ScrollReveal>
                <Testimonial />
              </ScrollReveal>
            </section>

            <section
              id="faq"
              className="bg-white w-full py-6 sm:py-12 scroll-mt-24"
            >
              <ScrollReveal>
                <FAQSection />
              </ScrollReveal>
            </section>

            <section
              id="ajakan"
              className="bg-white w-full py-10">
              <ScrollReveal>
                <InvitationSection />
              </ScrollReveal>
            </section>
          </main>

          <div id="footer" className="relative z-20 w-full">
            <Footer />
          </div>
        </div>
        <ScrollToTop />
        <ChatWidget />
      </PageLoader>
    </MotionConfig>
  );
}
