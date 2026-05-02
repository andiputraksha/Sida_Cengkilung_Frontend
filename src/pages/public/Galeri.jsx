import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";

export default function Galeri() {
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeType, setActiveType] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState(["Semua"]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const itemsPerPage = 9;

  useEffect(() => {
    fetchGaleri();
    fetchCategories();
  }, []);

  const fetchGaleri = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/galeri`);
      console.log("Response galeri:", res.data);
      
      let daftarGaleri = [];
      if (res.data?.success && Array.isArray(res.data?.data)) {
        daftarGaleri = res.data.data;
      } else if (Array.isArray(res.data)) {
        daftarGaleri = res.data;
      }
      
      // Urutkan berdasarkan tanggal terbaru
      const galeriSorted = daftarGaleri.sort((a, b) => {
        const dateA = new Date(a.tanggal_publikasi || a.tanggal_dibuat);
        const dateB = new Date(b.tanggal_publikasi || b.tanggal_dibuat);
        return dateB - dateA;
      });
      
      setGaleri(galeriSorted);
      setTotalPages(Math.ceil(galeriSorted.length / itemsPerPage));
      
    } catch (error) {
      console.error("Error fetching galeri:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/galeri/kategori`);
      console.log("Response kategori:", res.data);
      
      if (Array.isArray(res.data)) {
        const kategoriList = res.data.map(k => k.nama_kategori);
        setCategories(["Semua", ...kategoriList]);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        const kategoriList = res.data.data.map(k => k.nama_kategori);
        setCategories(["Semua", ...kategoriList]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback categories
      setCategories(["Semua", "Spiritual", "Seni", "Sosial"]);
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
      1: "bg-amber-100 text-amber-700",
      2: "bg-amber-100 text-amber-700",
      3: "bg-green-100 text-green-700"
    };
    return colorMap[id] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type) => {
    return type === 'foto' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
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

  // Fungsi untuk mengecek apakah string adalah URL YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  // Fungsi untuk mengekstrak ID video YouTube
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Handle youtu.be format
    if (url.includes('youtu.be')) {
      const match = url.match(/youtu\.be\/([^?]+)/);
      return match ? match[1] : null;
    }
    
    // Handle youtube.com format
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  // Fungsi untuk mendapatkan embed URL YouTube
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  // Fungsi untuk mendapatkan thumbnail YouTube
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    document.body.style.overflow = 'unset';
  };

  // Filter galeri berdasarkan kategori dan tipe
  const filteredGaleri = galeri.filter(item => {
    const categoryMatch = activeCategory === "Semua" || getCategoryName(item.id_kategori_galeri) === activeCategory;
    const typeMatch = activeType === "Semua" || item.tipe_media === activeType.toLowerCase();
    return categoryMatch && typeMatch;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGaleri.slice(indexOfFirstItem, indexOfLastItem);

  // Update total pages berdasarkan filtered galeri
  useEffect(() => {
    setTotalPages(Math.ceil(filteredGaleri.length / itemsPerPage));
    setCurrentPage(1);
  }, [activeCategory, activeType, filteredGaleri.length]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVideoThumbnail = (item) => {
    // Jika video dari YouTube, gunakan thumbnail YouTube
    if (item.file_path && item.file_path.includes('youtu')) {
      return getYouTubeThumbnail(item.file_path);
    }
    
    // Jika video upload dan ada thumbnail, gunakan thumbnail dari server
    if (item.thumbnail) {
      return `${BACKEND_BASE_URL}/${item.thumbnail}`;
    }
    
    // Jika tidak ada thumbnail, return null
    return null;
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
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
          <span className="text-amber-200 font-medium">Galeri</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Galeri Desa Adat
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">
            Cengkilung
          </span>
        </h1>

        <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">
          Kumpulan foto dan video kegiatan adat, seni budaya, 
          dan momen-momen berharga dari Desa Adat Cengkilung.
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 mt-12">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">{galeri.length}</span>
            <span className="text-sm text-stone-300 ml-2">Total Media</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">
              {galeri.filter(item => item.tipe_media === 'foto').length}
            </span>
            <span className="text-sm text-stone-300 ml-2">Foto</span>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-amber-500/20 hover:bg-black/30 transition-all duration-300">
            <span className="text-2xl font-bold text-amber-100">
              {galeri.filter(item => item.tipe_media === 'video').length}
            </span>
            <span className="text-sm text-stone-300 ml-2">Video</span>
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
        
        {/* ===== FILTER SECTION ===== */}
        <div className="mb-12 space-y-6">
          {/* Filter Kategori */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">KATEGORI</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
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
          </div>

          {/* Filter Tipe Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">TIPE MEDIA</h3>
            <div className="flex flex-wrap gap-3">
              {["Semua", "Foto", "Video"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                    activeType === type
                      ? "bg-gradient-to-r from-amber-600 to-amber-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100 shadow-md"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== GRID GALERI ===== */}
        {currentItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((item, index) => {
              const itemId = item.id_galeri || item.id;
              const itemKategori = getCategoryName(item.id_kategori_galeri);
              const kategoriColor = getCategoryColor(item.id_kategori_galeri);
              const tanggal = formatDate(item.tanggal_publikasi || item.tanggal_dibuat);
              const thumbnail = item.tipe_media === 'video' 
                ? getVideoThumbnail(item)
                : (item.thumbnail ? `${BACKEND_BASE_URL}/${item.thumbnail}` : `${BACKEND_BASE_URL}/${item.file_path}`);
              const hasError = imageErrors[itemId];
              
              return (
                <div
                  key={itemId}
                  onClick={() => openModal(item)}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Image/Video Container */}
                  <div className="relative overflow-hidden h-56">
                    {item.tipe_media === 'foto' ? (
                      <>
                        {thumbnail && !hasError ? (
                          <img
                            src={thumbnail}
                            alt={item.judul_media}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={() => handleImageError(itemId)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center">
                            <svg className="w-20 h-20 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                            </svg>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 relative">
                        {thumbnail && !hasError ? (
                          <img
                            src={thumbnail}
                            alt={item.judul_media}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                            onError={() => handleImageError(itemId)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-20 h-20 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z" />
                            </svg>
                          </div>
                        )}
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-amber-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        item.tipe_media === 'foto' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        {getTypeIcon(item.tipe_media)}
                        <span>{item.tipe_media === 'foto' ? 'Foto' : 'Video'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${kategoriColor}`}>
                        {itemKategori}
                      </span>
                      <span className="text-xs text-gray-500">{tanggal}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {item.judul_media}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Media</h3>
              <p className="text-gray-500">
                Belum ada {activeCategory !== "Semua" ? `media dalam kategori "${activeCategory}"` : 'media'} 
                {activeType !== "Semua" ? ` dengan tipe "${activeType}"` : ''} saat ini.
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

      {/* ===== MODAL PREVIEW ===== */}
      {isModalOpen && selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Media Content */}
            <div className="bg-black aspect-video flex items-center justify-center">
              {selectedItem.tipe_media === 'foto' ? (
                <img
                  src={`${BACKEND_BASE_URL}/${selectedItem.file_path || selectedItem.thumbnail}`}
                  alt={selectedItem.judul_media}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full">
                  {isYouTubeUrl(selectedItem.file_path) ? (
                    // Jika URL YouTube, tampilkan iframe
                    <iframe
                      src={getYouTubeEmbedUrl(selectedItem.file_path)}
                      title={selectedItem.judul_media}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Jika video upload, tampilkan video player
                    <video
                      src={`${BACKEND_BASE_URL}/${selectedItem.file_path}`}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      <source src={`${BACKEND_BASE_URL}/${selectedItem.file_path}`} />
                      Browser Anda tidak mendukung tag video.
                    </video>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(selectedItem.id_kategori_galeri)}`}>
                  {getCategoryName(selectedItem.id_kategori_galeri)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  selectedItem.tipe_media === 'foto' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {getTypeIcon(selectedItem.tipe_media)}
                  <span>{selectedItem.tipe_media === 'foto' ? 'Foto' : 'Video'}</span>
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedItem.tanggal_publikasi || selectedItem.tanggal_dibuat)}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedItem.judul_media}
              </h3>
              
              {/* Tombol Download untuk video upload */}
              {selectedItem.tipe_media === 'video' && !isYouTubeUrl(selectedItem.file_path) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={`${BACKEND_BASE_URL}/${selectedItem.file_path}`}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Video</span>
                  </a>
                </div>
              )}

              {/* Tombol Buka di YouTube (untuk video YouTube) */}
              {selectedItem.tipe_media === 'video' && isYouTubeUrl(selectedItem.file_path) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={selectedItem.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>Tonton di YouTube</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


