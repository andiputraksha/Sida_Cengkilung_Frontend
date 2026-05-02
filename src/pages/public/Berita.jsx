import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";

export default function Berita() {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(["Semua"]);
  const [imageErrors, setImageErrors] = useState({});

  const itemsPerPage = 6;

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/konten`);
      console.log("Response berita:", res.data);
      
      let daftarBerita = [];
      if (res.data?.success && Array.isArray(res.data?.data)) {
        daftarBerita = res.data.data;
      } else if (Array.isArray(res.data)) {
        daftarBerita = res.data;
      }
      
      // Filter hanya yang statusnya published
      const beritaPublished = daftarBerita.filter(
        item => item.status_konten === 'published'
      );
      
      // Urutkan berdasarkan tanggal terbaru
      const beritaSorted = beritaPublished.sort((a, b) => {
        const dateA = new Date(a.tanggal_publikasi || a.tanggal_dibuat);
        const dateB = new Date(b.tanggal_publikasi || b.tanggal_dibuat);
        return dateB - dateA;
      });
      
      setBerita(beritaSorted);
      setTotalPages(Math.ceil(beritaSorted.length / itemsPerPage));
      
      // Ekstrak kategori unik dari data berita
      extractCategories(beritaSorted);
      
    } catch (error) {
      console.error("Error fetching berita:", error);
      // Fallback categories jika error
      setCategories(["Semua", "Spiritual", "Seni", "Sosial"]);
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = (beritaList) => {
    // Mapping ID kategori ke nama
    const categoryMap = {
      1: "Spiritual",
      2: "Seni", 
      3: "Sosial"
    };
    
    // Ambil semua kategori unik dari data berita
    const uniqueCategoryIds = [...new Set(beritaList.map(item => item.id_kategori_konten))];
    const uniqueCategories = uniqueCategoryIds
      .map(id => categoryMap[id])
      .filter(name => name) // Hapus undefined
      .sort();
    
    setCategories(["Semua", ...uniqueCategories]);
  };

  const getCategoryName = (id) => {
    const categoryMap = {
      1: "Spiritual",
      2: "Seni", 
      3: "Sosial"
    };
    return categoryMap[id] || "Umum";
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

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Filter berita berdasarkan kategori
  const filteredBerita = activeCategory === "Semua"
    ? berita
    : berita.filter(item => {
        const categoryName = getCategoryName(item.id_kategori_konten);
        return categoryName === activeCategory;
      });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBerita.slice(indexOfFirstItem, indexOfLastItem);

  // Update total pages berdasarkan filtered berita
  useEffect(() => {
    setTotalPages(Math.ceil(filteredBerita.length / itemsPerPage));
    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
  }, [activeCategory, filteredBerita.length]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Skeleton */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-amber-900 to-amber-900 h-80 animate-pulse"></div>
        
        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-center gap-3 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-6 w-full bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
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
          <span className="text-amber-200 font-medium">Berita</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Berita dan Informasi
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">
            Desa Adat Cengkilung
          </span>
        </h1>

        <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">
          Informasi terkini seputar kegiatan adat, pengumuman penting, 
          dan berita terbaru dari Desa Adat Cengkilung.
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-12">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{berita.length}</span>
            <span className="text-sm text-stone-300 ml-2">Total Berita</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{categories.length - 1}</span>
            <span className="text-sm text-stone-300 ml-2">Kategori</span>
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* ===== FILTER KATEGORI ===== */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setCurrentPage(1);
              }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow-md"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ===== GRID BERITA ===== */}
        {currentItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item, index) => {
              const itemId = item.id_konten || item.id;
              const itemJudul = item.judul || "Tanpa Judul";
              const itemGambar = item.thumbnail || item.gambar;
              const itemRingkasan = item.ringkasan || item.isi_konten || item.isi || "";
              const itemTanggal = item.tanggal_publikasi || item.tanggal_dibuat;
              const itemKategori = getCategoryName(item.id_kategori_konten);
              
              return (
                <article
                  key={itemId}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <Link to={`/berita/${itemId}`} className="block relative overflow-hidden h-56">
                    {itemGambar && !imageErrors[itemId] ? (
                      <img
                        src={`${BACKEND_BASE_URL}/${itemGambar}`}
                        alt={itemJudul}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={() => handleImageError(itemId)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center">
                        <svg className="w-20 h-20 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      {itemKategori}
                    </span>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(itemTanggal)}</span>
                    </div>

                    {/* Title */}
                    <Link to={`/berita/${itemId}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {itemJudul}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {itemRingkasan
                        ? itemRingkasan.replace(/<[^>]*>/g, '').substring(0, 120) + "..."
                        : "Klik untuk membaca berita selengkapnya."}
                    </p>

                    {/* Read More */}
                    <Link
                      to={`/berita/${itemId}`}
                      className="inline-flex items-center text-emerald-600 font-semibold group/link"
                    >
                      <span className="relative">
                        Baca Selengkapnya
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover/link:w-full transition-all duration-300"></span>
                      </span>
                      <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Berita</h3>
              <p className="text-gray-500">
                Belum ada berita dalam kategori "{activeCategory}" saat ini.
              </p>
            </div>
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-emerald-600 hover:text-white shadow-md hover:-translate-y-1"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentPage === number
                    ? "bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg scale-110"
                    : "bg-white text-gray-700 hover:bg-emerald-600 hover:text-white shadow-md hover:-translate-y-1"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-emerald-600 hover:text-white shadow-md hover:-translate-y-1"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


