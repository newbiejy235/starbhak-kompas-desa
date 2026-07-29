export default function Testimonial() {
  const testimonials = [
    {
      quote: "Kompas Desa membantu hasil panen kami menjangkau pasar yang lebih luas dengan proses distribusi yang mudah.",
      author: "Kelompok Tani Makmur",
    },
    {
      quote: "Penjualan hasil panen menjadi lebih efisien dan harga yang kami terima lebih menguntungkan.",
      author: "Siti Rahmawati, Petani Cabai",
    },
    {
      quote: "Distribusi lebih teratur, sehingga kami bisa fokus meningkatkan kualitas hasil panen.",
      author: "Akram Abdul, Petani Sayur",
    },
  ];

  return (
    <section className="bg-white min-h-screen py-[60px] px-5 flex flex-col items-center font-sans">
      <div className="max-w-[1140px] w-full mb-12">
        <h2 className="text-[32px] font-bold text-[#111111]">
          Kepercayaan yang <span className="text-[#0B4F3A]">Terbangun</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1140px] w-full items-stretch">
        {testimonials.map((item, index) => (
          <div
            key={index}
            className="bg-[#EFEFEF] rounded-3xl p-8 relative flex flex-col justify-between border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
          >
            <div>
              <div className="text-[#0B4F3A] mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                </svg>
              </div>

              <p className="text-[14px] text-[#222222] leading-relaxed mb-6">
                {item.quote}
              </p>
            </div>

            <div className="text-[13px] font-medium text-[#444444]">
              — {item.author}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}