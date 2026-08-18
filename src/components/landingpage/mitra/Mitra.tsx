export default function PartnerSection() {
  const partners = [
    "BULOG", "Kementan", "Bapanas", "ID FOOD", "Pupuk Indonesia",
    "John Deere", "Kubota", "Bayer", "Syngenta", "Cap Panah Merah",
    "eFishery", "Agriaku", "Tokopedia", "BRIN", "IPB University",
  ];

  return (
    <section className="w-full bg-white py-10 sm:py-14 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Judul Section */}
        <h3 className="text-center text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#025246]/70 mb-8 sm:mb-10 uppercase">
          Dipercaya & Bermitra Dengan
        </h3>

        {/* Grid Murni Teks dengan Smooth Hover Animation */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 sm:gap-x-12 sm:gap-y-8 max-w-4xl">
          {partners.map((partner, index) => (
            <span
              key={index}
              className="relative inline-block text-slate-400 hover:text-[#025246] font-bold text-base sm:text-lg tracking-wide cursor-default select-none transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:drop-shadow-[0_4px_12px_rgba(2,82,70,0.15)] group"
            >
              {partner}
              {/* Garis Aksen Tipis Saat Hover */}
              <span className="absolute left-1/2 -bottom-1 h-[2px] w-0 bg-[#025246] transition-all duration-300 ease-out -translate-x-1/2 group-hover:w-full opacity-0 group-hover:opacity-100 rounded-full" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}