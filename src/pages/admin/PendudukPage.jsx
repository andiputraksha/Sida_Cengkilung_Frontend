import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { API_BASE_URL } from "@/utils/api";
import {
  Users,
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  BookOpen,
  Church,
  FileText,
  Download,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = `${API_BASE_URL}/penduduk`;

export default function PendudukPage() {
  const [penduduk, setPenduduk] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPenduduk, setSelectedPenduduk] = useState(null);
  const [form, setForm] = useState({
    nik: "",
    nama: "",
    jenis_kelamin: "L",
    tanggal_lahir: "",
    agama: "Hindu",
    pekerjaan: "",
    pendidikan: "",
    status_kependudukan: "permanen"
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    agama: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("token");

  const fetchPenduduk = async () => {
    try {
      setLoading(true);
      
      // Build query params for filtering
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.agama) params.append('agama', filter.agama);
      
      const url = `${API_URL}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle response structure - bisa dalam bentuk array langsung atau dalam property 'data'
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (res.data.penduduk && Array.isArray(res.data.penduduk)) {
        data = res.data.penduduk;
      }
      
      setPenduduk(data);
    } catch (error) {
      console.error("Error fetching penduduk:", error);
      console.error("Error details:", error.response?.data);
      alert(error.response?.data?.message || "Gagal memuat data penduduk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenduduk();
  }, [filter.status, filter.agama]);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await axios.get(`${API_URL}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data-penduduk-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert("Data penduduk berhasil diekspor");
    } catch (error) {
      console.error("Error exporting penduduk:", error);
      alert(error.response?.data?.message || "Gagal mengekspor data penduduk");
    } finally {
      setExportLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi NIK harus 16 digit
    if (form.nik.length !== 16) {
      alert("NIK harus 16 digit");
      return;
    }

    // Validasi tanggal lahir tidak boleh di masa depan
    if (new Date(form.tanggal_lahir) > new Date()) {
      alert("Tanggal lahir tidak boleh di masa depan");
      return;
    }

    try {
      setLoading(true);
      let response;
      if (editId) {
        response = await axios.put(`${API_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(response.data?.message || "Data penduduk berhasil diperbarui");
      } else {
        response = await axios.post(API_URL, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(response.data?.message || "Data penduduk berhasil ditambahkan");
      }

      setIsOpen(false);
      resetForm();
      fetchPenduduk();
    } catch (error) {
      console.error("Error saving penduduk:", error);
      console.error("Error details:", error.response?.data);
      
      // Handle validation errors dari backend
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).join('\n');
        alert(errorMessages);
      } else {
        alert(error.response?.data?.message || "Gagal menyimpan data penduduk");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item) => {
    try {
      setLoading(true);
      // Fetch detail penduduk by ID
      const res = await axios.get(`${API_URL}/${item.id_penduduk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle response structure
      let data = res.data;
      if (res.data.data) {
        data = res.data.data;
      }
      
      // Format tanggal untuk input date (YYYY-MM-DD)
      const tanggalLahir = data.tanggal_lahir 
        ? new Date(data.tanggal_lahir).toISOString().split('T')[0]
        : "";
      
      setForm({
        nik: data.nik || "",
        nama: data.nama || "",
        jenis_kelamin: data.jenis_kelamin || "L",
        tanggal_lahir: tanggalLahir,
        agama: data.agama || "Hindu",
        pekerjaan: data.pekerjaan || "",
        pendidikan: data.pendidikan || "",
        status_kependudukan: data.status_kependudukan || "permanen"
      });
      setEditId(data.id_penduduk);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching penduduk detail:", error);
      alert(error.response?.data?.message || "Gagal memuat detail penduduk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data penduduk ini?")) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(response.data?.message || "Data penduduk berhasil dihapus");
      fetchPenduduk();
    } catch (error) {
      console.error("Error deleting penduduk:", error);
      alert(error.response?.data?.message || "Gagal menghapus data penduduk");
    }
  };

  const handleViewDetail = (item) => {
    setSelectedPenduduk(item);
    setIsDetailOpen(true);
  };

  const resetForm = () => {
    setForm({
      nik: "",
      nama: "",
      jenis_kelamin: "L",
      tanggal_lahir: "",
      agama: "Hindu",
      pekerjaan: "",
      pendidikan: "",
      status_kependudukan: "permanen"
    });
    setEditId(null);
  };

  // Format tanggal untuk display
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    try {
      return new Date(tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  // Hitung umur dari tanggal lahir
  const hitungUmur = (tanggalLahir) => {
    if (!tanggalLahir) return "-";
    try {
      const today = new Date();
      const birthDate = new Date(tanggalLahir);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return "-";
    }
  };

  // Filter penduduk
  const filteredPenduduk = penduduk.filter(item => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        item.nik?.toLowerCase().includes(searchLower) ||
        item.nama?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination logic
  const totalItems = filteredPenduduk.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredPenduduk.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const agamaOptions = ["Hindu", "Islam", "Kristen", "Katolik", "Buddha", "Konghucu"];
  const pendidikanOptions = ["Tidak Sekolah", "SD", "SMP", "SMA", "D3", "S1", "S2", "S3"];
  const pekerjaanOptions = [
    "Petani", "Pedagang", "PNS", "Karyawan Swasta", "Guru", "Dosen",
    "Dokter", "Perawat", "Pengrajin", "Seniman", "Wiraswasta", 
    "Ibu Rumah Tangga", "Mahasiswa", "Pensiunan", "Tidak Bekerja"
  ];
  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "permanen", label: "Permanen" },
    { value: "nonpermanen", label: "Non-permanen" }
  ];

  const columns = [
    { 
      header: "NIK", 
      accessor: "nik",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            {row.nama?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.nama}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {value}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Jenis Kelamin", 
      accessor: "jenis_kelamin",
      render: (value) => {
        if (value === "L") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">
              <User className="w-3 h-3" />
              Laki-laki
            </span>
          );
        }
        if (value === "P") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-100 text-amber-800 border-amber-200">
              <User className="w-3 h-3" />
              Perempuan
            </span>
          );
        }
        return "-";
      }
    },
    { 
      header: "Usia", 
      accessor: "tanggal_lahir",
      render: (value) => {
        const umur = hitungUmur(value);
        return (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-sm text-gray-600">{umur} tahun</span>
          </div>
        );
      }
    },
    { 
      header: "Agama", 
      accessor: "agama",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Church className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    { 
      header: "Pekerjaan", 
      accessor: "pekerjaan",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    { 
      header: "Pendidikan", 
      accessor: "pendidikan",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: "status_kependudukan",
      render: (value) => {
        if (value === "permanen") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3" />
              Permanen
            </span>
          );
        } else if (value === "nonpermanen") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
              <AlertCircle className="w-3 h-3" />
              Non-permanen
            </span>
          );
        }
        return "-";
      }
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Manajemen Penduduk
          </h1>
          <p className="text-gray-600">
            Kelola data kependudukan Desa Adat Cengkilung
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchPenduduk()}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={exportLoading || penduduk.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Excel
              </>
            )}
          </motion.button> */}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Tambah Penduduk
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Penduduk</p>
              <p className="text-2xl font-bold text-gray-800">{penduduk.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Laki-laki</p>
              <p className="text-2xl font-bold text-gray-800">
                {penduduk.filter(p => p.jenis_kelamin === 'L').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Perempuan</p>
              <p className="text-2xl font-bold text-gray-800">
                {penduduk.filter(p => p.jenis_kelamin === 'P').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kepala Keluarga</p>
              <p className="text-2xl font-bold text-gray-800">-</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter & Pencarian</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
          </button>
          
          {(filter.search || filter.status || filter.agama) && (
            <button
              onClick={() => setFilter({ status: "", agama: "", search: "" })}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari NIK atau Nama..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  />
                </div>

                <div>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.agama}
                    onChange={(e) => setFilter({ ...filter, agama: e.target.value })}
                  >
                    <option value="">Semua Agama</option>
                    {agamaOptions.map(agama => (
                      <option key={agama} value={agama}>{agama}</option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium">{totalItems}</span> penduduk ditemukan
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
            <p className="text-gray-600">Memuat data penduduk...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((row, index) => (
                  <motion.tr
                    key={row.id_penduduk}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        {col.render 
                          ? col.render(row[col.accessor], row)
                          : row[col.accessor] || '-'
                        }
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(row)}
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id_penduduk)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {[5, 10, 25, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">data per halaman</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600 mr-4">
                  Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
                </span>
                
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Penduduk */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title={editId ? "Edit Data Penduduk" : "Tambah Data Penduduk"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIK <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="16 digit NIK"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  maxLength="16"
                  pattern="\d*"
                  title="NIK harus berupa angka 16 digit"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Masukkan 16 digit angka</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.jenis_kelamin}
                onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                required
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.tanggal_lahir}
                  onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Church className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.agama}
                  onChange={(e) => setForm({ ...form, agama: e.target.value })}
                  required
                >
                  {agamaOptions.map(agama => (
                    <option key={agama} value={agama}>{agama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendidikan Terakhir
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.pendidikan}
                  onChange={(e) => setForm({ ...form, pendidikan: e.target.value })}
                >
                  <option value="">Pilih Pendidikan</option>
                  {pendidikanOptions.map(pend => (
                    <option key={pend} value={pend}>{pend}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pekerjaan
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={form.pekerjaan}
                  onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
                >
                  <option value="">Pilih Pekerjaan</option>
                  {pekerjaanOptions.map(pekerjaan => (
                    <option key={pekerjaan} value={pekerjaan}>{pekerjaan}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Kependudukan <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.status_kependudukan}
                onChange={(e) => setForm({ ...form, status_kependudukan: e.target.value })}
                required
              >
                <option value="permanen">Permanen</option>
                <option value="nonpermanen">Non-permanen</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : (editId ? "Perbarui Data" : "Simpan Data")}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Penduduk */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Penduduk"
        size="lg"
      >
        {selectedPenduduk && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {selectedPenduduk.nama?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedPenduduk.nama}</h3>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Hash className="w-4 h-4" />
                  NIK: {selectedPenduduk.nik}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Jenis Kelamin</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  {selectedPenduduk.jenis_kelamin === 'L' ? (
                    <>
                      <User className="w-4 h-4 text-emerald-600" />
                      Laki-laki
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-amber-600" />
                      Perempuan
                    </>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Tanggal Lahir</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  {formatTanggal(selectedPenduduk.tanggal_lahir)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Usia</p>
                <p className="font-medium text-gray-800">
                  {hitungUmur(selectedPenduduk.tanggal_lahir)} tahun
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Agama</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <Church className="w-4 h-4 text-amber-600" />
                  {selectedPenduduk.agama || '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Pendidikan</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  {selectedPenduduk.pendidikan || '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Pekerjaan</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  {selectedPenduduk.pekerjaan || '-'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {selectedPenduduk.status_kependudukan === 'permanen' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3" />
                      Permanen
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
                      <AlertCircle className="w-3 h-3" />
                      Non-permanen
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">ID Penduduk</p>
                <p className="font-medium text-gray-800">#{selectedPenduduk.id_penduduk}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}


