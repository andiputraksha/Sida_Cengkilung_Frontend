import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";
const perangkat = [
  {
    nama: "Ngakan Made Tapayasa",
    jabatan: "Bendesa Adat",
    periode: "Periode 2024-2029",
    deskripsi: "Memimpin seluruh kegiatan adat dan keagamaan di Desa Adat Cengkilung",
    // pendidikan: "S2 Magister Manajemen",
  },
  {
    nama: "I Nyoman Suandi",
    jabatan: "Wakil Bendesa Adat",
    periode: "Periode 2024-2029",
    deskripsi: "Membantu Bendesa Adat dalam koordinasi kegiatan adat dan kemasyarakatan",
    // pendidikan: "S1 Pendidikan",
  },
  {
    nama: "I Ketut Murdi Wijaya",
    jabatan: "Sekretaris",
    periode: "Periode 2024-2029",
    deskripsi: "Mengelola administrasi dan kesekretariatan desa adat",
    // pendidikan: "S1 Hukum",
  },
  {
    nama: "I Made Arsana, SE",
    jabatan: "Bendahara",
    periode: "Periode 2024-2029",
    deskripsi: "Mengelola keuangan dan aset desa adat secara transparan",
    // pendidikan: "S1 Ekonomi",
  },
  {
    nama: "Made Sudarsana",
    jabatan: "Kelian Banjar",
    periode: "Periode 2024-2029",
    deskripsi: "Memimpin pelaksanaan kegiatan di tingkat banjar adat",
    // pendidikan: "SMA",
  },
];

const statistikDesa = [
  { label: "Luas Wilayah", value: "24,74 Ha", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Jumlah Penduduk", value: "951 Jiwa", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { label: "Kepala Keluarga", value: "93 KK", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "Banjar Adat", value: "1 Banjar Adat", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

const fasilitasDesa = [
  { nama: "Pura Desa", ikon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { nama: "Pura Dalem", ikon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { nama: "Balai Banjar", ikon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { nama: "Subak", ikon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { nama: "Lapangan", ikon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
  { nama: "Sekolah Dasar", ikon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
];

// Data gambar untuk gallery
const galleryImages = [
  {
    id: 1,
    src: `${BACKEND_BASE_URL}/uploads/sejarah/pura-dalem-cengkilung4.jpg`,
    fallback: "https://images.unsplash.com/photo-1518005068252-37900150df3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Pura Dalem Cengkilung",
    title: "Pura Dalem Cengkilung",
    description: "Pusat kegiatan adat dan keagamaan Desa Adat Cengkilung",
    location: "Pura Dalem, Banjar Cengkilung",
    year: "2025",
    size: "large"
  },
  {
    id: 2,
    src: `${BACKEND_BASE_URL}/uploads/galeri/tari-jauk-topeng-natar-calung.jpg`,
    fallback: "https://images.unsplash.com/photo-1555938642-64d7c9718c6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Tari Jauk - Pentas Seni Bebali",
    title: "Tari Jauk",
    description: "Pentas Seni Bebali Sekaa Topeng Natar Calung",
    location: "Pura Dalem, Cengkilung",
    year: "2025",
    size: "small"
  },
  {
    id: 3,
    src: `${BACKEND_BASE_URL}/uploads/profil/banjar-cengkilung.jpg`,
    fallback: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Banjar Cengkilung",
    title: "Banjar Cengkilung",
    description: "Suasana di lingkungan Banjar Cengkilung",
    location: "Banjar Cengkilung, Denpasar Utara",
    year: "2025",
    size: "small"
  },
  {
    id: 4,
    src: `${BACKEND_BASE_URL}/uploads/galeri/tirtayatra-batur-besakih-2025.jpg`,
    fallback: "https://images.unsplash.com/photo-1537996192471-5a26b3b0a6a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Tirtayatra Pura Besakih",
    title: "Tirtayatra Pura Besakih",
    description: "Kegiatan Tirtayatra ke Pura Besakih tahun 2025",
    location: "Pura Besakih, Karangasem",
    year: "2025",
    size: "large"
  }
];

export default function ProfilDesa() {
  const [isVisible, setIsVisible] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-observe]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handlePrevImage = () => {
    if (selectedImage) {
      const currentIndex = galleryImages.findIndex(img => img.id === selectedImage.id);
      const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      setSelectedImage(galleryImages[prevIndex]);
    }
  };

  const handleNextImage = () => {
    if (selectedImage) {
      const currentIndex = galleryImages.findIndex(img => img.id === selectedImage.id);
      const nextIndex = (currentIndex + 1) % galleryImages.length;
      setSelectedImage(galleryImages[nextIndex]);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* ================= HERO SECTION ================= */}
      {/* ================= HERO SECTION ================= */}
      <div className="relative text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {/* Overlay gradien elegan - warna netral/earth tone */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/85 via-stone-800/80 to-zinc-900/90 z-10"></div>
          
          {/* Gambar Background */}
          <img
            src={buildAssetUrl("uploads/profil/banjar-cengkilung.jpg")}
            alt="Banjar Cengkilung"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: 'center 30%'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Background Pattern - lebih subtle */}
        <div className="absolute inset-0 opacity-5 z-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50h30v30H50zM20 50h30v30H20zM0 30h30v30H0zM30 0h30v30H30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }} 
          />
        </div>

        {/* Soft Light Effect */}
        <div className="absolute inset-0 z-20">
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Animated Circles - warna earth tone yang subtle */}
        <div className="absolute inset-0 overflow-hidden z-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-30 max-w-6xl mx-auto px-4 py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-stone-300/70 mb-6">
            <Link to="/" className="hover:text-amber-300 transition-colors">Beranda</Link>
            <span className="text-stone-400/40">/</span>
            <span className="text-amber-200 font-medium">Profil Desa</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Profil Desa Adat
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">
              Cengkilung
            </span>
          </h1>

          <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">
            Mengenal lebih dekat desa adat yang kaya akan tradisi, budaya, dan nilai-nilai 
            kearifan lokal yang tetap lestari di tengah modernisasi.
          </p>

          {/* Quick Stats - dengan warna earth tone */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {statistikDesa.slice(0, 4).map((stat, index) => (
              <div key={index} className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-100">{stat.value}</div>
                    <div className="text-xs text-stone-300">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Divider - lebih subtle */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.03"/>
            <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 78.75C840 82.5 960 90 1080 93.75C1200 97.5 1320 97.5 1380 97.5L1440 97.5V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.06"/>
          </svg>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* ===== GAMBARAN UMUM ===== */}
        <section 
          id="gambaran-umum"
          data-observe
          className={`mb-24 transform transition-all duration-1000 ${
            isVisible['gambaran-umum'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Text Content */}
            <div>
              <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Tentang Desa
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Gambaran Umum
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
                  Desa Adat Cengkilung
                </span>
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  Desa Adat Cengkilung merupakan salah satu desa adat yang memiliki
                  nilai sejarah dan budaya yang kuat. Terletak di Jalan Cekomaria II, 
                  Banjar Cengkilung, Peguyangan Kangin, Kecamatan Denpasar Utara, 
                  Kota Denpasar, Bali.
                </p>

                <p>
                  Desa ini menjadi pusat kegiatan adat, keagamaan, dan sosial masyarakat.
                  Dengan lingkungan yang asri serta masyarakat yang menjunjung tinggi
                  nilai gotong royong, Desa Adat Cengkilung terus berkembang
                  mengikuti perkembangan zaman tanpa meninggalkan tradisi leluhur.
                </p>

                <p>
                  Struktur organisasi adat dikelola secara profesional untuk menjaga
                  kelestarian budaya serta kesejahteraan masyarakat. Desa ini memiliki
                  berbagai sekaa (kelompok seni) yang aktif seperti Gong Kebyar, 
                  Angklung, Semarpegulingan, dan Topeng Wali.
                </p>
              </div>

              {/* Quick Facts */}
              {/* <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gradient-to-br from-emerald-50 to-amber-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">1920</div>
                  <div className="text-sm text-gray-600">Tahun Berdiri</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-amber-600">5</div>
                  <div className="text-sm text-gray-600">Banjar Adat</div>
                </div>
              </div> */}
            </div>

            {/* Image Gallery dengan Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-200 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-200 rounded-full opacity-50 blur-2xl"></div>
              
              <div className="relative grid grid-cols-2 gap-4">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  {/* Gambar 1 - Pura Dalem */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative h-48 rounded-2xl shadow-xl overflow-hidden group cursor-pointer"
                    onClick={() => openImageModal(galleryImages[0])}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img 
                      src={galleryImages[0].src}
                      alt={galleryImages[0].alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = galleryImages[0].fallback;
                      }}
                      onLoad={() => handleImageLoad(galleryImages[0].id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <p className="text-white text-sm font-semibold">{galleryImages[0].title}</p>
                      <p className="text-white/80 text-xs">{galleryImages[0].year}</p>
                    </div>
                  </motion.div>

                  {/* Gambar 2 - Tari Jauk */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative h-32 rounded-2xl shadow-xl overflow-hidden group cursor-pointer"
                    onClick={() => openImageModal(galleryImages[1])}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img 
                      src={galleryImages[1].src}
                      alt={galleryImages[1].alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = galleryImages[1].fallback;
                      }}
                      onLoad={() => handleImageLoad(galleryImages[1].id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <p className="text-white text-xs font-semibold">{galleryImages[1].title}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4 mt-8">
                  {/* Gambar 3 - Banjar Cengkilung */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative h-32 rounded-2xl shadow-xl overflow-hidden group cursor-pointer"
                    onClick={() => openImageModal(galleryImages[2])}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img 
                      src={galleryImages[2].src}
                      alt={galleryImages[2].alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = galleryImages[2].fallback;
                      }}
                      onLoad={() => handleImageLoad(galleryImages[2].id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <p className="text-white text-xs font-semibold">{galleryImages[2].title}</p>
                    </div>
                  </motion.div>

                  {/* Gambar 4 - Tirtayatra */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative h-48 rounded-2xl shadow-xl overflow-hidden group cursor-pointer"
                    onClick={() => openImageModal(galleryImages[3])}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img 
                      src={galleryImages[3].src}
                      alt={galleryImages[3].alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = galleryImages[3].fallback;
                      }}
                      onLoad={() => handleImageLoad(galleryImages[3].id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <p className="text-white text-sm font-semibold">{galleryImages[3].title}</p>
                      <p className="text-white/80 text-xs">{galleryImages[3].year}</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VISI MISI ===== */}
        <section 
          id="visi-misi"
          data-observe
          className={`mb-24 transform transition-all duration-1000 delay-200 ${
            isVisible['visi-misi'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-br from-emerald-600 to-amber-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} 
              />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12">
              {/* Visi */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Visi Desa</h3>
                </div>
                <p className="text-white/90 leading-relaxed text-lg">
                  "Terwujudnya Desa Adat Cengkilung yang sejahtera, berbudaya, dan religius 
                  berlandaskan Tri Hita Karana serta mampu beradaptasi dengan perkembangan zaman 
                  tanpa meninggalkan nilai-nilai luhur adat dan tradisi leluhur."
                </p>
              </div>

              {/* Misi */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Misi Desa</h3>
                </div>
                <ul className="space-y-3 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Melestarikan adat, tradisi, dan budaya Bali sebagai warisan leluhur</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Meningkatkan kesejahteraan masyarakat melalui program pemberdayaan ekonomi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Memperkuat nilai-nilai keagamaan dan spiritual melalui kegiatan keagamaan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Mengembangkan potensi desa secara berkelanjutan dan berwawasan lingkungan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PERANGKAT DESA ===== */}
        <section 
          id="perangkat-desa"
          data-observe
          className={`mb-24 transform transition-all duration-1000 delay-400 ${
            isVisible['perangkat-desa'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Struktur Organisasi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perangkat Desa Adat
            </h2>
            <p className="text-lg text-gray-600">
              Struktur kepengurusan Desa Adat Cengkilung periode 2024-2029 yang 
              berkomitmen melayani masyarakat dengan penuh dedikasi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {perangkat.map((item, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Decorative Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white m-[2px] rounded-2xl p-6 text-center">
                  {/* Profile Image */}
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-600 rounded-full animate-pulse opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-1 bg-gradient-to-br from-emerald-600 to-amber-700 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {item.nama.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                    {item.nama}
                  </h3>

                  {/* Position */}
                  <p className="text-sm font-medium text-emerald-600 mb-2">
                    {item.jabatan}
                  </p>

                  {/* Period */}
                  <p className="text-xs text-gray-500 mb-3">
                    {item.periode}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                    {item.deskripsi}
                  </p>

                  {/* Education Badge */}
                  {/* <div className="absolute top-3 right-3">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                      {item.pendidikan}
                    </span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FASILITAS DESA ===== */}
        <section 
          id="fasilitas"
          data-observe
          className={`mb-24 transform transition-all duration-1000 delay-600 ${
            isVisible['fasilitas'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              Sarana & Prasarana
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fasilitas Desa
            </h2>
            <p className="text-lg text-gray-600">
              Berbagai fasilitas yang tersedia untuk mendukung kegiatan adat, 
              sosial, dan kemasyarakatan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fasilitasDesa.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.ikon} />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                  {item.nama}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* ===== PETA DESA ===== */}
        <section 
          id="peta"
          data-observe
          className={`transform transition-all duration-1000 delay-800 ${
            isVisible['peta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2">
              {/* Map Info */}
              <div className="p-8 md:p-12 text-white">
                <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
                  Lokasi Desa
                </span>
                <h2 className="text-3xl font-bold mb-4">
                  Temukan Kami di Peta
                </h2>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Desa Adat Cengkilung terletak di lokasi strategis yang mudah diakses 
                  dari berbagai arah. Silakan kunjungi kami atau gunakan peta untuk petunjuk arah.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">Jl. Cekomaria II, Br. Cengkilung, Peguyangan Kangin, Denpasar Utara</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-sm">0822-3662-4414</span>
                  </div>
                </div>

                <a
                  href="https://maps.app.goo.gl/MJ9pUDrz2apPxsK59"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Buka di Google Maps</span>
                </a>
              </div>

              {/* Map Placeholder */}
              <div className="h-64 md:h-auto bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-500 text-sm">Peta Interaktif</p>
                  <p className="text-gray-600 text-xs mt-2">Klik tombol di samping untuk membuka Google Maps</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA BUTTON ===== */}
        <div className="text-center mt-16">
          <Link
            to="/sejarah"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <span>Pelajari Sejarah Lengkap Desa Cengkilung</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ===== MODAL PREVIEW GAMBAR ===== */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol Close */}
              <button
                onClick={closeImageModal}
                className="absolute -top-12 right-0 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Tombol Navigasi */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Gambar */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = selectedImage.fallback;
                  }}
                />
              </div>

              {/* Info Gambar */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 rounded-b-2xl"
              >
                <h3 className="text-white text-xl font-bold mb-1">{selectedImage.title}</h3>
                <p className="text-white/80 text-sm mb-2">{selectedImage.description}</p>
                <div className="flex items-center gap-4 text-white/60 text-xs">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {selectedImage.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {selectedImage.year}
                  </span>
                </div>
              </motion.div>

              {/* Indikator Halaman */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage.id === img.id 
                        ? 'w-6 bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


