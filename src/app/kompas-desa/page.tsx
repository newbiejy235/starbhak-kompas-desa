import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'
import Footer from '@/components/landingpage/Footer'
import FadeAnimation from '@/components/animation/Animation'
import AnimatedCrops from '@/components/animation/AnimatedCrop'
import ScrollReveal from '@/components/animation/ScrollReveal'
import About from '@/components/landingpage/about/About'
import PageLoader from '@/components/landingpage/PageLoader'

export default function KompasDesaPage() {
  return (
    <>
    <PageLoader/>
    <div className="relative min-h-screen bg-[#025246] overflow-hidden flex flex-col">

      <DotPattern className="opacity-30" />

      <div className="relative z-50">
        <Navbar />
      </div>

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

          <AnimatedCrops />

          <ScrollReveal>
            <About></About>
          </ScrollReveal>
          </FadeAnimation>
        </div>
      </main>

      <div className="relative z-20">
        <Footer />
      </div>

    </div>
    </>
  )
}