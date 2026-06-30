import { useEffect, useState, useRef } from "react";
import axios from "axios";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { API_BASE_URL, BACKEND_BASE_URL } from "@/utils/api";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  Calendar,
  User,
  Tag,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = `${API_BASE_URL}/konten`;

const compareByNumber = (a, b, key, direction = 'asc') => {
  const aValue = Number(a?.[key] ?? 0);
  const bValue = Number(b?.[key] ?? 0);
  return direction === 'asc' ? aValue - bValue : bValue - aValue;
};

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function KontenPage() {
  const [konten, setKonten] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedKonten, setSelectedKonten] = useState(null);
  const [form, setForm] = useState({
    judul: "",
    ringkasan: "",
    isi_konten: "",
    id_kategori_konten: "",
    status_konten: "draft",
    tanggal_publikasi: "",
    thumbnail: null
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [filter, setFilter] = useState({
    status: "semua",
    kategori: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Tambahan: state untuk melacak apakah tanggal diubah
  const [isDateChanged, setIsDateChanged] = useState(false);
  // Simpan nilai original tanggal saat edit
  const originalDateRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("token");

  // Fetch semua konten untuk admin
  const fetchKontenAdmin = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/semua`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // PERBAIKAN: Sorting default diubah ke DESCENDING agar data terbaru muncul di paling atas
      const sortedData = [...(res.data.data || [])].sort((a, b) =>
        compareByNumber(a, b, 'id_konten', 'desc')
      );
      
      setKonten(sortedData);
    } catch (error) {
      console.error("Error fetching konten:", error);
      alert("Gagal memuat data konten");
    } finally {
      setLoading(false);
    }
  };

  // Fetch kategori konten
  const fetchKategori = async () => {
    try {
      const res = await axios.get(`${API_URL}/kategori`);
      setKategori(res.data.data || []);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  useEffect(() => {
    fetchKontenAdmin();
    fetchKategori();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Hanya file gambar yang diperbolehkan");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }

      setSelectedFile(file);
      setForm({ ...form, thumbnail: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.judul || !form.isi_konten || !form.id_kategori_konten) {
      alert("Judul, isi konten, dan kategori wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("judul", form.judul);
    formData.append("ringkasan", form.ringkasan || "");
    formData.append("isi_konten", form.isi_konten);
    formData.append("id_kategori_konten", form.id_kategori_konten);
    formData.append("status_konten", form.status_konten);
    
    // PERBAIKAN: Hanya kirim tanggal_publikasi jika user benar-benar mengubahnya
    // Saat tambah data baru, selalu kirim tanggal
    // Saat edit, hanya kirim jika tanggal diubah
    if (!editId) {
      // Mode tambah baru: selalu kirim tanggal (termasuk string kosong)
      formData.append("tanggal_publikasi", form.tanggal_publikasi || "");
    } else {
      // Mode edit: hanya kirim tanggal jika user mengubahnya
      if (isDateChanged) {
        formData.append("tanggal_publikasi", form.tanggal_publikasi || "");
      }
      // Jika tidak diubah, jangan kirim field tanggal_publikasi sama sekali
    }
    
    if (selectedFile) {
      formData.append("thumbnail", selectedFile);
    }

    try {
      setLoading(true);
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        alert("Konten berhasil diperbarui");
      } else {
        await axios.post(API_URL, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        alert("Konten berhasil ditambahkan");
      }

      setIsOpen(false);
      resetForm();
      fetchKontenAdmin();
    } catch (error) {
      console.error("Error saving konten:", error);
      alert(error.response?.data?.message || "Gagal menyimpan konten");
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Default sort config diubah ke DESCENDING
  const [sortConfig, setSortConfig] = useState({
    key: 'id_konten',
    direction: 'desc'
  });

  const handleEdit = (item) => {
    const dateValue = toDateTimeLocalValue(item.tanggal_publikasi);
    
    setForm({
      judul: item.judul,
      ringkasan: item.ringkasan || "",
      isi_konten: item.isi_konten,
      id_kategori_konten: item.id_kategori_konten,
      status_konten: item.status_konten,
      tanggal_publikasi: dateValue,
      thumbnail: null
    });
    setEditId(item.id_konten);
    setPreviewImage(item.thumbnail ? `${BACKEND_BASE_URL}/${item.thumbnail}` : null);
    
    // PERBAIKAN: Simpan nilai original tanggal dan reset flag perubahan
    originalDateRef.current = dateValue;
    setIsDateChanged(false);
    
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus konten ini?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Konten berhasil dihapus");
      fetchKontenAdmin();
    } catch (error) {
      console.error("Error deleting konten:", error);
      alert("Gagal menghapus konten");
    }
  };

  const handleViewDetail = (item) => {
    setSelectedKonten(item);
    setIsDetailOpen(true);
  };

  const resetForm = () => {
    setForm({
      judul: "",
      ringkasan: "",
      isi_konten: "",
      id_kategori_konten: "",
      status_konten: "draft",
      tanggal_publikasi: "",
      thumbnail: null
    });
    setEditId(null);
    setSelectedFile(null);
    setPreviewImage(null);
    // PERBAIKAN: Reset flag perubahan tanggal
    setIsDateChanged(false);
    originalDateRef.current = null;
  };

  // PERBAIKAN: Handler khusus untuk perubahan tanggal
  const handleDateChange = (e) => {
    setForm({ ...form, tanggal_publikasi: e.target.value });
    // Tandai bahwa tanggal telah diubah (hanya untuk mode edit)
    if (editId) {
      setIsDateChanged(true);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { 
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
        label: "Draft"
      },
      published: { 
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Published"
      },
      archived: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Archive,
        label: "Archived"
      }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Fungsi untuk sorting data
  const sortData = (data, config) => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      if (config.key === 'id_konten') {
        return compareByNumber(a, b, config.key, config.direction);
      }

      let aValue = a[config.key];
      let bValue = b[config.key];
      
      // Handle date values
      if (config.key.includes('tanggal') || config.key.includes('created') || config.key.includes('updated')) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Handle null/undefined values
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return compareByNumber(a, b, 'id_konten', config.direction);
    });
  };

  // Filter dan sort konten
  const filteredAndSortedKonten = sortData(
    konten.filter(item => {
      if (filter.status !== "semua" && item.status_konten !== filter.status) return false;
      if (filter.kategori && item.id_kategori_konten != filter.kategori) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          item.judul.toLowerCase().includes(searchLower) ||
          (item.ringkasan && item.ringkasan.toLowerCase().includes(searchLower)) ||
          (item.isi_konten && item.isi_konten.toLowerCase().includes(searchLower))
        );
      }
      return true;
    }),
    sortConfig
  );

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Pagination logic
  const totalItems = filteredAndSortedKonten.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAndSortedKonten.slice(startIndex, endIndex);

  // PERBAIKAN: Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortConfig]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const columns = [
    { 
      header: "Judul", 
      accessor: "judul",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0">
            {row.thumbnail ? (
              <img 
                src={`${BACKEND_BASE_URL}/${row.thumbnail}`} 
                alt={value}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 line-clamp-1">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              ID: {row.id_konten}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Kategori", 
      accessor: "nama_kategori",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-sm text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: "status_konten",
      render: (value) => getStatusBadge(value)
    },
    { 
      header: "Penulis", 
      accessor: "penulis",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    { 
      header: "Tanggal Publikasi", 
      accessor: "tanggal_publikasi",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDateOnly(value)}</span>
        </div>
      )
    },
    { 
      header: "Diperbaharui", 
      accessor: "tanggal_diperbarui",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(value)}</span>
        </div>
      )
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
            Manajemen Konten
          </h1>
          <p className="text-gray-600">
            Kelola semua konten berita dan informasi desa
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchKontenAdmin()}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah Konten
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
              <p className="text-sm text-gray-600 mb-1">Total Konten</p>
              <p className="text-2xl font-bold text-gray-800">{konten.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Published</p>
              <p className="text-2xl font-bold text-gray-800">
                {konten.filter(item => item.status_konten === 'published').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Draft</p>
              <p className="text-2xl font-bold text-gray-800">
                {konten.filter(item => item.status_konten === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Archived</p>
              <p className="text-2xl font-bold text-gray-800">
                {konten.filter(item => item.status_konten === 'archived').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Archive className="w-6 h-6 text-yellow-600" />
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
          
          {(filter.search || filter.status !== "semua" || filter.kategori) && (
            <button
              onClick={() => setFilter({ status: "semua", kategori: "", search: "" })}
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
                    placeholder="Cari judul, ringkasan, isi..."
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
                    <option value="semua">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.kategori}
                    onChange={(e) => setFilter({ ...filter, kategori: e.target.value })}
                  >
                    <option value="">Semua Kategori</option>
                    {kategori.map((item) => (
                      <option key={item.id_kategori_konten} value={item.id_kategori_konten}>
                        {item.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium">{totalItems}</span> data ditemukan
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
            <p className="text-gray-600">Memuat data konten...</p>
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
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(col.accessor)}
                    >
                      <div className="flex items-center gap-1">
                        {col.header}
                        {sortConfig.key === col.accessor && (
                          <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Tidak ada data konten</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {filter.search || filter.status !== "semua" || filter.kategori 
                            ? "Coba ubah filter pencarian" 
                            : "Silakan tambahkan konten baru"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((row, index) => (
                    <motion.tr
                      key={row.id_konten}
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
                            onClick={() => handleDelete(row.id_konten)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
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
          )}
        </div>
      )}

      {/* Modal Tambah/Edit Konten */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title={editId ? "Edit Konten" : "Tambah Konten"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ringkasan
              </label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Isi Konten <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="10"
                className="w-full border border-gray-300 p-2 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.isi_konten}
                onChange={(e) => setForm({ ...form, isi_konten: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.id_kategori_konten}
                onChange={(e) => setForm({ ...form, id_kategori_konten: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {kategori.map((item) => (
                  <option key={item.id_kategori_konten} value={item.id_kategori_konten}>
                    {item.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.status_konten}
                onChange={(e) => setForm({ ...form, status_konten: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Publikasi
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.tanggal_publikasi}
                onChange={handleDateChange}
              />
              {editId && !isDateChanged && (
                <p className="text-xs text-blue-500 mt-1">
                  *Tanggal publikasi tidak akan berubah jika tidak diubah
                </p>
              )}
              {editId && isDateChanged && (
                <p className="text-xs text-amber-500 mt-1">
                  *Tanggal publikasi akan diperbarui
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                onChange={handleFileChange}
              />
              {editId && (
                <p className="text-xs text-gray-500 mt-1">
                  *Kosongkan jika tidak ingin mengubah thumbnail
                </p>
              )}
            </div>
          </div>

          {previewImage && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-amber-200" />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : (editId ? "Perbarui" : "Simpan")}
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

      {/* Modal Detail Konten */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Konten"
        size="xl"
      >
        {selectedKonten && (
          <div className="space-y-6">
            {selectedKonten.thumbnail && (
              <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600">
                <img
                  src={`${BACKEND_BASE_URL}/${selectedKonten.thumbnail}`}
                  alt={selectedKonten.judul}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedKonten.judul}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{selectedKonten.penulis}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span>{selectedKonten.nama_kategori}</span>
                </div>
                <span className="text-gray-400">•</span>
                {getStatusBadge(selectedKonten.status_konten)}
              </div>
            </div>

            {selectedKonten.ringkasan && (
              <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-lg">
                <p className="text-gray-700 italic">{selectedKonten.ringkasan}</p>
              </div>
            )}

            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {selectedKonten.isi_konten}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tanggal Publikasi</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(selectedKonten.tanggal_publikasi)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Terakhir Diperbaharui</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(selectedKonten.tanggal_diperbarui)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

// Komponen Archive untuk status
function Archive(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}