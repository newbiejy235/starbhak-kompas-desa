import Navbar from '@/components/landingpage/Navbar'
import DotPattern from '@/components/ui/DotPattern'

export default function KompasDesaPage() {
  return (
    <div className="relative min-h-screen bg-[#025246] overflow-hidden">

      <DotPattern className="opacity-30" />

      <div className="relative z-20">
        <Navbar />
      </div>


    </div>
  )
}