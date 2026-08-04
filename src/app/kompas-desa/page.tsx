'use client'

import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'
import Footer from '@/components/landingpage/Footer'
import FadeAnimation from '@/components/animation/Animation'
import AnimatedCrops from '@/components/animation/AnimatedCrop'
import ScrollReveal from '@/components/animation/ScrollReveal'
import About from '@/components/landingpage/about/About'
import PageLoader from '@/components/landingpage/PageLoader'
import CardBenefit from '@/components/landingpage/cardBenefit/card'
import CardMembership from '@/components/landingpage/cardMembership/membership'
import Counter from '@/components/animation/Counter'
import Testimonial from '@/components/landingpage/testimonial/testi'

export default function KompasDesaPage() {
  const scrollToMembership = () => {
    const section = document.getElementById('membership-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Mengembalikan nilai untuk export 

  return (
    <>
      <PageLoader />
      <div className="relative min-h-screen bg-[#025246] overflow-x-hidden flex flex-col">
        <DotPattern className="opacity-30" />

        <div className="relative z-50 w-full">
          <Navbar />
        </div>

        <main className="relative z-20 flex-grow w-full">
          <section className="w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-center">
              <FadeAnimation direction="in">
                <div className="flex flex-col text-center lg:text-left items-center lg:items-start">
                  <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide mb-1 sm:mb-2">
                    Distribusi hasil
                  </h1>
                  <h2 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-3 sm:mb-4">
                    desa ke pasar
                  </h2>
                  <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-wide">
                    yang lebih luas
                  </h3>

                  <p className="mt-6 sm:mt-8 text-white text-base sm:text-lg md:text-xl leading-relaxed max-w-xl">
                    Menghubungkan <span className="text-[#EAB308] font-medium">petani</span> dengan berbagai pembeli melalui sistem distribusi yang <span className="text-[#EAB308] font-medium">aman, transparan, dan efisien.</span>
                  </p>

                  <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-3 mb-6 mt-8 sm:mt-10">
                    <div className="bg-white/90 border border-white/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium backdrop-blur-sm rounded-md shadow-sm">
                      Kolaborasi dengan <span className="text-[#EAB308] font-bold">10 Mitra</span>
                    </div>
                    <div className="bg-white/90 border border-white/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium backdrop-blur-sm rounded-md shadow-sm">
                      Sudah terdaftar <span className="text-[#EAB308] font-bold"><Counter end={200} suffix="+" />supplier</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center lg:justify-start w-full">
                    <button
                      onClick={scrollToMembership}
                      className="w-full sm:w-auto relative px-8 sm:px-10 py-3 rounded-full text-white text-base sm:text-lg font-semibold bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] shadow-[0_8px_20px_rgba(46,125,50,0.4)] hover:shadow-[0_10px_25px_rgba(46,125,50,0.6)] hover:scale-[1.03] transition-all duration-300 text-center"
                    >
                      Berlangganan
                    </button>
                  </div>
                </div>
              </FadeAnimation>

              <FadeAnimation direction="up">
                <div className="w-full max-w-md mx-auto lg:max-w-none flex justify-center mt-6 lg:mt-0">
                  <AnimatedCrops />
                </div>
              </FadeAnimation>
            </div>
          </section>

          <section className="bg-white w-full">
            <ScrollReveal>
              <FadeAnimation direction="up">
                <About />
              </FadeAnimation>
            </ScrollReveal>
          </section>

          <section className="bg-white w-full pb-12 sm:pb-20">
            <ScrollReveal>
              <FadeAnimation direction="up">
                <CardBenefit />
              </FadeAnimation>
            </ScrollReveal>
          </section>

          <section id="membership-section" className="bg-white w-full pb-12 sm:pb-20 scroll-mt-24">
            <ScrollReveal>
              <FadeAnimation direction="up">
                <div className="flex flex-col gap-12 sm:gap-16">
                  <CardMembership />
                  <Testimonial />
                </div>
              </FadeAnimation>
            </ScrollReveal>
          </section>
        </main>

        <div className="relative z-20 w-full">
          <Footer />
        </div>
      </div>
    </>
  )
}