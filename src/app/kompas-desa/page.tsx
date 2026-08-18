'use client'

import Image from 'next/image'

import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'
import Footer from '@/components/landingpage/Footer'
import FadeAnimation from '@/components/animation/Animation'
import AnimatedCrops from '@/components/animation/AnimatedCrop'
import ScrollReveal from '@/components/animation/ScrollReveal'
import About from '@/components/landingpage/about/About'
import PageLoader from '@/components/landingpage/PageLoader'
import CardBenefit from '@/components/landingpage/cardBenefit/card'
import CardMembership from '@/components/landingpage/cardEndorse/membership'
import Counter from '@/components/animation/Counter'
import Testimonial from '@/components/landingpage/testimonial/testi'
import PlatformFeatures from '@/components/landingpage/FeatureSection/FeatureCard'
import AnimatedHeading from '@/components/animation/headinglandingpage'
import BentoGridStats from '@/components/landingpage/berandaCard/cardBeranda'
import PartnerSection from '@/components/landingpage/mitra/Mitra'

export default function KompasDesaPage() {
  const scrollToMembership = () => {
    const section = document.getElementById('membership-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className="relative z-999 w-full">
        <Navbar />
      </div>

      <PageLoader>
        <div className="relative min-h-screen bg-white overflow-x-hidden flex flex-col">
          <DotPattern className="opacity-30" />

          <main className="relative z-25 grow w-full landing-theme">
            <section
              id="beranda"
              className="relative w-full min-h-[80vh] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 flex items-center justify-center scroll-mt-24"
            >
              <div className="w-full max-w-4xl flex justify-center">
                <FadeAnimation direction="in">
                  <div className="flex flex-col items-center text-center">

                    {/* Badge Header */}
                    <div className="bg-[#E4F1EB] text-[#025246] px-4 py-1.5 rounded-full text-sm font-semibold mb-4 inline-flex items-center gap-1.5 shadow-sm">
                      <span>#DariDesaUntukNegeri</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-[#1f1f1f] text-3xl sm:text-4xl md:text-4xl tracking-tight font-bold leading-tight max-w-3xl">
                      <AnimatedHeading text='Membuka Akses Hasil Panen ke Pasar yang Lebih Luas' />

                    </h1>

                    {/* Subtitle */}
                    <p className="mt-1 text-[#75938f] text-sm sm:text-2xs leading-relaxed max-w-2xl">
                      Temukan hasil panen segar langsung dari petani, atau perluas jangkauan
                      penjualan ke lebih banyak pembeli melalui satu platform.
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      {/* 1. Tombol Daftar */}
                      <button className="inline-flex items-center gap-2 bg-[#025246] hover:bg-[#013e35] px-5 py-2.5 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group">
                        {/* Icon User Plus - Lucide */}
                        <svg className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" x2="19" y1="8" y2="14" />
                          <line x1="22" x2="16" y1="11" y2="11" />
                        </svg>
                        <span>Daftar</span>
                      </button>

                      {/* 2. Tombol Cari Komoditas */}
                      <button className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50/60 text-[#025246] font-semibold text-sm px-5 py-2.5 rounded-xl border border-black/10 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                        {/* Icon Search (Magnifying Glass) */}
                        <svg className="w-4 h-4 text-[#025246]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <span>Cari Komoditas</span>
                      </button>
                    </div>

                    <BentoGridStats />
                  </div>
                </FadeAnimation>
              </div>
            </section>
            <PartnerSection />

            <section id="tentang" className="bg-white w-full  scroll-mt-24">
              <ScrollReveal>
                <FadeAnimation direction="up">
                  <About />
                </FadeAnimation>
              </ScrollReveal>
            </section>

            <section id="layanan" className="bg-white w-full py-6 sm:py-10 scroll-mt-24">
              <ScrollReveal>
                <FadeAnimation direction="up">
                  <CardBenefit />
                </FadeAnimation>
              </ScrollReveal>
            </section>

            <section id="testimoni" className="bg-white w-full py-6 sm:py-12 scroll-mt-24">
              <ScrollReveal>
                <FadeAnimation direction="up">
                  <div id="membership-section" className="flex flex-col gap-8 sm:gap-12">
                    <CardMembership />
                    <Testimonial />
                  </div>
                </FadeAnimation>
              </ScrollReveal>
            </section>

          </main>

          <div id="kontak" className="relative z-20 w-full">
            <Footer />
          </div>
        </div>
      </PageLoader>
    </>
  )
}