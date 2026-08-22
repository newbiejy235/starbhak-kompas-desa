'use client'

import dynamic from 'next/dynamic'
import LazyOnScroll from '@/utils/Lazyonscroll'
import { MotionConfig } from 'framer-motion'
import Link from 'next/link'


import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'
import FadeAnimation from '@/components/animation/Animation'
import PageLoader from '@/components/landingpage/PageLoader'
import AnimatedHeading from '@/components/animation/headinglandingpage'
import BentoGridStats from '@/components/landingpage/berandaCard/cardBeranda'
import { DotAnimation } from '@/components/ui/DotAnimation'
import { FiturUtamaSec } from '@/components/landingpage/kebutuhanplatform/KebutuhanPlatform'

const ScrollReveal = dynamic(() => import('@/components/animation/ScrollReveal'), { ssr: false })
const PartnerSection = dynamic(() => import('@/components/landingpage/mitra/Mitra'))
const About = dynamic(() => import('@/components/landingpage/about/About').then(mod => mod.About))
const AlurWebsite = dynamic(() => import('@/components/landingpage/about/WebsiteFlow').then(mod => mod.AlurWebsite))
const KomoditasMarquee = dynamic(() => import('@/components/landingpage/about/komoditasList').then(mod => mod.KomoditasMarquee), { ssr: false })
const CardBenefit = dynamic(() => import('@/components/landingpage/cardBenefit/card'))
const CardMembership = dynamic(() => import('@/components/landingpage/cardEndorse/membership'))
const Testimonial = dynamic(() => import('@/components/landingpage/testimonial/testi'))
const Footer = dynamic(() => import('@/components/landingpage/Footer'))
const Keamanan = dynamic(() => import('@/components/landingpage/keamanan/KeamananSection').then(mod => mod.KeamananSec))
const ChatWidget = dynamic(() => import('@/components/shared/chatbot/ChatWidget'), { ssr: false })

export default function KompasDesaPage() {
  return (
    // Semua animasi framer menghormati preferensi reduced motion (PRD 9.1)
    <MotionConfig reducedMotion="user">
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
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-2 bg-[#025246] hover:bg-[#013e35] px-5 py-2.5 text-white font-bold text-sm rounded-xl transition-all duration-200 ease-smooth shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer group"
                      >
                        <span>Daftar</span>
                      </Link>

                      <a
                        href="#komoditaslist"
                        className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50/60 text-[#025246] font-semibold text-sm px-5 py-2.5 rounded-xl border border-black/10 transition-all duration-200 ease-smooth shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                      >
                        <span>Cari Komoditas</span>
                      </a>
                    </div>

                    <BentoGridStats />
                  </div>
                </FadeAnimation>
              </div>
            </section>

            {/* SECTION BAWAH (LAZY LOAD ON SCROLL) */}
            <LazyOnScroll minHeight="150px">
              <PartnerSection />
            </LazyOnScroll>

            <section id="tentang" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="400px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <About />
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="alurweb" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="400px">
                <ScrollReveal>
                  <AlurWebsite />
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="komoditaslist" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="250px">
                <ScrollReveal>
                  <KomoditasMarquee />
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="keamanan" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="250px">
                <ScrollReveal>
                  <Keamanan />
                </ScrollReveal>
              </LazyOnScroll>
            </section>


            <section id="fiturutama" className="bg-white w-full scroll-mt-24">
              <LazyOnScroll minHeight="250px">
                <ScrollReveal>
                  <FiturUtamaSec />
                </ScrollReveal>
              </LazyOnScroll>
            </section>



            <section id="layanan" className="bg-white w-full py-6 sm:py-10 scroll-mt-24">
              <LazyOnScroll minHeight="500px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <CardBenefit />
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>

            <section id="testimoni" className="bg-white w-full py-6 sm:py-12 scroll-mt-24">
              <LazyOnScroll minHeight="500px">
                <ScrollReveal>
                  <FadeAnimation direction="up">
                    <div id="membership-section" className="flex flex-col gap-8 sm:gap-12">
                      <CardMembership />
                      <Testimonial />
                    </div>
                  </FadeAnimation>
                </ScrollReveal>
              </LazyOnScroll>
            </section>

          </main>

          <div id="kontak" className="relative z-20 w-full">
            <LazyOnScroll minHeight="300px">
              <Footer />
            </LazyOnScroll>
          </div>
        </div>

        <ChatWidget />
      </PageLoader>
    </MotionConfig>
  )
}