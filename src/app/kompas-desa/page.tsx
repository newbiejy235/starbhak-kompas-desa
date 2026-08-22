'use client'

import dynamic from 'next/dynamic'
import LazyOnScroll from '@/utils/Lazyonscroll'


import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'
import { DotAnimation } from '@/components/ui/DotAnimation'
import FadeAnimation from '@/components/animation/Animation'
import PageLoader from '@/components/landingpage/PageLoader'
import AnimatedHeading from '@/components/animation/headinglandingpage'
import BentoGridStats from '@/components/landingpage/berandaCard/cardBeranda'

const ScrollReveal = dynamic(() => import('@/components/animation/ScrollReveal'), { ssr: false })
const PartnerSection = dynamic(() => import('@/components/landingpage/mitra/Mitra'))
const About = dynamic(() => import('@/components/landingpage/about/About').then(mod => mod.About))
const AlurWebsite = dynamic(() => import('@/components/landingpage/about/WebsiteFlow').then(mod => mod.AlurWebsite))
const KomoditasMarquee = dynamic(() => import('@/components/landingpage/about/komoditasList').then(mod => mod.KomoditasMarquee), { ssr: false })
const CardBenefit = dynamic(() => import('@/components/landingpage/cardBenefit/card'))
const CardMembership = dynamic(() => import('@/components/landingpage/cardEndorse/membership').then(mod => mod.default))
const Testimonial = dynamic(() => import('@/components/landingpage/testimonial/testi'))
const Footer = dynamic(() => import('@/components/landingpage/Footer'))
const Keamanan = dynamic(() => import('@/components/landingpage/keamanan/KeamananSection').then(mod => mod.KeamananSec))
const FiturUtama = dynamic(() => import('@/components/landingpage/kebutuhanplatform/KebutuhanPlatform').then(mod => mod.FiturUtamaSec))
const FAQSection = dynamic(() => import('@/components/landingpage/faq/Pertanyaanajukan').then(mod => mod.FAQSection))

export default function KompasDesaPage() {
  return (
    <>
      <div className="relative z-999 w-full">
        <Navbar />
      </div>

      <PageLoader>
        <div className="relative min-h-screen bg-white overflow-x-hidden flex flex-col">
          <DotAnimation />
          <DotPattern className="opacity-30" />

          <main className="relative z-25 grow w-full landing-theme">
            {/* SECTION 1: BERANDA (Dimuat Langsung) */}
            <section
              id="beranda"
              className="relative w-full min-h-[80vh] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 flex items-center justify-center scroll-mt-24"
            >
              <div className="w-full max-w-4xl flex justify-center">
                <FadeAnimation direction="in">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-[#E4F1EB] text-[#025246] px-4 py-1.5 text-sm font-semibold mb-4 inline-flex items-center gap-1.5 shadow-sm">
                      <span>#DariDesaUntukNegeri</span>
                    </div>

                    <h1 className="text-[#1f1f1f] text-3xl sm:text-4xl md:text-4xl tracking-tight font-bold leading-tight max-w-3xl">
                      <AnimatedHeading text='Membuka Akses Hasil Panen ke Pasar yang Lebih Luas' />
                    </h1>

                    <p className="mt-1 text-[#75938f] text-sm sm:text-2xs leading-relaxed max-w-2xl">
                      Temukan hasil panen segar langsung dari petani, atau diperluas jangkauan
                      penjualan ke lebih banyak pembeli melalui satu platform.
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <button className="inline-flex items-center gap-2 bg-[#025246] hover:bg-[#013e35] px-5 py-2.5 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group">
                        <span>Daftar</span>
                      </button>

                      <button className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50/60 text-[#025246] font-semibold text-sm px-5 py-2.5 rounded-xl border border-black/10 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                        <span>Cari Komoditas</span>
                      </button>
                    </div>

                    <BentoGridStats />
                  </div>
                </FadeAnimation>
              </div>
            </section>

            {/* SECTION BAWAH (LAZY LOAD ON SCROLL) */}
            <LazyOnScroll minHeight="200px">
              <PartnerSection />
            </LazyOnScroll>

            <section id="tentang" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="850px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <About />
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="alurweb" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="650px">
                <ScrollReveal>
                  <AlurWebsite />
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="komoditaslist" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="700px">
                <ScrollReveal>
                  <KomoditasMarquee />
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="keamanan" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="550px">
                <ScrollReveal>
                  <Keamanan />
                </ScrollReveal>
              </LazyOnScroll>
            </section>


            <section id="fiturutama" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="650px">
                <ScrollReveal>
                  <FiturUtama />
                </ScrollReveal>
              </LazyOnScroll>
            </section>



            <section id="layanan" className="bg-white w-full py-6 sm:py-10 scroll-mt-24">
              <LazyOnScroll minHeight="850px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <CardBenefit />
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="membership" className="bg-white w-full py-6 sm:py-12 scroll-mt-24">
              <LazyOnScroll minHeight="900px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <div id="membership-section" className="flex flex-col gap-8 sm:gap-12">
                      <CardMembership />
                    </div>
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>


            <section id="faq" className="bg-white w-full py-6 sm:py-12 scroll-mt-24">
              <LazyOnScroll minHeight="900px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <FAQSection />
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="testimonial" className="bg-white w-full scroll-mt-24">
              <Testimonial />
            </section>
          </main>

          <div id="kontak" className="relative z-20 w-full">
            <LazyOnScroll minHeight="450px">
              <Footer />
            </LazyOnScroll>
          </div>
        </div>
      </PageLoader>
    </>
  )
}