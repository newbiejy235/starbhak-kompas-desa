import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'
import Footer from '@/components/landingpage/Footer'

export default function KompasDesaPage() {
  return (
    <div className="relative min-h-screen bg-[#025246] overflow-hidden flex flex-col">

      <DotPattern className="opacity-30" />

      <div className="relative z-20">
        <Navbar />
      </div>

      <main className="flex-1 relative z-10">
        
      </main>

      <div className="relative z-20">
        <Footer />
      </div>

    </div>
  )
}