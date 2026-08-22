"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const go = useCallback(
    (i: number) => setActive(((i % testimonials.length) + testimonials.length) % testimonials.length),
    [testimonials.length]
  );

  useEffect(() => {
    // Hormati prefers-reduced-motion: tanpa auto-slide (PRD 9.1)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!paused.current) go(active + 1);
    }, 4500);
    return () => clearInterval(id);
  }, [active, go]);

  return (
    <section className="bg-white w-full py-10 lg:py-16 px-4 sm:px-6 flex flex-col items-center font-sans">
      <div className="max-w-[1140px] w-full mb-8 lg:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#111111] text-center lg:text-left">
          Kepercayaan yang <span className="text-[#025246]">Terbangun</span>
        </h2>
      </div>

      {/* Carousel auto-slide pelan; geser via transform saja (PRD 8.1 & 9.1) */}
      <div
        className="relative max-w-[1140px] w-full overflow-hidden"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <div
          className="flex transition-transform duration-700 ease-smooth"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {testimonials.map((item, index) => (
            <figure
              key={index}
              className="w-full shrink-0 px-1 sm:px-2"
              aria-hidden={index !== active}
            >
              <div className="bg-[#EFEFEF] rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative flex flex-col justify-between border border-gray-100 shadow-sm min-h-[220px] sm:min-h-[240px]">
                <div>
                  <div className="text-[#025246] mb-4">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.999v10h-9.999z" />
                    </svg>
                  </div>

                  <blockquote className="text-sm sm:text-base lg:text-lg text-[#222222] leading-relaxed mb-6">
                    “{item.quote}”
                  </blockquote>
                </div>

                <figcaption className="text-xs sm:text-sm font-medium text-[#444444]">
                  — {item.author}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>

        {/* Kontrol navigasi */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => go(active - 1)}
            aria-label="Testimoni sebelumnya"
            className="w-9 h-9 rounded-full border border-gray-200 bg-white text-neutral-500 hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all duration-150 active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.25 19.5L7.5 12l7.75-7.5" />
            </svg>
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Ke testimoni ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ease-smooth ${
                  i === active ? "w-6 bg-primary" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(active + 1)}
            aria-label="Testimoni berikutnya"
            className="w-9 h-9 rounded-full border border-gray-200 bg-white text-neutral-500 hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all duration-150 active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.75 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
