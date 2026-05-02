import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getToken, isMasyarakat } from "@/utils/auth";
import { API_BASE_URL, BACKEND_BASE_URL } from "@/utils/api";

export default function DetailDokumen() {
  const { id } = useParams();
  const [dokumen, setDokumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userIsMasyarakat = isMasyarakat();

  useEffect(() => {
    fetchDokumen();
  }, [id]);

  const fetchDokumen = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/dokumen/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (res.data?.success && res.data?.data) {
        setDokumen(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching dokumen:", error);
      setError("Gagal memuat data dokumen");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dokumen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dokumen Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || "Dokumen yang Anda cari tidak tersedia."}</p>
          <Link to="/data-desa" className="text-amber-600 hover:underline">
            Kembali ke Data Desa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-amber-600">Beranda</Link>
          <span>/</span>
          <Link to="/data-desa" className="hover:text-amber-600">Data Desa</Link>
          <span>/</span>
          <span className="text-gray-700">Detail Dokumen</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-4xl">ðŸ“„</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{dokumen.judul_dokumen}</h1>
              <p className="text-gray-600">{dokumen.jenis_dokumen || 'Dokumen Umum'}</p>
            </div>
          </div>

          {dokumen.deskripsi_dokumen && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{dokumen.deskripsi_dokumen}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Hak Akses</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                dokumen.hak_akses === 'publik'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {dokumen.hak_akses === 'publik' ? 'Publik' : 'Terbatas'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Tanggal Upload</p>
              <p className="font-medium text-gray-800">
                {new Date(dokumen.tanggal_upload).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            {dokumen.hak_akses === 'publik' || !userIsMasyarakat ? (
              // Admin atau dokumen publik bisa langsung download
              <a
                href={`${BACKEND_BASE_URL}/${dokumen.file_path}`}
                download
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Dokumen
              </a>
            ) : (
              // Masyarakat untuk dokumen terbatas harus ajukan permohonan
              <Link
                to={`/permohonan/${dokumen.id_dokumen}`}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ajukan Permohonan
              </Link>
            )}
            <Link
              to="/data-desa"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium text-center transition-colors"
            >
              Kembali
            </Link>
          </div>

          {dokumen.hak_akses === 'terbatas' && userIsMasyarakat && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Dokumen ini bersifat terbatas. Anda perlu mengajukan permohonan untuk mengaksesnya.
                  Admin akan memverifikasi permohonan Anda.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


