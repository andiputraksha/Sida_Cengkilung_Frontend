import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { API_BASE_URL } from "@/utils/api";
import {
  Users,
  UserPlus,
  UserCog,
  UserCheck,
  UserX,
  Search,
  Filter,
  X,
  Mail,
  Lock,
  User,
  Shield,
  Calendar,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  ShieldAlert,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = `${API_BASE_URL}/pengguna`;

export default function PenggunaPage() {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    role: "masyarakat",
    nomor_hp: "",
    status_akun: "aktif",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    role: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawUsers = res.data.data || [];
      const normalizedUsers = rawUsers.map((item) => ({
        id: item.id_pengguna,
        id_pengguna: item.id_pengguna,
        nama: item.nama_lengkap || "",
        email: item.email || "",
        role: item.role || "masyarakat",
        status_akun: item.status_akun || "aktif",
        nomor_hp: item.nomor_hp || "",
        tanggal_daftar: item.tanggal_daftar || item.tanggal_daftar_formatted || null,
        terakhir_login: item.terakhir_login || item.terakhir_login_formatted || null,
      }));
      setUsers(normalizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama?.trim() || !form.email?.trim()) {
      alert("Nama dan email wajib diisi");
      return;
    }

    if (!editId && !form.password) {
      alert("Password wajib diisi untuk pengguna baru");
      return;
    }

    const payload = {
      nama_lengkap: form.nama.trim(),
      email: form.email.trim(),
      role: form.role,
      nomor_hp: form.nomor_hp?.trim() || null,
      status_akun: form.status_akun || "aktif",
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      setLoading(true);
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Pengguna berhasil diperbarui");
      } else {
        await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Pengguna berhasil ditambahkan");
      }

      setIsOpen(false);
      setEditId(null);
      setForm({ nama: "", email: "", password: "", role: "masyarakat", nomor_hp: "", status_akun: "aktif" });
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "Gagal menyimpan pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({ 
      nama: user.nama, 
      email: user.email, 
      password: "", 
      role: user.role,
      nomor_hp: user.nomor_hp || "",
      status_akun: user.status_akun || "aktif",
    });
    setEditId(user.id);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Pengguna berhasil dihapus");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Gagal menghapus pengguna");
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { 
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: ShieldCheck,
        label: "Admin"
      },
      masyarakat: { 
        color: "bg-green-100 text-green-800 border-green-200",
        icon: UserCheck,
        label: "Masyarakat"
      }
    };
    
    const config = roleConfig[role] || roleConfig.masyarakat;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      aktif: "bg-green-100 text-green-800 border-green-200",
      nonaktif: "bg-red-100 text-red-800 border-red-200"
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.aktif}`}>
        {status === 'aktif' ? (
          <Activity className="w-3 h-3" />
        ) : (
          <UserX className="w-3 h-3" />
        )}
        {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
      </span>
    );
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    if (filter.role && user.role !== filter.role) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        user.nama?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredUsers.slice(startIndex, endIndex);

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
      header: "Pengguna", 
      accessor: "nama",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            {value?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Role", 
      accessor: "role",
      render: (value) => getRoleBadge(value)
    },
    { 
      header: "Status", 
      accessor: "status_akun",
      render: (value) => getStatusBadge(value)
    },
    { 
      header: "No. HP", 
      accessor: "nomor_hp",
      render: (value) => value || '-'
    },
    { 
      header: "Terakhir Login", 
      accessor: "terakhir_login",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(value)}</span>
        </div>
      )
    },
    { 
      header: "Tanggal Daftar", 
      accessor: "tanggal_daftar",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
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
            Manajemen Pengguna
          </h1>
          <p className="text-gray-600">
            Kelola semua pengguna sistem informasi desa
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchUsers()}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditId(null);
              setForm({ nama: "", email: "", password: "", role: "masyarakat", nomor_hp: "", status_akun: "aktif" });
              setIsOpen(true);
            }}
            className="bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Tambah Pengguna
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
              <p className="text-sm text-gray-600 mb-1">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
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
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Admin</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Masyarakat</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'masyarakat').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-600 mb-1">Aktif</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.status_akun === 'aktif').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-600" />
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
          
          {(filter.search || filter.role) && (
            <button
              onClick={() => setFilter({ role: "", search: "" })}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  />
                </div>

                <div>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.role}
                    onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                  >
                    <option value="">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="masyarakat">Masyarakat</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium">{totalItems}</span> pengguna ditemukan
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
            <p className="text-gray-600">Memuat data pengguna...</p>
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
                    key={row.id}
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
                          onClick={() => handleDelete(row.id)}
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

      {/* Modal Tambah/Edit Pengguna */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditId(null);
          setForm({ nama: "", email: "", password: "", role: "masyarakat", nomor_hp: "", status_akun: "aktif" });
        }}
        title={editId ? "Edit Pengguna" : "Tambah Pengguna"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Masukkan email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!editId && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder={editId ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editId}
              />
            </div>
            {editId && (
              <p className="text-xs text-gray-500 mt-1">
                *Kosongkan jika tidak ingin mengubah password
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="masyarakat">Masyarakat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor HP
            </label>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={form.nomor_hp}
              onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Akun
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={form.status_akun}
              onChange={(e) => setForm({ ...form, status_akun: e.target.value })}
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>

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
                setEditId(null);
                setForm({ nama: "", email: "", password: "", role: "masyarakat", nomor_hp: "", status_akun: "aktif" });
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Pengguna */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detail Pengguna"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {selectedUser.nama?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedUser.nama}</h3>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <div className="flex items-center gap-2">
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedUser.status_akun)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">No. HP</p>
                <p className="font-medium text-gray-800">
                  {selectedUser.nomor_hp || '-'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">ID Pengguna</p>
                <p className="font-medium text-gray-800">#{selectedUser.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Tanggal Daftar</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selectedUser.tanggal_daftar)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Terakhir Login</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selectedUser.terakhir_login)}
                </p>
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



