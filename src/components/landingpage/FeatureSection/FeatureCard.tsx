import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 

const PlatformFeatures = () => {
  const features = [
    {
      title: "Jual Beli Hasil Panen",
      description: "Memudahkan petani menjual hasil panen dan pembeli mendapatkan produk berkualitas.",
      image: "/images/" 
    },
    {
      title: "Pemesanan dan Pengiriman",
      description: "Memungkinkan pembeli dan petani melakukan pemesanan dan memantau proses pengiriman hasil panen.",
      image: "/images/" 
    },
    {
      title: "Bangun Relasi Bisnis",
      description: "Jalin kerja sama dengan pembeli untuk membuka peluang penjualan yang berkelanjutan.",
      image: "/images/"
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 py-16 font-sans bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 md:gap-10">
        <h2 className="text-3xl md:text-[32px] font-bold text-gray-800 leading-tight">
          Semua Kebutuhan dalam <br />
          <span className="text-[#0a5c36]">Satu Platform</span>
        </h2>
        <p className="text-gray-500 text-[15px] md:text-right max-w-lg leading-[1.6]">
          Kami menghadirkan berbagai solusi untuk membantu petani mendistribusikan hasil panen secara lebih mudah, cepat, dan tepat sasaran.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg bg-white"
          >
            <div className="w-full h-[180px] relative rounded-lg mb-5 overflow-hidden bg-slate-100">
              <Image 
                src={feature.image} 
                alt={feature.title} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            
            <h3 className="text-[#0a5c36] text-[18px] font-bold mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-500 text-[14px] leading-[1.6]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="#">
          <button 
            className="text-[#0a5c36] font-bold text-[16px] hover:underline hover:opacity-80 transition-all flex items-center justify-center gap-1 mx-auto"
          >
            Read More <span className="text-xl leading-none">↗</span>
          </button>
        </Link>
      </div>
    </section>
  );
};

export default PlatformFeatures;