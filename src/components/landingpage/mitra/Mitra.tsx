import { partners_Mitra } from "@/app/constants/Kemitraan";

export default function PartnerSection() {
  return (
    <section className="w-full bg-white py-14 sm:py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-12 sm:mb-16">
          <div className="h-[1px] w-8 sm:w-16 bg-zinc-200" />
          <h3 className="text-center text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
            Dipercaya & Bermitra Dengan
          </h3>
          <div className="h-[1px] w-8 sm:w-16 bg-zinc-200" />
        </div>

        {/* Layout Rata Tengah per Kategori */}
        <div className="w-full space-y-10 sm:space-y-14">
          {partners_Mitra.map((group, index) => (
            <div key={index} className="flex flex-col items-center">

              {/* Kategori dengan Subtilitas Warna */}
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1 w-1 rounded-full bg-[#025246]/40" />
                <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 tracking-[0.2em] uppercase">
                  {group.category}
                </span>
                <span className="h-1 w-1 rounded-full bg-[#025246]/40" />
              </div>

              {/* Grid Teks Mitra */}
              <div className="group flex flex-wrap justify-center items-center gap-x-8 gap-y-3 sm:gap-x-12 sm:gap-y-4 max-w-4xl">
                {group.items.map((partner, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="relative text-zinc-500 font-semibold text-base sm:text-xl tracking-tight cursor-default select-none transition-all duration-300 ease-out hover:!text-[#025246] group-hover:opacity-35 hover:!opacity-100"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}