import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, buildAssetUrl } from "@/utils/api";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [stats, setStats] = useState({
    wargaTerdaftar: 0,
    totalBerita: 0,
    totalKegiatan: 0,
    tahunBerdiri: 1920
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Ambil data dari endpoint yang tidak memerlukan autentikasi
      
      // 1. Ambil data konten (berita) - endpoint publik
      const kontenRes = await axios.get(`${API_BASE_URL}/konten`);
      
      // 2. Ambil data galeri (kegiatan) - endpoint publik
      const galeriRes = await axios.get(`${API_BASE_URL}/galeri`);
      
      // 3. Ambil data statistik penduduk dari endpoint statistik (publik)
      const statistikRes = await axios.get(`${API_BASE_URL}/statistik-desa`);
      
      // Hitung total berita yang published
      let totalBerita = 0;
      if (kontenRes.data?.success && Array.isArray(kontenRes.data?.data)) {
        totalBerita = kontenRes.data.data.filter(item => item.status_konten === 'published').length;
      } else if (Array.isArray(kontenRes.data)) {
        totalBerita = kontenRes.data.filter(item => item.status_konten === 'published').length;
      }
      
      // Hitung total kegiatan dari galeri
      let totalKegiatan = 0;
      if (galeriRes.data?.success && Array.isArray(galeriRes.data?.data)) {
        totalKegiatan = galeriRes.data.data.length;
      } else if (Array.isArray(galeriRes.data)) {
        totalKegiatan = galeriRes.data.length;
      }
      
      // Ambil total penduduk dari endpoint statistik
      let totalPenduduk = 0;
      if (statistikRes.data?.success && statistikRes.data?.data) {
        totalPenduduk = statistikRes.data.data.total_penduduk || 0;
      }
      
      setStats({
        wargaTerdaftar: totalPenduduk,
        totalBerita: totalBerita,
        totalKegiatan: totalKegiatan
        // tahunBerdiri: 1920
      });
      
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback ke data dummy jika error
      setStats({
        wargaTerdaftar: 2560,
        totalBerita: 150,
        totalKegiatan: 50
        // tahunBerdiri: 1920
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  // URL gambar background
  const backgroundImageUrl = buildAssetUrl("uploads/profil/banjar-cengkilung.jpg");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* Overlay gradien elegan - warna netral/earth tone */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-800/75 to-stone-900/85 z-10"></div>
        
        {/* Gambar Background */}
        <img
          src={backgroundImageUrl}
          alt="Banjar Cengkilung"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectPosition: 'center 30%' // Sesuaikan posisi gambar (atur nilai % sesuai kebutuhan)
          }}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error("Gambar background gagal dimuat:", backgroundImageUrl);
            e.target.onerror = null;
            // Fallback ke gradien jika gambar gagal dimuat
            e.target.style.display = 'none';
          }}
        />
        
        {/* Placeholder/loading untuk gambar */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-stone-900 animate-pulse"></div>
        )}
      </div>

      {/* Subtle Pattern Overlay - lebih elegan */}
      <div className="absolute inset-0 opacity-5 z-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M50 50h30v30H50zM20 50h30v30H20zM0 30h30v30H0zM30 0h30v30H30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Soft Light Effect - memberikan dimensi */}
      <div className="absolute inset-0 z-20">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Animated Circles - lebih subtle */}
      <div className="absolute inset-0 overflow-hidden z-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className={`transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm text-amber-100 text-sm font-medium mb-8 border border-amber-500/30">
            <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
            Selamat Datang di Portal Resmi
          </span>
        </div>

        {/* Main Title */}
        <h1 className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <span className="block text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            SISTEM INFORMASI
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200 mb-6 drop-shadow-2xl">
            DESA ADAT CENGKILUNG
          </span>
        </h1>

        {/* Description */}
        <p className={`max-w-3xl mx-auto text-lg sm:text-xl text-stone-100 mb-10 leading-relaxed transform transition-all duration-1000 delay-500 drop-shadow-lg ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          Inilah pusat informasi dan komunikasi warga desa adat Cengkilung.
          Dari tradisi hingga pengumuman penting, semuanya tersaji dengan mudah dan cepat
          dalam genggaman Anda.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transform transition-all duration-1000 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <Link
            to="/profil-desa"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-stone-900 bg-gradient-to-r from-amber-300 to-amber-400 rounded-xl overflow-hidden shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Jelajahi Desa
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/berita"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-amber-100 border-2 border-amber-500/30 rounded-xl backdrop-blur-sm hover:bg-amber-500/10 transition-all duration-300 hover:border-amber-400/50"
          >
            <span className="flex items-center gap-2">
              Lihat Berita Terkini
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-amber-500/20 justify-items-center transform transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Warga Terdaftar */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/20 backdrop-blur-sm mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20">
              <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-amber-100 mb-1">
              {loading ? (
                <span className="inline-block w-16 h-6 bg-amber-500/20 rounded animate-pulse"></span>
              ) : (
                `${formatNumber(stats.wargaTerdaftar)}+`
              )}
            </div>
            <div className="text-sm text-stone-300">Warga Terdaftar</div>
          </div>

          {/* Berita & Artikel */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/20 backdrop-blur-sm mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20">
              <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-amber-100 mb-1">
              {loading ? (
                <span className="inline-block w-16 h-6 bg-amber-500/20 rounded animate-pulse"></span>
              ) : (
                `${formatNumber(stats.totalBerita)}+`
              )}
            </div>
            <div className="text-sm text-stone-300">Berita & Artikel</div>
          </div>

          {/* Kegiatan Adat */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/20 backdrop-blur-sm mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 border border-amber-500/20">
              <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-amber-100 mb-1">
              {loading ? (
                <span className="inline-block w-16 h-6 bg-amber-500/20 rounded animate-pulse"></span>
              ) : (
                `${formatNumber(stats.totalKegiatan)}+`
              )}
            </div>
            <div className="text-sm text-stone-300">Kegiatan Adat</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
        <div className="w-6 h-10 border-2 border-amber-500/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-amber-400/50 rounded-full mt-2 animate-scroll"></div>
        </div>
      </div>
    </section>
  );
}