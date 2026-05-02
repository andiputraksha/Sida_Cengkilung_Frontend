import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, buildAssetUrl } from "@/utils/api";
export default function Statistik() {
  const [statistik, setStatistik] = useState({
    totalPenduduk: 0,
    lakiLaki: 0,
    perempuan: 0,
    permanen: 0,
    nonPermanen: 0,
    pendidikan: {},
    pekerjaan: {},
    usia: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [isVisible, setIsVisible] = useState({ ringkasan: true });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchStatistik();
  }, []);

  // Intersection Observer untuk animasi scroll
  useEffect(() => {
    if (loading) return;

    const sections = document.querySelectorAll("[data-observe]");
    if (!sections.length) return;

    if (!("IntersectionObserver" in window)) {
      const allVisible = {};
      sections.forEach((section) => {
        allVisible[section.id] = true;
      });
      setIsVisible((prev) => ({ ...prev, ...allVisible }));
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

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [loading]);

  const fetchStatistik = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await axios.get(`${API_BASE_URL}/statistik-desa`);
      console.log("Response statistik:", res.data);
      
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        
        // Proses data dari API ke format yang dibutuhkan
        const processedData = {
          totalPenduduk: data.total_penduduk || 0,
          
          // Jenis Kelamin
          lakiLaki: data.jenis_kelamin?.find(jk => jk.jenis_kelamin === 'L')?.jumlah || 0,
          perempuan: data.jenis_kelamin?.find(jk => jk.jenis_kelamin === 'P')?.jumlah || 0,
          
          // Status Kependudukan
          permanen: data.status_kependudukan?.find(sk => sk.status_kependudukan === 'permanen')?.jumlah || 0,
          nonPermanen: data.status_kependudukan?.find(sk => sk.status_kependudukan === 'nonpermanen')?.jumlah || 0,
          
          // Pendidikan
          pendidikan: {},
          // Pekerjaan
          pekerjaan: {},
          // Usia
          usia: {}
        };

        // Proses pendidikan
        if (data.pendidikan && Array.isArray(data.pendidikan)) {
          data.pendidikan.forEach(item => {
            const rawKey = item.pendidikan?.toUpperCase().trim() || 'LAINNYA';
            let key = rawKey;

            if (rawKey === "D3" || rawKey === "DIPLOMA") key = "DIPLOMA";
            if (rawKey === "S1" || rawKey === "SARJANA") key = "SARJANA";

            processedData.pendidikan[key] = item.jumlah;
          });
        }

        // Proses pekerjaan
        if (data.pekerjaan && Array.isArray(data.pekerjaan)) {
          data.pekerjaan.forEach(item => {
            const key = item.pekerjaan || 'Lainnya';
            processedData.pekerjaan[key] = item.jumlah;
          });
        }

        // Proses usia
        if (data.kategori_usia && Array.isArray(data.kategori_usia)) {
          data.kategori_usia.forEach(item => {
            const kategori = item.kategori_usia || item.kategori || "Lainnya";
            processedData.usia[kategori] = item.jumlah;
          });
        }

        setStatistik(processedData);
      }
    } catch (error) {
      console.error("Error fetching statistik:", error);
      setErrorMessage("Gagal memuat data statistik. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return "0";
    return ((value / total) * 100).toFixed(1);
  };

  const pendidikanList = [
    { key: "TIDAK SEKOLAH", label: "Tidak Sekolah" },
    { key: "SD", label: "SD" },
    { key: "SMP", label: "SMP" },
    { key: "SMA", label: "SMA" },
    { key: "DIPLOMA", label: "Diploma" },
    { key: "SARJANA", label: "Sarjana" }
  ];

  const pekerjaanList = [
    { key: "Petani", label: "Petani" },
    { key: "Pedagang", label: "Pedagang" },
    { key: "PNS", label: "PNS" },
    { key: "Karyawan Swasta", label: "Karyawan Swasta" },
    { key: "Wiraswasta", label: "Wiraswasta" },
    { key: "Buruh", label: "Buruh" },
    { key: "Ibu Rumah Tangga", label: "Ibu Rumah Tangga" },
    { key: "Pelajar/Mahasiswa", label: "Pelajar/Mahasiswa" },
    { key: "Pensiunan", label: "Pensiunan" },
    { key: "Lainnya", label: "Lainnya" }
  ];

  const tabs = [
    { id: "ringkasan", label: "Ringkasan", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "demografi", label: "Demografi", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "pendidikan", label: "Pendidikan", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" },
    { id: "pekerjaan", label: "Pekerjaan", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { id: "usia", label: "Usia", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-amber-900 to-amber-900 h-80 animate-pulse"></div>
        
        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-xl p-6 h-32 animate-pulse"></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {errorMessage && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {errorMessage}
          </div>
        </div>
      )}

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
          <span className="text-amber-200 font-medium">Statistik</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Statistik Desa Adat
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">
            Cengkilung
          </span>
        </h1>

        <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">
          Data kependudukan dan statistik terkini Desa Adat Cengkilung
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-12">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{formatNumber(statistik.totalPenduduk)}</span>
            <span className="text-sm text-stone-300 ml-2">Total Jiwa</span>
          </div>
          {/* <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{formatNumber(statistik.lakiLaki + statistik.perempuan)}</span>
            <span className="text-sm text-stone-300 ml-2">Kepala Keluarga</span>
          </div> */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{formatNumber(statistik.permanen)}</span>
            <span className="text-sm text-stone-300 ml-2">Penduduk Permanen</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{formatNumber(statistik.nonPermanen)}</span>
            <span className="text-sm text-stone-300 ml-2">Non-Permanen</span>
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

      {/* ===== TAB NAVIGATION ===== */}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-24">
        
        {/* ===== RINGKASAN ===== */}
        <section 
          id="ringkasan"
          data-observe
          className={`transform transition-all duration-1000 ${
            isVisible['ringkasan'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Ringkasan Data
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Statistik Penduduk
            </h2>
            <p className="text-lg text-gray-600">
              Data kependudukan terkini Desa Adat Cengkilung
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total Penduduk */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden lg:col-start-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{formatNumber(statistik.totalPenduduk)}</h3>
                <p className="text-sm text-gray-500">Total Penduduk</p>
                <p className="text-xs text-gray-400 mt-2">Jiwa</p>
              </div>
              <div className="absolute bottom-2 right-2 text-6xl font-black text-gray-100 opacity-30 select-none">
                01
              </div>
            </div>

            {/* Kepala Keluarga */}
            {/* <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{formatNumber(statistik.lakiLaki + statistik.perempuan)}</h3>
                <p className="text-sm text-gray-500">Kepala Keluarga</p>
                <p className="text-xs text-gray-400 mt-2">KK</p>
              </div>
              <div className="absolute bottom-2 right-2 text-6xl font-black text-gray-100 opacity-30 select-none">
                02
              </div>
            </div> */}

            {/* Penduduk Permanen */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{formatNumber(statistik.permanen)}</h3>
                <p className="text-sm text-gray-500">Penduduk Permanen</p>
                <p className="text-xs text-gray-400 mt-2">{calculatePercentage(statistik.permanen, statistik.totalPenduduk)}%</p>
              </div>
              <div className="absolute bottom-2 right-2 text-6xl font-black text-gray-100 opacity-30 select-none">
                02
              </div>
            </div>

            {/* Penduduk Non-Permanen */}
            <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">{formatNumber(statistik.nonPermanen)}</h3>
                <p className="text-sm text-gray-500">Non-Permanen</p>
                <p className="text-xs text-gray-400 mt-2">{calculatePercentage(statistik.nonPermanen, statistik.totalPenduduk)}%</p>
              </div>
              <div className="absolute bottom-2 right-2 text-6xl font-black text-gray-100 opacity-30 select-none">
                03
              </div>
            </div>
          </div>
        </section>

        {/* ===== DEMOGRAFI ===== */}
        <section 
          id="demografi"
          data-observe
          className={`transform transition-all duration-1000 delay-200 ${
            isVisible['demografi'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-amber-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Komposisi Jenis Kelamin
              </h2>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Grafik Sederhana */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Laki-Laki</span>
                      <span className="text-gray-600">{formatNumber(statistik.lakiLaki)} orang ({calculatePercentage(statistik.lakiLaki, statistik.totalPenduduk)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${calculatePercentage(statistik.lakiLaki, statistik.totalPenduduk)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Perempuan</span>
                      <span className="text-gray-600">{formatNumber(statistik.perempuan)} orang ({calculatePercentage(statistik.perempuan, statistik.totalPenduduk)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-amber-600 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${calculatePercentage(statistik.perempuan, statistik.totalPenduduk)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Ringkasan */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{formatNumber(statistik.lakiLaki)}</div>
                      <div className="text-sm text-gray-500">Laki-Laki</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{formatNumber(statistik.perempuan)}</div>
                      <div className="text-sm text-gray-500">Perempuan</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    {/* <p className="text-sm text-gray-600">
                      Rasio Jenis Kelamin: <span className="font-bold">{(statistik.lakiLaki / (statistik.perempuan || 1)).toFixed(2)}</span> (L/P)
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PENDIDIKAN ===== */}
        <section 
          id="pendidikan"
          data-observe
          className={`transform transition-all duration-1000 delay-400 ${
            isVisible['pendidikan'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                Tingkat Pendidikan
              </h2>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-4 text-left font-semibold text-gray-700">Tingkat Pendidikan</th>
                      <th className="py-4 text-right font-semibold text-gray-700">Jumlah</th>
                      <th className="py-4 text-right font-semibold text-gray-700">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendidikanList.map((item, index) => {
                      const jumlah = statistik.pendidikan?.[item.key] || 0;
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-gray-700">{item.label}</td>
                          <td className="py-3 text-right font-medium text-gray-800">{formatNumber(jumlah)} orang</td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center gap-2">
                              <span className="font-medium text-gray-800">{calculatePercentage(jumlah, statistik.totalPenduduk)}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-amber-600 h-1.5 rounded-full"
                                  style={{ width: `${calculatePercentage(jumlah, statistik.totalPenduduk)}%` }}
                                ></div>
                              </div>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PEKERJAAN ===== */}
        <section 
          id="pekerjaan"
          data-observe
          className={`transform transition-all duration-1000 delay-800 ${
            isVisible['pekerjaan'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Pekerjaan
              </h2>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-4 text-left font-semibold text-gray-700">Pekerjaan</th>
                      <th className="py-4 text-right font-semibold text-gray-700">Jumlah</th>
                      <th className="py-4 text-right font-semibold text-gray-700">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pekerjaanList.map((item, index) => {
                      const jumlah = statistik.pekerjaan?.[item.key] || 0;
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-gray-700">{item.label}</td>
                          <td className="py-3 text-right font-medium text-gray-800">{formatNumber(jumlah)} orang</td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center gap-2">
                              <span className="font-medium text-gray-800">{calculatePercentage(jumlah, statistik.totalPenduduk)}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-orange-600 h-1.5 rounded-full"
                                  style={{ width: `${calculatePercentage(jumlah, statistik.totalPenduduk)}%` }}
                                ></div>
                              </div>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ===== USIA ===== */}
        <section 
          id="usia"
          data-observe
          className={`transform transition-all duration-1000 delay-1000 ${
            isVisible['usia'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kelompok Usia
              </h2>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(statistik.usia).map(([kelompok, jumlah], index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">{formatNumber(jumlah)}</div>
                    <div className="text-sm text-gray-500">{kelompok}</div>
                    <div className="text-xs text-gray-400 mt-2">{calculatePercentage(jumlah, statistik.totalPenduduk)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== CATATAN ===== */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Data diperbarui secara berkala. Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}



