import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FiturUtama() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('fitur-utama');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const fiturData = [
    {
      title: "Informasi dan Berita Desa",
      description: "Dapatkan informasi terkini seputar kegiatan desa, pengumuman penting, dan berita terbaru dari Desa Adat Cengkilung.",
      icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15",
      color: "from-emerald-500 to-emerald-500",
      link: "/berita"
    },
    {
      title: "Sejarah dan Profil Desa",
      description: "Pelajari sejarah panjang dan kaya akan tradisi Desa Adat Cengkilung, serta mengenal lebih dekat profil desa kami.",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      color: "from-amber-500 to-amber-500",
      link: "/profil-desa"
    },
    {
      title: "Galeri Kegiatan Desa",
      description: "Jelajahi berbagai momen dan kegiatan adat yang telah dilaksanakan melalui koleksi foto dan video kami.",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-green-500 to-emerald-500",
      link: "/galeri"
    },
    {
      title: "Statistik Desa",
      description: "Lihat data dan statistik terkini tentang penduduk, infrastruktur, dan perkembangan Desa Adat Cengkilung.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "from-orange-500 to-red-500",
      link: "/statistik"
    },
    {
      title: "Data Desa",
      description: "Akses berbagai data penting desa termasuk kependudukan, potensi desa, dan dokumen administratif.",
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
      color: "from-amber-500 to-emerald-500",
      link: "/data-desa"
    },
    // {
    //   title: "Layanan Masyarakat",
    //   description: "Dapatkan informasi tentang berbagai layanan masyarakat dan prosedur administrasi di desa kami.",
    //   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    //   color: "from-teal-500 to-emerald-500",
    //   link: "/layanan"
    // }
  ];

  return (
    <section id="fitur-utama" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, gray 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
            Layanan Kami
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">Utama</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Kami menyediakan berbagai fitur untuk memudahkan Anda mengakses informasi Desa Adat Cengkilung secara digital.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fiturData.map((fitur, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${fitur.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
              
              {/* Content */}
              <div className="relative bg-white rounded-2xl p-8 h-full flex flex-col">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${fitur.color} p-4 mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={fitur.icon} />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {fitur.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                  {fitur.description}
                </p>

                {/* Link */}
                <Link
                  to={fitur.link}
                  className={`inline-flex items-center text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${fitur.color} group-hover:gap-2 transition-all duration-300`}
                >
                  <span>Pelajari Lebih Lanjut</span>
                  <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Decorative Number */}
                <div className="absolute top-4 right-4 text-6xl font-black text-gray-100 opacity-50 select-none">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA
        <div className="mt-20 text-center">
          <Link
            to="/layanan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
          >
            <span>Lihat Semua Layanan</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div> */}
      </div>
    </section>
  );
}
