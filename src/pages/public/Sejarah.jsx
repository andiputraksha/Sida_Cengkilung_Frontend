import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";

export default function Sejarah() {
  const [sejarahData, setSejarahData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sejarah");
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    fetchSejarahData();
  }, []);

  // Intersection Observer untuk animasi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll("[data-observe]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading]);

  const fetchSejarahData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/sejarah-desa`);
      console.log("Response sejarah:", res.data);
      
      if (res.data?.success && res.data?.data) {
        setSejarahData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching sejarah:", error);
    } finally {
      setLoading(false);
    }
  };

  // Data sejarah lengkap dari database
  const sejarahContent = {
    umum: {
      title: "Perjalanan Sejarah Desa Adat Cengkilung",
      content: [
        "Desa Adat Cengkilung memiliki sejarah panjang yang mencerminkan dinamika politik, sosial, dan budaya Bali dari masa lampau hingga kini. Keberadaannya tidak terlepas dari konflik bersejarah antara Desa Bun dengan Kerajaan Mengwi pada abad ke-18, yang kemudian membentuk identitas dan karakter masyarakat Cengkilung seperti yang kita kenal sekarang.",
        "Dari perpindahan penduduk akibat peperangan, terbentuklah komunitas baru yang tidak hanya sekadar mencari tempat tinggal, tetapi juga membawa serta nilai-nilai budaya, tradisi, dan sistem sosial yang terus dilestarikan. Desa Cengkilung kemudian berkembang menjadi sebuah komunitas yang unik dengan ciri khas budaya yang berbeda dari desa-desa lainnya di Bali.",
        "Perjalanan sejarah Desa Cengkilung adalah cerita tentang ketahanan budaya, adaptasi terhadap perubahan zaman, dan upaya pelestarian identitas di tengah arus modernisasi. Dari konflik masa lalu muncul komunitas yang kuat, dari tradisi turun-temurun lahir keunikan budaya, dan dari tantangan modernisasi muncul strategi adaptasi yang bijaksana."
      ]
    },
    asalUsul: {
      title: "Asal Usul Nama \"Cengkilung\"",
      latarBelakang: "Desa Adat Cengkilung lahir dari konflik bersejarah antara Desa Bun dengan Kerajaan Mengwi pada abad ke-18. Setelah laskar Desa Bun berhasil mengalahkan pasukan Mengwi yang dipimpin Cokorda Mahyun, serangan balasan dari Kerajaan Mengwi berhasil menghancurkan Desa Bun. Penduduk Desa Sibang kemudian berpindah ke arah barat daya, membentuk pemukiman baru yang kini dikenal sebagai Banjar Cengkilung.",
      versi: [
        { 
          nama: "Versi Calung-Calung", 
          deskripsi: "Berasal dari kondisi geografis wilayah yang banyak calung-calung (lekukan tanah).",
          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        },
        { 
          nama: "Versi Kilung-Kilang", 
          deskripsi: "Berasal dari Sungai Ayung yang memiliki banyak kilung-kilang (liku-liku).",
          icon: "M13 7l5 5m0 0l-5 5m5-5H6"
        },
        { 
          nama: "Versi Cangkeling", 
          deskripsi: "Berasal dari peristiwa penangkapan (pengikatan) laskar Desa Bun yang kalah.",
          icon: "M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        }
      ]
    },
    keunikan: {
      title: "Keunikan Budaya dan Identitas Desa",
      poin: [
        { 
          judul: "Tradisi Mecaru", 
          deskripsi: "Dilaksanakan setiap Kajeng Kliwon, berbeda dengan praktik umum di Bali yang biasanya pada Sasih kelima dan keenam.",
          icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        },
        { 
          judul: "Pura Mambeng", 
          deskripsi: "Memiliki Pura Mambeng yang jarang ditemukan di tempat lain.",
          icon: "M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z"
        },
        { 
          judul: "Tata Ruang Spiritual", 
          deskripsi: "Letak setra (kuburan) yang berada jauh dari Pura Dalem, bertolak belakang dengan konsep umum tata ruang spiritual Bali.",
          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        },
        { 
          judul: "Warisan Seni", 
          deskripsi: "Memiliki tokoh seniman seperti Made Widja (dalang wayang kulit) dan Made Rania (seniman ukir).",
          icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        }
      ]
    },
    perkembangan: {
      title: "Perkembangan Sosial dan Budaya Masa Kini",
      content: [
        "Dari kehidupan tradisional yang sangat taat pada adat dan tradisi turun-temurun, masyarakat Cengkilung kini mengalami transformasi signifikan di era modern. Generasi muda mulai mempertanyakan relevansi beberapa tradisi, sementara teknologi digital dan globalisasi mengubah pola pikir dan prioritas hidup.",
        "Namun, masyarakat Cengkilung menunjukkan kemampuan adaptasi yang baik dengan menyesuaikan praktik tradisional tanpa menghilangkan esensi spiritualnya, mengintegrasikan teknologi dalam dokumentasi dan edukasi budaya, serta berkolaborasi dengan institusi pendidikan untuk pelestarian warisan budaya.",
        "Perjalanan Desa Cengkilung dari masa pembentukan hingga era modern mencerminkan dinamika budaya yang sehat, di mana tradisi dan modernitas bernegosiasi untuk menciptakan identitas yang kuat namun adaptif."
      ]
    }
  };

  const timelineData = [
    { 
      tahun: "Abad ke-18", 
      peristiwa: "Konflik Desa Bun dengan Kerajaan Mengwi", 
      deskripsi: "Peristiwa ini menjadi cikal bakal terbentuknya Desa Adat Cengkilung",
      icon: "M3 6h18M3 12h18M3 18h18"
    },
    { 
      tahun: "1920", 
      peristiwa: "Pembentukan Desa Adat Cengkilung", 
      deskripsi: "Desa Adat Cengkilung resmi berdiri dengan struktur adat yang lengkap",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    },
    { 
      tahun: "1977", 
      peristiwa: "Berdirinya STT Sri Nadhi", 
      deskripsi: "Organisasi kepemudaan yang menjadi wadah pembinaan generasi muda",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    },
    { 
      tahun: "2024", 
      peristiwa: "Periode Kepengurusan Baru", 
      deskripsi: "Pelantikan perangkat desa adat periode 2024-2029",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  ];

  const sections = [
    { id: "sejarah", label: "Sejarah Umum" },
    { id: "asal-usul", label: "Asal Usul Nama" },
    { id: "keunikan", label: "Keunikan Budaya" },
    { id: "perkembangan", label: "Perkembangan Modern" },
    { id: "timeline", label: "Linimasa" }
  ];

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-amber-900 to-amber-900 h-80 animate-pulse">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
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
        <nav className="flex items-center gap-2 text-sm text-stone-300/70 mb-6 flex-wrap">
          <Link to="/" className="hover:text-amber-300 transition-colors">Beranda</Link>
          <span className="text-stone-400/40">/</span>
          <Link to="/profil-desa" className="hover:text-amber-300 transition-colors">Profil Desa</Link>
          <span className="text-stone-400/40">/</span>
          <span className="text-amber-200 font-medium">Sejarah</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Sejarah Desa Adat
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">
            Cengkilung
          </span>
        </h1>

        <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">
          Menelusuri perjalanan panjang dari masa pembentukan, konflik bersejarah, 
          hingga perkembangan budaya yang unik dan tetap lestari hingga kini.
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-12">
          {/* <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20">
            <span className="text-2xl font-bold text-amber-100">1920</span>
            <span className="text-sm text-stone-300 ml-2">Tahun Berdiri</span>
          </div> */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">3</span>
            <span className="text-sm text-stone-300 ml-2">Versi Asal Nama</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">4</span>
            <span className="text-sm text-stone-300 ml-2">Keunikan Budaya</span>
          </div>
        </div>
      </div>

      {/* Wave Divider - lebih subtle */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.03"/>
          <path d="M0 120L60 112.5C120 105 240 90 360 82.5C480 75 600 75 720 78.75C840 82.5 960 90 1080 93.75C1200 97.5 1320 97.5 1380 97.5L1440 97.5V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.06"/>
        </svg>
      </div>
    </div>

      {/* ===== STICKY TAB NAVIGATION ===== */}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4">
            {sections.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-24">
        
        {/* ===== SEJARAH UMUM ===== */}
        <section 
          id="sejarah"
          data-observe
          className={`transform transition-all duration-1000 ${
            isVisible['sejarah'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Perjalanan Sejarah
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {sejarahContent.umum.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Text Content */}
            <div className="space-y-6">
              {sejarahContent.umum.content.map((paragraph, idx) => (
                <motion.p 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="text-gray-600 leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}

              {/* Quote Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl border-l-4 border-emerald-600"
              >
                <svg className="w-8 h-8 text-emerald-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 italic">
                  "Perjalanan sejarah Desa Cengkilung adalah cerita tentang ketahanan budaya, 
                  adaptasi terhadap perubahan zaman, dan upaya pelestarian identitas di tengah arus modernisasi."
                </p>
              </motion.div>
            </div>

            {/* Image Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-200 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-200 rounded-full opacity-50 blur-2xl"></div>
              
              <div className="relative bg-gradient-to-br from-emerald-500 to-amber-600 rounded-2xl shadow-xl overflow-hidden h-80">
                {sejarahData?.foto_representatif && !imageError ? (
                  <img 
                    src={`${BACKEND_BASE_URL}/${sejarahData.foto_representatif}`}
                    alt="Pura Dalem Cengkilung"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
                    <svg className="w-24 h-24 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                    </svg>
                    <p className="text-lg font-semibold">Pura Dalem Cengkilung</p>
                    <p className="text-sm opacity-75">Pusat kegiatan adat dan keagamaan</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== ASAL USUL NAMA ===== */}
        <section 
          id="asal-usul"
          data-observe
          className={`transform transition-all duration-1000 delay-200 ${
            isVisible['asal-usul'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              Etimologi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {sejarahContent.asalUsul.title}
            </h2>
            <p className="text-lg text-gray-600">
              {sejarahContent.asalUsul.latarBelakang}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sejarahContent.asalUsul.versi.map((versi, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl p-8 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div 
                    className="absolute inset-0" 
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, gray 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }} 
                  />
                </div>

                {/* Icon */}
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={versi.icon} />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {versi.nama}
                </h3>
                <p className="text-gray-600">
                  {versi.deskripsi}
                </p>

                {/* Decorative Number */}
                <div className="absolute bottom-4 right-4 text-8xl font-black text-gray-100 opacity-30 select-none">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== KEUNIKAN BUDAYA ===== */}
        <section 
          id="keunikan"
          data-observe
          className={`transform transition-all duration-1000 delay-400 ${
            isVisible['keunikan'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '30px 30px'
                }} 
              />
            </div>

            <div className="relative z-10">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-4">
                Warisan Leluhur
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                {sejarahContent.keunikan.title}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sejarahContent.keunikan.poin.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.judul}</h3>
                    <p className="text-sm text-white/80">{item.deskripsi}</p>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20"
              >
                <p className="text-sm text-white/90">
                  <span className="font-semibold">Warisan Seni:</span> Desa Cengkilung memiliki berbagai sekaa seni 
                  seperti Gong Kebyar, Angklung, Semarpegulingan, Santi Geguntangan, Topeng Wali, Arja, dan Barong Ngelawang.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== PERKEMBANGAN MODERN ===== */}
        <section 
          id="perkembangan"
          data-observe
          className={`transform transition-all duration-1000 delay-600 ${
            isVisible['perkembangan'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group"
            >
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                  </svg>
                  <p className="text-xl font-semibold">Transformasi Digital</p>
                  <p className="text-sm opacity-75">Desa Adat di Era Modern</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent"></div>
            </motion.div>

            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                Transformasi Digital
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {sejarahContent.perkembangan.title}
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {sejarahContent.perkembangan.content.map((paragraph, idx) => (
                  <motion.p 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {/* Technology Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-3 mt-6"
              >
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                  <span></span> Sistem Informasi Desa
                </span>
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-1">
                  <span></span> Dokumentasi Digital
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                  <span></span> Edukasi Budaya
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ===== TIMELINE ===== */}
        {/* <section 
          id="timeline"
          data-observe
          className={`transform transition-all duration-1000 delay-800 ${
            isVisible['timeline'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              Linimasa Sejarah
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perjalanan Desa Cengkilung
            </h2>
            <p className="text-lg text-gray-600">
              Dari masa ke masa, Desa Adat Cengkilung terus berkembang dan beradaptasi
            </p>
          </div>

          <div className="relative"> */}
            {/* Vertical Line */}
            {/* <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-emerald-500 via-amber-500 to-amber-500"></div>

            <div className="space-y-8 md:space-y-12">
              {timelineData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex flex-col md:flex-row ${
                    index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                  }`}
                > */}
                  {/* Content */}
                  {/* <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-amber-600 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                          </svg>
                        </div>
                        <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                          {item.tahun}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.peristiwa}
                      </h3>
                      <p className="text-gray-600">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div> */}

                  {/* Dot */}
                  {/* <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-emerald-600 rounded-full z-10"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* ===== CTA BUTTON ===== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <Link
            to="/profil-desa"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Profil Desa</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}


