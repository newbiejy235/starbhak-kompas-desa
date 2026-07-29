'use client' // Tambahkan ini jika menggunakan App Router agar fungsi scroll onClick berjalan

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
    const section = document.getElementById('membership-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageLoader />
      <div className="relative min-h-screen bg-[#025246] overflow-hidden flex flex-col">

        <DotPattern className="opacity-30" />

        <div className="relative z-50">
          <Navbar />
        </div>

<<<<<<< HEAD
        <main className="relative z-20 flex-grow">
          <section className="container mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-20 flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
             
              <FadeAnimation direction="in">
                <div className="flex flex-col">

                  <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide mb-2">
                    Distribusi hasil
                  </h1>
                  <h2 className="text-white text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
                    desa ke pasar
                  </h2>
                  <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-normal tracking-wide">
                    yang lebih luas
                  </h3>

                  <p className="mt-8 text-white text-lg md:text-xl leading-relaxed max-w-xl">
                    Menghubungkan <span className="text-[#EAB308] font-medium">petani</span> dengan berbagai pembeli melalui sistem distribusi yang <span className="text-[#EAB308] font-medium">aman, transparan, dan efisien.</span>
                  </p>
                    <div className="flex flex-wrap items-center gap-3 mb-6 mt-10">
                    <div className="bg-white border border-white/20 px-4 py-1.5 xtext-sm font-medium backdrop-blur-sm">
                      Kolaborasi dengan <span className="text-[#EAB308] font-bold">10 Mitra</span>
                    </div>
                    <div className="bg-white border border-white/20 px-4 py-1.5 xtext-sm font-medium backdrop-blur-sm">
                      Sudah terdaftar <span className="text-[#EAB308] font-bold"><Counter end={200} suffix="+" />supplier</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                <button
                    onClick={scrollToMembership}
                    className="
                    relative
                    px-10 py-3
                    rounded-full
                    text-white text-lg font-semibold
                    bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]
                    shadow-[0_8px_20px_rgba(46,125,50,0.4)]
                    hover:shadow-[0_10px_25px_rgba(46,125,50,0.6)]
                    hover:scale-[1.03]
                    transition-all duration-300"
                >
                  Berlangganan
                </button>
                  </div>
                </div>
              </FadeAnimation>

              <FadeAnimation direction="up">
                <AnimatedCrops />
              </FadeAnimation>

            </div>
          </section>

          <section className="bg-white">
            <ScrollReveal>
              <FadeAnimation direction="up">
                <About />
              </FadeAnimation>
            </ScrollReveal>
          </section>

          <section className="bg-white pb-20">
            <ScrollReveal>
              <FadeAnimation direction="up">
                <CardBenefit />
              </FadeAnimation>
            </ScrollReveal>
          </section>

          <section id="membership-section" className="bg-white pb-20 scroll-mt-24">
            <ScrollReveal>
              <FadeAnimation direction="up">
                <CardMembership />
                <Testimonial />
              </FadeAnimation>
            </ScrollReveal>
          </section>

=======
        <main className="relative z-20 flex-grow container mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-20 flex items-center">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">

            <FadeAnimation direction='in'>
              <div className="flex flex-col">
                <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide mb-2">
                  Distribusi hasil
                </h1>
                <h2 className="text-white text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
                  desa ke pasar
                </h2>
                <h3 className="text-white text-3xl md:text-4xl lg:text-5xl font-normal tracking-wide">
                  yang lebih luas
                </h3>

                <p className="mt-8 text-white text-lg md:text-xl leading-relaxed max-w-xl">
                  Menghubungkan <span className="text-[#EAB308] font-medium">petani</span> dengan berbagai pembeli melalui sistem distribusi yang <span className="text-[#EAB308] font-medium">aman, transparan, dan efisien.</span>
                </p>
              </div>
            </FadeAnimation>

            <AnimatedCrops />

            <ScrollReveal>
              <About></About>
            </ScrollReveal>
          </div>
>>>>>>> 7459593 (Update ./github)
        </main>

        <div className="relative z-20">
          <Footer />
        </div>

      </div>
    </>
  )
}