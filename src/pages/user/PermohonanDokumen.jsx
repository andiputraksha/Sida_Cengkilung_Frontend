import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { API_BASE_URL } from "@/utils/api";
export default function PermohonanDokumen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dokumen, setDokumen] = useState(null);
  const [alasan, setAlasan] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDokumen();
  }, [id]);

  const fetchDokumen = async () => {
    try {
      setLoading(true);
      // Ambil detail dokumen terbatas
      const res = await axios.get(`${API_BASE_URL}/dokumen/terbatas/${id}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!alasan.trim()) {
      setError("Alasan permohonan wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      await axios.post(
        `${API_BASE_URL}/dokumen/permohonan`,
        {
          dokumenId: parseInt(id),
          alasan
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/data-desa");
      }, 3000);
    } catch (error) {
      console.error("Error submitting permohonan:", error);
      setError(error.response?.data?.message || "Gagal mengajukan permohonan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Permohonan Terkirim!</h2>
            <p className="text-gray-600 mb-6">
              Permohonan akses dokumen telah dikirim ke admin. 
              Anda akan mendapatkan akses setelah disetujui.
            </p>
            <p className="text-sm text-gray-500">Mengalihkan ke halaman data desa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dokumen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dokumen Tidak Ditemukan</h2>
          <Link to="/data-desa" className="text-amber-600 hover:underline">
            Kembali ke Data Desa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-amber-600">Beranda</Link>
          <span>/</span>
          <Link to="/data-desa" className="hover:text-amber-600">Data Desa</Link>
          <span>/</span>
          <span className="text-gray-700">Ajukan Permohonan</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ajukan Permohonan Akses Dokumen</h1>
          <p className="text-gray-600 mb-6">
            Anda mengajukan permohonan untuk mengakses dokumen:
          </p>

          <div className="bg-amber-50 p-4 rounded-xl mb-6">
            <h3 className="font-semibold text-amber-800 mb-1">{dokumen.judul_dokumen}</h3>
            <p className="text-sm text-amber-600">{dokumen.jenis_dokumen || 'Dokumen Umum'}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Permohonan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Jelaskan alasan Anda membutuhkan akses ke dokumen ini..."
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                disabled={submitting}
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Alasan akan diverifikasi oleh admin sebelum akses diberikan.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Mengirim...
                  </span>
                ) : (
                  "Ajukan Permohonan"
                )}
              </button>
              <Link
                to="/data-desa"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-medium text-center transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Setelah disetujui admin, Anda akan bisa mengunduh dokumen ini. 
                Proses verifikasi biasanya memakan waktu 1-2 hari kerja.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



