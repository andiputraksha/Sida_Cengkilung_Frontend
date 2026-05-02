import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, BACKEND_BASE_URL } from "@/utils/api";

export default function BeritaSection() {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    try {
      setLoading(true);
      console.log("Mengambil data berita...");
      
      const res = await axios.get(`${API_BASE_URL}/konten`);
      
      console.log("Response lengkap:", res);
      console.log("Data response:", res.data);
      
      // AMBIL DATA DENGAN BENAR - PERHATIKAN STRUKTURNYA
      let kontenList = [];
      
      // Struktur dari response Anda: { success: true, message: "...", data: [...] }
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        kontenList = res.data.data;
        console.log("Menggunakan res.data.data, jumlah:", kontenList.length);
      } 
      // Fallback jika struktur berbeda
      else if (Array.isArray(res.data)) {
        kontenList = res.data;
        console.log("Menggunakan res.data (array), jumlah:", kontenList.length);
      } 
      else if (res.data && Array.isArray(res.data.data)) {
        kontenList = res.data.data;
        console.log("Menggunakan res.data.data (alternatif), jumlah:", kontenList.length);
      }
      
      console.log("Semua konten:", kontenList);
      
      // TAMPILKAN SEMUA KONTEN TANPA FILTER DULU UNTUK TEST
      // Ambil 3 konten pertama apapun statusnya
      const kontenTerbaru = kontenList.slice(0, 3);
      
      console.log("3 Konten pertama:", kontenTerbaru);
      setBerita(kontenTerbaru);
      
    } catch (err) {
      console.error("Error detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  // Helper untuk mengambil field dengan berbagai kemungkinan nama
  const getValue = (item, field) => {
    switch(field) {
      case 'id':
        return item.id_konten || item.id;
      case 'judul':
        return item.judul || "Tanpa Judul";
      case 'gambar':
        return item.thumbnail || item.gambar || item.file_path || null;
      case 'isi':
        return item.isi_konten || item.isi || item.konten || "";
      case 'tanggal':
        return item.tanggal_publikasi || item.tanggal_dibuat || item.created_at || item.updated_at;
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-48 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-12 w-96 bg-gray-200 rounded-lg mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 w-2/3 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-56 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-6 w-full bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 text-red-600 p-8 rounded-2xl">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Gagal Memuat Berita</h3>
            <p className="mb-4">{error}</p>
            <button 
              onClick={fetchBerita}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!berita || berita.length === 0) {
    return (
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-12 rounded-2xl shadow-lg">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Berita</h3>
            <p className="text-gray-500 mb-4">Belum ada berita yang tersedia.</p>
            <button 
              onClick={fetchBerita}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Render berita
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
            Update Terkini
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Berita <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">Terkini</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Ikuti perkembangan terbaru seputar kegiatan dan informasi penting 
            dari Desa Adat Cengkilung.
          </p>
        </div>

        {/* Grid Berita */}
        <div className="grid md:grid-cols-3 gap-8">
          {berita.map((item, index) => {
            const id = getValue(item, 'id');
            const judul = getValue(item, 'judul');
            const gambar = getValue(item, 'gambar');
            const isi = getValue(item, 'isi');
            const tanggal = getValue(item, 'tanggal');
            
            console.log(`Berita ${index + 1}:`, { id, judul, gambar, tanggal });
            
            return (
              <article key={id || index} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2">
                {/* Image */}
                <Link to={`/berita/${id}`} className="block relative overflow-hidden h-56">
                  {gambar ? (
                    <img
                      src={`${BACKEND_BASE_URL}/${gambar}`}
                      alt={judul}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Desa+Adat+Cengkilung';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(tanggal)}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/berita/${id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors line-clamp-2">
                      {judul}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {isi && isi.length > 0
                      ? isi.replace(/<[^>]*>/g, '').substring(0, 120) + "..."
                      : "Konten belum tersedia."}
                  </p>

                  {/* Read More */}
                  <Link
                    to={`/berita/${id}`}
                    className="inline-flex items-center text-emerald-600 font-semibold group"
                  >
                    <span>Baca Selengkapnya</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
          >
            <span>Lihat Semua Berita</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}


