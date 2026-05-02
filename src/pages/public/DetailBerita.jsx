import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";

export default function DetailBerita() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [berita, setBerita] = useState(null);
  const [beritaLainnya, setBeritaLainnya] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchDetailBerita();
  }, [id]);

  const fetchDetailBerita = async () => {
    try {
      setLoading(true);
      // Ambil detail berita berdasarkan ID
      const res = await axios.get(`${API_BASE_URL}/konten/${id}`);
      console.log("Detail berita:", res.data);
      
      if (res.data?.success && res.data?.data) {
        setBerita(res.data.data);
        
        // Ambil berita terkait (kategori sama)
        await fetchBeritaTerkait(res.data.data.id_kategori_konten, id);
      }
    } catch (error) {
      console.error("Error fetching detail berita:", error);
      // Redirect ke halaman berita jika error
      navigate("/berita");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeritaTerkait = async (kategoriId, currentId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/konten`);
      
      let daftarBerita = [];
      if (res.data?.success && Array.isArray(res.data?.data)) {
        daftarBerita = res.data.data;
      } else if (Array.isArray(res.data)) {
        daftarBerita = res.data;
      }
      
      // Filter berita dengan kategori sama, published, dan bukan berita saat ini
      const beritaTerkait = daftarBerita
        .filter(item => 
          item.status_konten === 'published' &&
          item.id_kategori_konten === kategoriId &&
          (item.id_konten || item.id) !== parseInt(currentId)
        )
        .sort((a, b) => {
          const dateA = new Date(a.tanggal_publikasi || a.tanggal_dibuat);
          const dateB = new Date(b.tanggal_publikasi || b.tanggal_dibuat);
          return dateB - dateA;
        })
        .slice(0, 3);
      
      setBeritaLainnya(beritaTerkait);
    } catch (error) {
      console.error("Error fetching berita terkait:", error);
    }
  };

  const getCategoryName = (id) => {
    const categoryMap = {
      1: "Spiritual",
      2: "Seni", 
      3: "Sosial"
    };
    return categoryMap[id] || "Umum";
  };

  const getCategoryColor = (id) => {
    const colorMap = {
      1: "bg-amber-100 text-amber-700 border-amber-200",
      2: "bg-amber-100 text-amber-700 border-amber-200",
      3: "bg-green-100 text-green-700 border-green-200"
    };
    return colorMap[id] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return "-";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "-";
    }
  };

  // Fungsi untuk berbagi ke Facebook
  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(berita.judul);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
  };

  // Fungsi untuk berbagi ke Twitter/X
  const shareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(berita.judul);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  // Fungsi untuk berbagi ke LinkedIn
  const shareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(berita.judul);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  };

  // Fungsi untuk berbagi ke WhatsApp
  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${berita.judul}\n\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Fungsi untuk menyalin link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-amber-900 to-amber-900 h-80 animate-pulse"></div>
        
        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Berita Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">Berita yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Berita</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = getCategoryName(berita.id_kategori_konten);
  const categoryColor = getCategoryColor(berita.id_kategori_konten);
  const tanggal = formatDate(berita.tanggal_publikasi || berita.tanggal_dibuat);
  const waktu = formatTime(berita.tanggal_publikasi || berita.tanggal_dibuat);

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
            <Link to="/berita" className="hover:text-amber-300 transition-colors">Berita</Link>
            <span className="text-stone-400/40">/</span>
            <span className="text-amber-200 font-medium">Detail</span>
          </nav>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
            {berita.judul}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-stone-200/90">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{tanggal}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{waktu} WITA</span>
            </div>
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30">
              {categoryName}
            </span>
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl mb-8 group">
              {berita.thumbnail && !imageError ? (
                <img
                  src={`${BACKEND_BASE_URL}/${berita.thumbnail}`}
                  alt={berita.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center">
                  <svg className="w-32 h-32 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                  </svg>
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent"></div>
              
              {/* Category Badge */}
              <span className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${categoryColor}`}>
                {categoryName}
              </span>
            </div>

            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              {/* Ringkasan */}
              {berita.ringkasan && (
                <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-r-2xl mb-8">
                  <p className="text-emerald-800 text-lg italic leading-relaxed">
                    "{berita.ringkasan}"
                  </p>
                </div>
              )}

              {/* Isi Konten */}
              <div className="text-gray-700 leading-relaxed space-y-6">
                {berita.isi_konten.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </article>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bagikan Artikel</h3>
              <div className="flex flex-wrap items-center gap-3">
                {/* Facebook */}
                <button
                  onClick={shareFacebook}
                  className="w-10 h-10 bg-[#4267B2] text-white rounded-lg hover:bg-[#365899] transition-colors flex items-center justify-center transform hover:scale-110 hover:-translate-y-1"
                  title="Bagikan ke Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={shareTwitter}
                  className="w-10 h-10 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center transform hover:scale-110 hover:-translate-y-1"
                  title="Bagikan ke Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={shareLinkedIn}
                  className="w-10 h-10 bg-[#0077B5] text-white rounded-lg hover:bg-[#006396] transition-colors flex items-center justify-center transform hover:scale-110 hover:-translate-y-1"
                  title="Bagikan ke LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z" />
                  </svg>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={shareWhatsApp}
                  className="w-10 h-10 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center transform hover:scale-110 hover:-translate-y-1"
                  title="Bagikan ke WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                </button>

                {/* Copy Link */}
                <div className="relative">
                  <button
                    onClick={copyLink}
                    className="w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center transform hover:scale-110 hover:-translate-y-1"
                    title="Salin Link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  
                  {/* Tooltip Copy Success */}
                  {copySuccess && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      Link tersalin!
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Penulis</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {berita.id_pengguna ? 'A' : 'S'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {berita.id_pengguna ? 'Administrator' : 'Sistem'}
                  </p>
                  <p className="text-sm text-gray-500">Penulis</p>
                </div>
              </div>
            </div>

            {/* Berita Terkait */}
            {beritaLainnya.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Berita Terkait</h3>
                <div className="space-y-4">
                  {beritaLainnya.map((item) => {
                    const itemId = item.id_konten || item.id;
                    const itemKategori = getCategoryName(item.id_kategori_konten);
                    const itemTanggal = formatDate(item.tanggal_publikasi || item.tanggal_dibuat);
                    
                    return (
                      <Link
                        key={itemId}
                        to={`/berita/${itemId}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-amber-600 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.thumbnail ? (
                              <img
                                src={`${BACKEND_BASE_URL}/${item.thumbnail}`}
                                alt={item.judul}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-emerald-600 mb-1">{itemKategori}</p>
                            <h4 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                              {item.judul}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{itemTanggal}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200">
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Daftar Berita</span>
          </Link>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <span>Ke Atas</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


