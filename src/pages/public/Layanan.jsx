import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL, BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";

export default function LayananMasyarakat() {
  const [activeCategory, setActiveCategory] = useState("semua");
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const fallbackVisibility = { "info-header": true };
      layananData.forEach((_, index) => {
        fallbackVisibility[`layanan-${index}`] = true;
      });
      setIsVisible(fallbackVisibility);
      return;
    }

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
  }, []);

  const categories = [
    { id: "semua", label: "Semua Layanan", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "administrasi", label: "Administrasi", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "kependudukan", label: "Kependudukan", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "sosial", label: "Sosial", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
    { id: "keagamaan", label: "Keagamaan", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { id: "pertanahan", label: "Pertanahan", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  ];

  const layananData = [
    {
      id: 1,
      nama: "Pembuatan Surat Keterangan Domisili",
      kategori: "administrasi",
      deskripsi: "Layanan pembuatan surat keterangan domisili untuk keperluan administrasi kependudukan, pekerjaan, atau keperluan lainnya.",
      persyaratan: [
        "Fotokopi KTP",
        "Fotokopi Kartu Keluarga",
        "Surat pengantar dari ketua banjar",
        "Materai Rp10.000"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil nomor antrian di loket pelayanan",
        "Isi formulir permohonan",
        "Serahkan berkas ke petugas",
        "Tunggu proses verifikasi (1-2 hari kerja)",
        "Ambil surat jadi"
      ],
      biaya: "Gratis",
      waktu: "1-2 Hari Kerja",
      kontak: "081234567890 (Bapak Made)",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "from-emerald-500 to-emerald-500",
      popular: true
    },
    {
      id: 2,
      nama: "Pembuatan Surat Keterangan Tidak Mampu",
      kategori: "sosial",
      deskripsi: "Surat keterangan tidak mampu untuk keperluan pengajuan beasiswa, bantuan sosial, atau keringanan biaya pengobatan.",
      persyaratan: [
        "Fotokopi KTP",
        "Fotokopi Kartu Keluarga",
        "Surat pengantar dari ketua banjar",
        "Materai Rp10.000"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil nomor antrian di loket pelayanan",
        "Isi formulir permohonan",
        "Serahkan berkas ke petugas",
        "Petugas akan melakukan verifikasi lapangan",
        "Ambil surat jadi (3-5 hari kerja)"
      ],
      biaya: "Gratis",
      waktu: "3-5 Hari Kerja",
      kontak: "081234567890 (Bapak Made)",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      color: "from-red-500 to-amber-500"
    },
    {
      id: 3,
      nama: "Pembuatan KTP & KK",
      kategori: "kependudukan",
      deskripsi: "Layanan pembuatan KTP elektronik dan Kartu Keluarga baru bagi penduduk Desa Adat Cengkilung.",
      persyaratan: [
        "Fotokopi Akta Kelahiran",
        "Fotokopi KK lama (jika ada)",
        "Surat pengantar dari ketua banjar",
        "Pas foto 3x4 (2 lembar)"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil nomor antrian di loket pelayanan",
        "Isi formulir F-1.01",
        "Lakukan perekaman data dan foto",
        "Tunggu proses pencetakan KTP (2 minggu)",
        "Ambil KTP jadi di kantor desa"
      ],
      biaya: "Gratis",
      waktu: "14 Hari Kerja",
      kontak: "081234567891 (Ibu Luh)",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "from-green-500 to-teal-500"
    },
    {
      id: 4,
      nama: "Pendaftaran Nikah (KUA)",
      kategori: "keagamaan",
      deskripsi: "Layanan pendaftaran pernikahan untuk warga yang akan melangsungkan pernikahan secara agama Hindu.",
      persyaratan: [
        "Fotokopi KTP kedua calon pengantin",
        "Fotokopi KK kedua calon pengantin",
        "Fotokopi Akta Kelahiran",
        "Pas foto 4x6 (4 lembar)",
        "Surat keterangan belum menikah"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil formulir pendaftaran nikah",
        "Isi formulir dan serahkan ke petugas",
        "Lakukan bimbingan perkawinan",
        "Tunggu jadwal akad nikah"
      ],
      biaya: "Rp 300.000",
      waktu: "10 Hari Kerja",
      kontak: "081234567892 (Bapak Wayan)",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      color: "from-amber-500 to-amber-500"
    },
    {
      id: 5,
      nama: "Pembuatan Surat Izin Usaha",
      kategori: "administrasi",
      deskripsi: "Layanan pembuatan surat izin usaha mikro dan kecil (IUMK) untuk warga yang ingin memulai usaha.",
      persyaratan: [
        "Fotokopi KTP",
        "Fotokopi KK",
        "Pas foto 3x4 (2 lembar)",
        "Surat keterangan usaha dari ketua banjar",
        "Materai Rp10.000"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil formulir permohonan IUMK",
        "Isi formulir dan serahkan ke petugas",
        "Petugas melakukan verifikasi usaha",
        "Tunggu proses penerbitan (3-5 hari)",
        "Ambil surat izin jadi"
      ],
      biaya: "Gratis",
      waktu: "3-5 Hari Kerja",
      kontak: "081234567893 (Ibu Komang)",
      icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 6,
      nama: "Pembuatan Surat Keterangan Tanah",
      kategori: "pertanahan",
      deskripsi: "Layanan pembuatan surat keterangan tanah untuk keperluan sertifikasi, jual beli, atau warisan.",
      persyaratan: [
        "Fotokopi KTP pemilik tanah",
        "Fotokopi KK",
        "Bukti kepemilikan tanah (girik/letter C)",
        "Surat pernyataan tidak sengketa",
        "Materai Rp10.000 (2 lembar)"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil formulir permohonan",
        "Isi formulir dan serahkan ke petugas",
        "Petugas melakukan pengukuran dan verifikasi lapangan",
        "Proses penerbitan surat (5-7 hari)",
        "Ambil surat keterangan jadi"
      ],
      biaya: "Rp 100.000",
      waktu: "5-7 Hari Kerja",
      kontak: "081234567894 (Bapak Nyoman)",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      color: "from-emerald-500 to-teal-500"
    },
    {
      id: 7,
      nama: "Bantuan Sosial PKH",
      kategori: "sosial",
      deskripsi: "Pendaftaran dan verifikasi untuk penerima bantuan Program Keluarga Harapan (PKH).",
      persyaratan: [
        "Fotokopi KTP",
        "Fotokopi KK",
        "Surat keterangan tidak mampu",
        "Rekomendasi dari ketua banjar"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil formulir pendaftaran PKH",
        "Isi formulir dan serahkan ke petugas",
        "Petugas melakukan verifikasi lapangan",
        "Tunggu pengumuman penerima bantuan"
      ],
      biaya: "Gratis",
      waktu: "Menyesuaikan jadwal",
      kontak: "081234567895 (Ibu Luh)",
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: 8,
      nama: "Pembuatan Surat Kematian",
      kategori: "kependudukan",
      deskripsi: "Layanan pembuatan surat keterangan kematian untuk keperluan administrasi kependudukan.",
      persyaratan: [
        "Fotokopi KTP almarhum",
        "Fotokopi KK",
        "Surat keterangan dari dokter/rumah sakit",
        "Keterangan dari ketua banjar",
        "KTP pelapor"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil formulir permohonan",
        "Isi formulir dan serahkan ke petugas",
        "Petugas melakukan verifikasi",
        "Surat selesai dalam 1 hari"
      ],
      biaya: "Gratis",
      waktu: "1 Hari Kerja",
      kontak: "081234567896 (Bapak Made)",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-gray-500 to-slate-500"
    },
    {
      id: 9,
      nama: "Pembuatan Surat Keterangan Pindah",
      kategori: "kependudukan",
      deskripsi: "Layanan pembuatan surat keterangan pindah bagi warga yang akan pindah domisili.",
      persyaratan: [
        "Fotokopi KTP",
        "Fotokopi KK",
        "Surat pengantar dari ketua banjar",
        "Materai Rp10.000"
      ],
      prosedur: [
        "Datang ke kantor desa dengan membawa persyaratan",
        "Ambil formulir permohonan pindah",
        "Isi formulir dan serahkan ke petugas",
        "Petugas melakukan verifikasi",
        "Ambil surat keterangan pindah"
      ],
      biaya: "Gratis",
      waktu: "1-2 Hari Kerja",
      kontak: "081234567897 (Ibu Dewi)",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "from-emerald-500 to-amber-500"
    }
  ];

  const filteredLayanan = activeCategory === "semua" 
    ? layananData 
    : layananData.filter(l => l.kategori === activeCategory);

  const openModal = (layanan) => {
    setSelectedLayanan(layanan);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLayanan(null);
    document.body.style.overflow = 'unset';
  };

  const getCategoryLabel = (kategori) => {
    const category = categories.find(c => c.id === kategori);
    return category?.label || kategori;
  };

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
        <div className="relative z-30 max-w-7xl mx-auto px-4 py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-stone-300/70 mb-6 flex-wrap">
            <Link to="/" className="hover:text-amber-300 transition-colors">Beranda</Link>
            <span className="text-stone-400/40">/</span>
            <span className="text-amber-200 font-medium">Layanan Masyarakat</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Layanan Masyarakat
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">
              Desa Adat Cengkilung
            </span>
          </h1>

          <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">
            Informasi lengkap tentang berbagai layanan administrasi, sosial, 
            dan keagamaan yang tersedia untuk masyarakat Desa Adat Cengkilung.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-12">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
              <span className="text-2xl font-bold text-amber-100">{layananData.length}</span>
              <span className="text-sm text-stone-300 ml-2">Total Layanan</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
              <span className="text-2xl font-bold text-amber-100">6</span>
              <span className="text-sm text-stone-300 ml-2">Kategori</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
              <span className="text-2xl font-bold text-amber-100">5</span>
              <span className="text-sm text-stone-300 ml-2">Layanan Populer</span>
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

      {/* ===== KATEGORI FILTER ===== */}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4">
            {categories.map((category) => {
              const Icon = () => (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                </svg>
              );
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-amber-600 to-amber-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Info Header */}
        <div 
          id="info-header"
          data-observe
          className={`bg-gradient-to-br from-amber-50 to-amber-50 rounded-3xl p-8 mb-12 transform transition-all duration-1000 ${
            isVisible['info-header'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {activeCategory === "semua" 
                  ? "Semua Layanan Masyarakat" 
                  : `Layanan ${getCategoryLabel(activeCategory)}`}
              </h2>
              <p className="text-gray-600">
                Ditemukan {filteredLayanan.length} layanan yang tersedia
                {activeCategory !== "semua" && ` dalam kategori ${getCategoryLabel(activeCategory)}`}.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-500">Estimasi</p>
                <p className="font-semibold text-gray-800">1-14 Hari</p>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <p className="text-xs text-gray-500">Biaya</p>
                <p className="font-semibold text-gray-800">Gratis - Rp300rb</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layanan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLayanan.map((layanan, index) => {
            const CategoryIcon = () => (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categories.find(c => c.id === layanan.kategori)?.icon || categories[0].icon} />
              </svg>
            );

            return (
              <div
                key={layanan.id}
                id={`layanan-${index}`}
                data-observe
                className={`group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer ${
                  isVisible[`layanan-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => openModal(layanan)}
              >
                {/* Popular Badge */}
                {/* {layanan.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Populer
                    </span>
                  </div>
                )} */}

                {/* Gradient Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${layanan.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                
                {/* Content */}
                <div className="relative bg-white rounded-2xl p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${layanan.color} p-3 flex items-center justify-center`}>
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={layanan.icon} />
                      </svg>
                    </div>
                    <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1">
                      <CategoryIcon />
                      {getCategoryLabel(layanan.kategori)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {layanan.nama}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {layanan.deskripsi}
                  </p>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Waktu</p>
                      <p className="font-semibold text-sm text-gray-800">{layanan.waktu}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Biaya</p>
                      <p className="font-semibold text-sm text-gray-800">{layanan.biaya}</p>
                    </div>
                  </div>

                  {/* Decorative Number */}
                  <div className="absolute bottom-4 right-4 text-6xl font-black text-gray-100 opacity-30 select-none">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredLayanan.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Tidak Ada Layanan</h3>
              <p className="text-gray-500">
                Belum ada layanan dalam kategori "{getCategoryLabel(activeCategory)}" saat ini.
              </p>
            </div>
          </div>
        )}

        {/* Informasi Tambahan */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-emerald-600 to-amber-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Jam Pelayanan</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span>Senin - Kamis</span>
                <span className="font-semibold">08.00 - 15.00 WITA</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span>Jumat</span>
                <span className="font-semibold">08.00 - 11.00 WITA</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span>Sabtu - Minggu</span>
                <span className="font-semibold">Libur</span>
              </div>
              <div className="mt-4 p-3 bg-white/10 rounded-lg">
                <p className="text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Istirahat: 12.00 - 13.00 WITA
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Kontak & Lokasi</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Alamat</p>
                  <p className="text-sm text-white/80">
                    Jl. Cekomaria II, Br. Cengkilung, Peguyangan Kangin, Denpasar Utara
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-semibold">Telepon</p>
                  <p className="text-sm text-white/80">+62 822-3662-4414</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-white/80">desaadatcengkilung@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODAL DETAIL LAYANAN ===== */}
      <AnimatePresence>
        {isModalOpen && selectedLayanan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`sticky top-0 z-10 bg-gradient-to-r ${selectedLayanan.color} p-6 text-white rounded-t-3xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={selectedLayanan.icon} />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">{selectedLayanan.nama}</h2>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Kategori & Popular */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categories.find(c => c.id === selectedLayanan.kategori)?.icon} />
                    </svg>
                    {getCategoryLabel(selectedLayanan.kategori)}
                  </span>
                  {/* {selectedLayanan.popular && (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Layanan Populer
                    </span>
                  )} */}
                </div>

                {/* Deskripsi */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Deskripsi Layanan</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedLayanan.deskripsi}</p>
                </div>

                {/* Informasi Cepat */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <svg className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-500">Waktu Proses</p>
                    <p className="font-semibold text-gray-800">{selectedLayanan.waktu}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <svg className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-500">Biaya</p>
                    <p className="font-semibold text-gray-800">{selectedLayanan.biaya}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <svg className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-xs text-gray-500">Petugas</p>
                    <p className="font-semibold text-gray-800">{selectedLayanan.kontak.split('(')[0]}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <svg className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-xs text-gray-500">Kontak</p>
                    <p className="font-semibold text-gray-800">{selectedLayanan.kontak.split('(')[1]?.replace(')', '') || '-'}</p>
                  </div>
                </div>

                {/* Persyaratan */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Persyaratan
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ul className="space-y-2">
                      {selectedLayanan.persyaratan.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Prosedur */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Prosedur
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <ol className="space-y-3">
                      {selectedLayanan.prosedur.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-amber-600 font-semibold text-xs">
                            {idx + 1}
                          </span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Catatan */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      <strong>Catatan:</strong> Pastikan semua persyaratan lengkap sebelum datang ke kantor desa. 
                      Untuk informasi lebih lanjut, silakan hubungi petugas yang bertugas.
                    </span>
                  </p>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-8 flex gap-4">
                  <a
                    href={`https://wa.me/${selectedLayanan.kontak.split('(')[1]?.replace(')', '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    Konsultasi via WhatsApp
                  </a>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

