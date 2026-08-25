'use client'

import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react'

const contacts = [
  {
    icon: Mail,
    label: 'Email',
    value: 'kompasdesa@gmail.com',
  },
  {
    icon: Phone,
    label: 'Telepon',
    value: '+62 888-8888-8888',
  },
  {
    icon: MapPin,
    label: 'Lokasi',
    value: 'Jl. Pekapuran, RT.02/RW.06, Curug, Kec. Cimanggis, Kota Depok, Jawa Barat 16953',
  }
]

export default function ContactSection() {
  return (
    <section className="w-full bg-white px-5 py-20 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#025246]">
            Hubungi Kami
          </span>

          <h2 className="mt-3 text-[30px] font-bold leading-tight tracking-tight text-[#17231F] sm:text-[36px]">
            Ada yang ingin ditanyakan?
          </h2>

          <p className="mx-auto mt-4 max-w-xl font-body text-[15px] leading-7 text-[#71817D]">
            Kami siap membantu Anda mendapatkan informasi mengenai
            Kompas Desa dan layanan yang tersedia.
          </p>
        </div>

        {/* CONTACT */}
        <div className="mt-12 grid grid-cols-1 border-y border-[#E8ECEA] sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact, index) => {
            const Icon = contact.icon

            return (
              <div
                key={contact.label}
                className={`
                  flex items-center gap-4 px-2 py-6
                  sm:px-6
                  lg:py-7
                  ${index !== 0 ? 'border-t border-[#E8ECEA] sm:border-t-0 sm:border-l' : ''}
                  ${index === 2 ? 'lg:border-l' : ''}
                `}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3EF] text-[#025246]">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#91A09C]">
                    {contact.label}
                  </p>

                  <p className="mt-1 truncate font-body text-[13px] font-medium text-[#263832]">
                    {contact.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center text-center">
          <h3 className="text-xl font-bold tracking-tight text-[#17231F] sm:text-2xl">
            Siap bergabung dengan Kompas Desa?
          </h3>

          <p className="mt-2 max-w-lg font-body text-sm leading-6 text-[#71817D]">
            Buat akun Anda dan mulai manfaatkan Kompas Desa
            untuk kebutuhan pertanian dan perdagangan.
          </p>

          <Link
            href="/auth/register"
            className="
              group mt-6 inline-flex items-center gap-2
              rounded-xl bg-[#025246]
              px-6 py-3.5
              font-body text-sm font-semibold text-white
              transition-all duration-300
              hover:-translate-y-0.5
              hover:bg-[#013E35]
              hover:shadow-[0_10px_25px_rgba(2,82,70,0.18)]
              active:translate-y-0
            "
          >
            Daftar Sekarang

            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

      </div>
    </section>
  )
}