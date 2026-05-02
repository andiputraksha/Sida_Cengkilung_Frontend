import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { API_BASE_URL, buildAssetUrl } from "@/utils/api";
import {
  FileText,
  Upload,
  Download,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Archive,
  File,
  Users,
  UserCheck,
  Calendar,
  Tag,
  FolderOpen,
  Plus,
  Paperclip,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ExternalLink,
  Settings,
  ListChecks,
  FileWarning,
  FileCheck,
  StickyNote,
  EyeOff,
  Save,
  Printer,
  Link,
  Trash,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Copy,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = `${API_BASE_URL}/dokumen`;
const SURAT_API_URL = `${API_BASE_URL}/surat`;

export default function DokumenPage() {
  // ==================== STATE ====================
  // Tab aktif
  const [activeTab, setActiveTab] = useState("dokumen");
  
  // Data state
  const [dokumen, setDokumen] = useState([]);
  const [pengajuanSurat, setPengajuanSurat] = useState([]);
  const [jenisSurat, setJenisSurat] = useState([]);
  
  // Modal states
  const [isDokumenModalOpen, setIsDokumenModalOpen] = useState(false);
  const [isSuratModalOpen, setIsSuratModalOpen] = useState(false);
  const [isJenisSuratModalOpen, setIsJenisSuratModalOpen] = useState(false);
  const [isDetailDokumenOpen, setIsDetailDokumenOpen] = useState(false);
  const [isSuratPreviewOpen, setIsSuratPreviewOpen] = useState(false);
  const [isLampiranModalOpen, setIsLampiranModalOpen] = useState(false);
  const [isFieldBuilderOpen, setIsFieldBuilderOpen] = useState(false);
  
  // Selected items
  const [selectedDokumen, setSelectedDokumen] = useState(null);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [selectedSuratPreview, setSelectedSuratPreview] = useState(null);
  const [selectedJenisSurat, setSelectedJenisSurat] = useState(null);
  const [selectedLampiran, setSelectedLampiran] = useState(null);
  const [activeSuratTab, setActiveSuratTab] = useState("data");
  
  // Form states
  const [dokumenForm, setDokumenForm] = useState({
    judul_dokumen: "",
    deskripsi_dokumen: "",
    jenis_dokumen: "",
    hak_akses: "publik",
    status_dokumen: "aktif",
    file: null
  });
  const [editDokumenId, setEditDokumenId] = useState(null);
  
  const [jenisSuratForm, setJenisSuratForm] = useState({
    nama_jenis: "",
    deskripsi: "",
    status: "aktif",
    fields_config: { fields: [] },
    upload_config: {
      allow_upload: true,
      max_files: 5,
      max_size_mb: 5,
      allowed_types: ["pdf", "jpg", "png"]
    }
  });
  const [editJenisSuratId, setEditJenisSuratId] = useState(null);
  const [tempFields, setTempFields] = useState([]);
  
  // Surat proses state
  const [suratCatatan, setSuratCatatan] = useState("");
  const [suratNoSurat, setSuratNoSurat] = useState("");
  const [suratFileFinal, setSuratFileFinal] = useState(null);
  const [suratStatus, setSuratStatus] = useState("");
  
  // Filter states
  const [dokumenFilter, setDokumenFilter] = useState({ search: "", jenis: "", status: "" });
  const [suratFilter, setSuratFilter] = useState({ search: "", jenis: "", status: "" });
  const [jenisSuratFilter, setJenisSuratFilter] = useState({ search: "", status: "" });
  const [showDokumenFilters, setShowDokumenFilters] = useState(false);
  const [showSuratFilters, setShowSuratFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const token = localStorage.getItem("token");
  
  const parseJsonSafely = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") return value;
    if (typeof value !== "string") return fallback;
    try {
      const parsed = JSON.parse(value);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const normalizeJenisSurat = (items = []) =>
    items.map((item) => ({
      ...item,
      fields_config: parseJsonSafely(item.fields_config, { fields: [] }),
      upload_config: parseJsonSafely(item.upload_config, {
        allow_upload: true,
        max_files: 5,
        max_size_mb: 5,
        allowed_types: ["pdf", "jpg", "png"]
      })
    }));

  const normalizePengajuan = (items = []) =>
    items.map((item) => ({
      ...item,
      pemohon: item.pemohon || {
        nama_lengkap: item.pemohon_nama || "-",
        email: item.pemohon_email || "-"
      },
      jenis_surat: item.jenis_surat || {
        id_jenis: item.id_jenis,
        nama_jenis: item.nama_jenis || "-"
      },
      detail_fields: item.detail_fields || [],
      lampiran: item.lampiran || [],
      logs: item.logs || []
    }));

  // Jenis dokumen harus mengikuti master jenis surat
  const jenisDokumenOptions = jenisSurat
    .filter((item) => item.status === "aktif")
    .map((item) => item.nama_jenis)
    .filter(Boolean);
  
  // Status surat options
  const statusSuratOptions = [
    { value: "MENUNGGU", label: "Menunggu", color: "orange" },
    { value: "DRAFT", label: "Draft", color: "gray" },
    { value: "LEGALISI", label: "Legalisasi", color: "purple" },
    { value: "SIAP", label: "Siap", color: "blue" },
    { value: "SELESAI", label: "Selesai", color: "green" }
  ];
  
  // ==================== API CALLS ====================
  
  // Fetch dokumen
  const fetchDokumen = async ({ withLoading = true } = {}) => {
    try {
      if (withLoading) setLoading(true);
      const res = await axios.get(`${API_URL}/admin/semua`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDokumen(res.data.data || []);
    } catch (error) {
      console.error("Error fetching dokumen:", error);
      alert("Gagal memuat data dokumen");
    } finally {
      if (withLoading) setLoading(false);
    }
  };
  
  // Fetch pengajuan surat
  const fetchPengajuanSurat = async ({ withLoading = true } = {}) => {
    try {
      if (withLoading) setLoading(true);
      const res = await axios.get(`${SURAT_API_URL}/admin/semua`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPengajuanSurat(normalizePengajuan(res.data.data || []));
    } catch (error) {
      console.error("Error fetching pengajuan surat:", error);
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  const fetchDetailPengajuanAdmin = async (idPengajuan) => {
    const res = await axios.get(`${SURAT_API_URL}/admin/${idPengajuan}/detail`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.data || null;
  };
  
  // Fetch jenis surat
  const fetchJenisSurat = async ({ withLoading = true } = {}) => {
    try {
      if (withLoading) setLoading(true);
      const res = await axios.get(`${SURAT_API_URL}/jenis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJenisSurat(normalizeJenisSurat(res.data.data || []));
    } catch (error) {
      console.error("Error fetching jenis surat:", error);
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      if (activeTab === "dokumen") {
        await Promise.all([
          fetchDokumen({ withLoading: false }),
          fetchJenisSurat({ withLoading: false })
        ]);
      } else if (activeTab === "manajemen_surat") {
        await Promise.all([
          fetchPengajuanSurat({ withLoading: false }),
          fetchJenisSurat({ withLoading: false })
        ]);
      } else {
        await fetchJenisSurat({ withLoading: false });
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefreshData();
  }, [activeTab]);
  
  // ==================== DOKUMEN CRUD ====================
  
  const handleDokumenSubmit = async (e) => {
    e.preventDefault();
    
    if (!dokumenForm.judul_dokumen?.trim() || !dokumenForm.jenis_dokumen?.trim()) {
      alert("Judul dan jenis dokumen wajib diisi");
      return;
    }
    
    if (!editDokumenId && !selectedFile) {
      alert("File dokumen wajib diupload");
      return;
    }
    
    const formData = new FormData();
    formData.append("judul_dokumen", dokumenForm.judul_dokumen.trim());
    formData.append("deskripsi_dokumen", dokumenForm.deskripsi_dokumen || "");
    formData.append("jenis_dokumen", dokumenForm.jenis_dokumen.trim());
    formData.append("hak_akses", dokumenForm.hak_akses || "publik");
    formData.append("status_dokumen", dokumenForm.status_dokumen || "aktif");
    if (selectedFile) formData.append("file", selectedFile);
    
    try {
      setLoading(true);
      if (editDokumenId) {
        await axios.put(`${API_URL}/admin/${editDokumenId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });
        alert("Dokumen berhasil diperbarui");
      } else {
        await axios.post(`${API_URL}/admin`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });
        alert("Dokumen berhasil ditambahkan");
      }
      setIsDokumenModalOpen(false);
      resetDokumenForm();
      fetchDokumen();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan dokumen");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  const handleEditDokumen = (item) => {
    const safeStatus =
      item?.status_dokumen === "aktif" || item?.status_dokumen === "arsip"
        ? item.status_dokumen
        : "aktif";

    setDokumenForm({
      judul_dokumen: item?.judul_dokumen || "",
      deskripsi_dokumen: item?.deskripsi_dokumen || "",
      jenis_dokumen: item?.jenis_dokumen || "",
      hak_akses: item?.hak_akses === "terbatas" ? "terbatas" : "publik",
      status_dokumen: safeStatus,
      file: null
    });
    setEditDokumenId(item.id_dokumen);
    setSelectedFile(null);
    setIsDokumenModalOpen(true);
  };
  
  const handleDeleteDokumen = async (id) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    try {
      await axios.delete(`${API_URL}/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Dokumen berhasil dihapus");
      fetchDokumen();
    } catch (error) {
      alert("Gagal menghapus dokumen");
    }
  };
  
  const resetDokumenForm = () => {
    setDokumenForm({ judul_dokumen: "", deskripsi_dokumen: "", jenis_dokumen: "", hak_akses: "publik", status_dokumen: "aktif", file: null });
    setEditDokumenId(null);
    setSelectedFile(null);
    setUploadProgress(0);
  };
  
  // ==================== SURAT PROCESSING ====================
  
  const handleUpdateStatusSurat = async (id, status, catatan = "", noSurat = null, fileFinal = null) => {
    try {
      const formData = new FormData();
      formData.append("status", status);
      if (catatan) formData.append("catatan_admin", catatan);
      if (noSurat) formData.append("no_surat", noSurat);
      if (fileFinal) formData.append("file_final", fileFinal);
      
      await axios.put(`${SURAT_API_URL}/admin/${id}/status`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      
      alert(`Status surat berhasil diubah menjadi ${status}`);
      fetchPengajuanSurat();
      setIsSuratModalOpen(false);
      setSelectedPengajuan(null);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal mengupdate status surat");
    }
  };
  
  const openSuratModal = async (pengajuan, actionStatus) => {
    try {
      setLoading(true);
      const detailData = await fetchDetailPengajuanAdmin(pengajuan.id_pengajuan);
      const normalizedDetail = detailData ? normalizePengajuan([detailData])[0] : pengajuan;

      setSelectedPengajuan(normalizedDetail);
      setSuratStatus(actionStatus);
      setSuratCatatan(normalizedDetail?.catatan_admin || "");
      setSuratNoSurat(normalizedDetail?.no_surat || "");
      setSuratFileFinal(null);
      setActiveSuratTab("data");
      setIsSuratModalOpen(true);
    } catch (error) {
      alert(error.response?.data?.message || "Gagal memuat detail pengajuan surat");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSuratPreview = (pengajuan) => {
    setSelectedSuratPreview(pengajuan);
    setIsSuratPreviewOpen(true);
  };
  
  // ==================== JENIS SURAT CRUD ====================
  
  const handleJenisSuratSubmit = async (e) => {
    e.preventDefault();
    if (!jenisSuratForm.nama_jenis) {
      alert("Nama jenis surat wajib diisi");
      return;
    }
    
    const data = {
      ...jenisSuratForm,
      fields_config: { fields: tempFields }
    };
    
    try {
      setLoading(true);
      if (editJenisSuratId) {
        await axios.put(`${SURAT_API_URL}/jenis/${editJenisSuratId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Jenis surat berhasil diperbarui");
      } else {
        await axios.post(`${SURAT_API_URL}/jenis`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Jenis surat berhasil ditambahkan");
      }
      setIsJenisSuratModalOpen(false);
      resetJenisSuratForm();
      fetchJenisSurat();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan jenis surat");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditJenisSurat = (item) => {
    const normalizedFieldsConfig = parseJsonSafely(item.fields_config, { fields: [] });
    const normalizedUploadConfig = parseJsonSafely(item.upload_config, {
      allow_upload: true,
      max_files: 5,
      max_size_mb: 5,
      allowed_types: ["pdf", "jpg", "png"]
    });

    setJenisSuratForm({
      nama_jenis: item.nama_jenis,
      deskripsi: item.deskripsi || "",
      status: item.status,
      fields_config: normalizedFieldsConfig,
      upload_config: normalizedUploadConfig
    });
    setTempFields(normalizedFieldsConfig?.fields || []);
    setEditJenisSuratId(item.id_jenis);
    setIsJenisSuratModalOpen(true);
  };

  const handleDeleteJenisSurat = async (id) => {
    if (!confirm("Yakin ingin menghapus jenis surat ini?")) return;

    try {
      setLoading(true);
      await axios.delete(`${SURAT_API_URL}/jenis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Jenis surat berhasil dihapus");
      fetchJenisSurat();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus jenis surat");
    } finally {
      setLoading(false);
    }
  };
  
  const resetJenisSuratForm = () => {
    setJenisSuratForm({
      nama_jenis: "",
      deskripsi: "",
      status: "aktif",
      fields_config: { fields: [] },
      upload_config: { allow_upload: true, max_files: 5, max_size_mb: 5, allowed_types: ["pdf", "jpg", "png"] }
    });
    setTempFields([]);
    setEditJenisSuratId(null);
  };
  
  // Field builder functions
  const addField = () => {
    setTempFields([...tempFields, { name: "", label: "", type: "text", required: false, placeholder: "", options: [] }]);
  };
  
  const updateField = (index, key, value) => {
    const updated = [...tempFields];
    updated[index][key] = value;
    setTempFields(updated);
  };
  
  const removeField = (index) => {
    const updated = tempFields.filter((_, i) => i !== index);
    setTempFields(updated);
  };
  
  const toggleAllowedType = (fileType, checked) => {
    const currentTypes = jenisSuratForm.upload_config?.allowed_types || [];
    let nextTypes = [...currentTypes];

    if (checked && !nextTypes.includes(fileType)) {
      nextTypes.push(fileType);
    }
    if (!checked) {
      nextTypes = nextTypes.filter((type) => type !== fileType);
    }

    setJenisSuratForm({
      ...jenisSuratForm,
      upload_config: {
        ...jenisSuratForm.upload_config,
        allowed_types: nextTypes
      }
    });
  };

  // ==================== UTILITIES ====================
  
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  
  const formatTanggal = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const getStatusBadge = (status) => {
    const config = {
      aktif: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Aktif" },
      nonaktif: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Nonaktif" },
      arsip: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Archive, label: "Arsip" },
      MENUNGGU: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Clock, label: "Menunggu" },
      DRAFT: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: FileText, label: "Draft" },
      LEGALISI: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: FileCheck, label: "Legalisasi" },
      SIAP: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle, label: "Siap" },
      SELESAI: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Selesai" }
    };
    const c = config[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle, label: status || "-" };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${c.color}`}>
        <Icon className="w-3 h-3" /> {c.label}
      </span>
    );
  };
  
  const getActionButton = (row) => {
    switch (row.status) {
      case "MENUNGGU":
        return (
          <button onClick={() => openSuratModal(row, "DRAFT")} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
            Verifikasi
          </button>
        );
      case "DRAFT":
        return (
          <button onClick={() => openSuratModal(row, "LEGALISI")} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            Proses Draft
          </button>
        );
      case "LEGALISI":
        return (
          <button onClick={() => openSuratModal(row, "SIAP")} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            TTD & Cap
          </button>
        );
      case "SIAP":
        return (
          <button onClick={() => openSuratModal(row, "SELESAI")} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            Tandai Diambil
          </button>
        );
      case "SELESAI":
        return (
          <button onClick={() => openSuratModal(row, "SELESAI")} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
            Lihat
          </button>
        );
      default:
        return <span className="text-sm text-gray-500">-</span>;
    }
  };
  
  const getFileIcon = (filename) => {
    if (!filename) return <File className="w-5 h-5" />;
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-600" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-amber-600" />;
  };
  
  // ==================== FILTERS & PAGINATION ====================
  
  const filteredDokumen = dokumen.filter(item => {
    if (dokumenFilter.search && !item.judul_dokumen?.toLowerCase().includes(dokumenFilter.search.toLowerCase())) return false;
    if (dokumenFilter.jenis && item.jenis_dokumen !== dokumenFilter.jenis) return false;
    if (dokumenFilter.status && item.status_dokumen !== dokumenFilter.status) return false;
    return true;
  });
  
  const filteredPengajuan = pengajuanSurat.filter(item => {
    if (suratFilter.search && !item.pemohon?.nama_lengkap?.toLowerCase().includes(suratFilter.search.toLowerCase())) return false;
    if (suratFilter.jenis && item.jenis_surat?.id_jenis != suratFilter.jenis) return false;
    if (suratFilter.status && item.status !== suratFilter.status) return false;
    return true;
  });
  
  const filteredJenisSurat = jenisSurat.filter(item => {
    if (jenisSuratFilter.search && !item.nama_jenis?.toLowerCase().includes(jenisSuratFilter.search.toLowerCase())) return false;
    if (jenisSuratFilter.status && item.status !== jenisSuratFilter.status) return false;
    return true;
  });
  
  const totalItems = activeTab === "dokumen" ? filteredDokumen.length : 
                     activeTab === "manajemen_surat" ? filteredPengajuan.length : 
                     filteredJenisSurat.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = activeTab === "dokumen" ? filteredDokumen.slice(startIndex, endIndex) :
                       activeTab === "manajemen_surat" ? filteredPengajuan.slice(startIndex, endIndex) :
                       filteredJenisSurat.slice(startIndex, endIndex);
  
  const handlePageChange = (page) => { 
    setCurrentPage(page); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Stats
  const dokumenStats = {
    total: dokumen.length,
    aktif: dokumen.filter(d => d.status_dokumen === 'aktif').length,
    arsip: dokumen.filter(d => d.status_dokumen === 'arsip').length
  };
  
  const suratStats = {
    MENUNGGU: pengajuanSurat.filter(p => p.status === 'MENUNGGU').length,
    DRAFT: pengajuanSurat.filter(p => p.status === 'DRAFT').length,
    LEGALISI: pengajuanSurat.filter(p => p.status === 'LEGALISI').length,
    SIAP: pengajuanSurat.filter(p => p.status === 'SIAP').length,
    SELESAI: pengajuanSurat.filter(p => p.status === 'SELESAI').length
  };

  // ==================== COLUMN DEFINITIONS ====================
  
  const dokumenColumns = [
    { 
      header: "DOKUMEN", 
      accessor: "judul_dokumen",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            {getFileIcon(row.file_path)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value || '-'}</div>
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {row.deskripsi_dokumen ? `${row.deskripsi_dokumen.substring(0, 50)}...` : "-"}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "JENIS", 
      accessor: "jenis_dokumen",
      render: (value) => (
        <span className="text-sm text-gray-700">{value || '-'}</span>
      )
    },
    { 
      header: "HAK AKSES", 
      accessor: "hak_akses",
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          value === "terbatas" 
            ? "bg-orange-100 text-orange-800 border-orange-200" 
            : "bg-emerald-100 text-emerald-800 border-emerald-200"
        }`}>
          {value === "terbatas" ? "Terbatas" : "Publik"}
        </span>
      )
    },
    { 
      header: "STATUS", 
      accessor: "status_dokumen",
      render: (value) => getStatusBadge(value)
    },
    { 
      header: "TANGGAL UPLOAD", 
      accessor: "tanggal_upload",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">{formatDate(value)}</span>
        </div>
      )
    }
  ];

  const suratColumns = [
    { 
      header: "PEMOHON", 
      accessor: "pemohon",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value?.nama_lengkap || '-'}</div>
          <div className="text-xs text-gray-500">{value?.email || '-'}</div>
        </div>
      )
    },
    { 
      header: "JENIS SURAT", 
      accessor: "jenis_surat",
      render: (value) => (
        <span className="text-sm text-gray-700">{value?.nama_jenis || '-'}</span>
      )
    },
    { 
      header: "TANGGAL", 
      accessor: "tanggal_pengajuan",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">{formatTanggal(value)}</span>
        </div>
      )
    },
    { 
      header: "STATUS", 
      accessor: "status",
      render: (value) => getStatusBadge(value)
    },
    { 
      header: "FILE SURAT", 
      accessor: "file_final",
      render: (value, row) => (
        value ? (
          <button 
            onClick={() => handleOpenSuratPreview(row)} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
          >
            <Eye className="w-4 h-4" /> Lihat Surat
          </button>
        ) : (
          <span className="text-xs text-gray-400">Belum ada file</span>
        )
      )
    }
  ];

  const jenisSuratColumns = [
    { 
      header: "NAMA JENIS", 
      accessor: "nama_jenis",
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    { 
      header: "DESKRIPSI", 
      accessor: "deskripsi",
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {value ? `${value.substring(0, 50)}...` : "-"}
        </span>
      )
    },
    { 
      header: "JUMLAH FIELD", 
      accessor: "fields_config",
      render: (value) => (
        <span className="text-sm text-gray-700">{value?.fields?.length || 0} field</span>
      )
    },
    { 
      header: "UPLOAD BUKTI", 
      accessor: "upload_config",
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
          value?.allow_upload 
            ? "bg-green-100 text-green-800 border-green-200" 
            : "bg-gray-100 text-gray-800 border-gray-200"
        }`}>
          {value?.allow_upload ? 'Ya' : 'Tidak'}
        </span>
      )
    },
    { 
      header: "STATUS", 
      accessor: "status",
      render: (value) => getStatusBadge(value)
    }
  ];
  
  // ==================== RENDER ====================
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Layanan Desa</h1>
          <p className="text-gray-600">Kelola dokumen desa, proses surat masyarakat, dan atur jenis surat adat</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefreshData} 
            disabled={refreshing || loading}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${(refreshing || loading) ? "animate-spin" : ""}`} />
          </motion.button>
          {activeTab === "dokumen" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { resetDokumenForm(); setIsDokumenModalOpen(true); }}
              className="bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" /> Tambah Dokumen
            </motion.button>
          )}
          {activeTab === "master_jenis_surat" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { resetJenisSuratForm(); setIsJenisSuratModalOpen(true); }}
              className="bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" /> Tambah Jenis Surat
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Tab Navigation - 3 TABS */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button 
            onClick={() => { setActiveTab("dokumen"); setCurrentPage(1); }}
            className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
              activeTab === "dokumen" 
                ? "border-b-2 border-amber-600 text-amber-600 font-medium" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4" /> Dokumen Desa
          </button>
          <button 
            onClick={() => { setActiveTab("manajemen_surat"); setCurrentPage(1); }}
            className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
              activeTab === "manajemen_surat" 
                ? "border-b-2 border-amber-600 text-amber-600 font-medium" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" /> Manajemen Surat
            {suratStats.MENUNGGU > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{suratStats.MENUNGGU}</span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab("master_jenis_surat"); setCurrentPage(1); }}
            className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
              activeTab === "master_jenis_surat" 
                ? "border-b-2 border-amber-600 text-amber-600 font-medium" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" /> Master Jenis Surat
          </button>
        </nav>
      </div>
      
      {/* ==================== TAB 1: DOKUMEN DESA ==================== */}
      {activeTab === "dokumen" && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-600"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Dokumen</p>
                  <p className="text-2xl font-bold text-gray-800">{dokumenStats.total}</p>
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
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dokumen Aktif</p>
                  <p className="text-2xl font-bold text-gray-800">{dokumenStats.aktif}</p>
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
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dokumen Arsip</p>
                  <p className="text-2xl font-bold text-gray-800">{dokumenStats.arsip}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Archive className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setShowDokumenFilters(!showDokumenFilters)} 
                className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter & Pencarian</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showDokumenFilters ? 'rotate-90' : ''}`} />
              </button>
              
              {(dokumenFilter.search || dokumenFilter.jenis || dokumenFilter.status) && (
                <button
                  onClick={() => setDokumenFilter({ search: "", jenis: "", status: "" })}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
            <AnimatePresence>
              {showDokumenFilters && (
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
                        placeholder="Cari dokumen..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                        value={dokumenFilter.search} 
                        onChange={(e) => setDokumenFilter({ ...dokumenFilter, search: e.target.value })} 
                      />
                    </div>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      value={dokumenFilter.jenis} 
                      onChange={(e) => setDokumenFilter({ ...dokumenFilter, jenis: e.target.value })}
                    >
                      <option value="">Semua Jenis</option>
                      {jenisDokumenOptions.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      value={dokumenFilter.status} 
                      onChange={(e) => setDokumenFilter({ ...dokumenFilter, status: e.target.value })}
                    >
                      <option value="">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="arsip">Arsip</option>
                    </select>
                    <div className="text-sm text-gray-600 flex items-center">
                      <span className="font-medium">{filteredDokumen.length}</span> data ditemukan
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Table Dokumen */}
          {loading && dokumen.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                <p className="text-gray-600">Memuat data dokumen...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {dokumenColumns.map((col, index) => (
                        <th key={index} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {col.header}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((row, index) => (
                        <motion.tr 
                          key={row.id_dokumen} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          {dokumenColumns.map((col, colIndex) => (
                            <td key={colIndex} className="px-6 py-4">
                              {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] || '-')}
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => { setSelectedDokumen(row); setIsDetailDokumenOpen(true); }} 
                                className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditDokumen(row)} 
                                className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteDokumen(row.id_dokumen)} 
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={dokumenColumns.length + 1} className="px-6 py-12 text-center text-gray-500">
                          Tidak ada data dokumen
                        </td>
                      </tr>
                    )}
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
                      Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
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
        </>
      )}
      
      {/* ==================== TAB 2: MANAJEMEN SURAT ==================== */}
      {activeTab === "manajemen_surat" && (
        <>
          {/* Stats Cards 5 status */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {statusSuratOptions.map((s, index) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className={`bg-white rounded-xl shadow-lg p-4 border-l-4 ${
                  s.color === 'orange' ? 'border-orange-500' : 
                  s.color === 'gray' ? 'border-gray-500' : 
                  s.color === 'purple' ? 'border-purple-500' : 
                  s.color === 'blue' ? 'border-blue-500' : 
                  'border-green-500'
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{suratStats[s.value] || 0}</p>
                  </div>
                  <div className={`w-10 h-10 bg-${s.color}-100 rounded-xl flex items-center justify-center`}>
                    {s.value === 'MENUNGGU' && <Clock className="w-5 h-5 text-orange-600" />}
                    {s.value === 'DRAFT' && <FileText className="w-5 h-5 text-gray-600" />}
                    {s.value === 'LEGALISI' && <FileCheck className="w-5 h-5 text-purple-600" />}
                    {s.value === 'SIAP' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    {s.value === 'SELESAI' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setShowSuratFilters(!showSuratFilters)} 
                className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter & Pencarian</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showSuratFilters ? 'rotate-90' : ''}`} />
              </button>
              
              {(suratFilter.search || suratFilter.jenis || suratFilter.status) && (
                <button
                  onClick={() => setSuratFilter({ search: "", jenis: "", status: "" })}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
            <AnimatePresence>
              {showSuratFilters && (
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
                        placeholder="Cari pemohon..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                        value={suratFilter.search} 
                        onChange={(e) => setSuratFilter({ ...suratFilter, search: e.target.value })} 
                      />
                    </div>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      value={suratFilter.jenis} 
                      onChange={(e) => setSuratFilter({ ...suratFilter, jenis: e.target.value })}
                    >
                      <option value="">Semua Jenis Surat</option>
                      {jenisSurat.filter(j => j.status === 'aktif').map(j => (
                        <option key={j.id_jenis} value={j.id_jenis}>{j.nama_jenis}</option>
                      ))}
                    </select>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      value={suratFilter.status} 
                      onChange={(e) => setSuratFilter({ ...suratFilter, status: e.target.value })}
                    >
                      <option value="">Semua Status</option>
                      {statusSuratOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <div className="text-sm text-gray-600 flex items-center">
                      <span className="font-medium">{filteredPengajuan.length}</span> data ditemukan
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Table Manajemen Surat */}
          {loading && pengajuanSurat.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                <p className="text-gray-600">Memuat data pengajuan surat...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {suratColumns.map((col, index) => (
                        <th key={index} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {col.header}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((row, index) => (
                        <motion.tr 
                          key={row.id_pengajuan} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          {suratColumns.map((col, colIndex) => (
                            <td key={colIndex} className="px-6 py-4">
                              {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] || '-')}
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            {getActionButton(row)}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={suratColumns.length + 1} className="px-6 py-12 text-center text-gray-500">
                          Tidak ada data pengajuan surat
                        </td>
                      </tr>
                    )}
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
                      Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
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
        </>
      )}
      
      {/* ==================== TAB 3: MASTER JENIS SURAT ==================== */}
      {activeTab === "master_jenis_surat" && (
        <>
          {/* Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari jenis surat..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                  value={jenisSuratFilter.search} 
                  onChange={(e) => setJenisSuratFilter({ ...jenisSuratFilter, search: e.target.value })} 
                />
              </div>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                value={jenisSuratFilter.status} 
                onChange={(e) => setJenisSuratFilter({ ...jenisSuratFilter, status: e.target.value })}
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
              <div className="text-sm text-gray-600 flex items-center">
                <span className="font-medium">{filteredJenisSurat.length}</span> data ditemukan
              </div>
            </div>
          </div>
          
          {/* Table Master Jenis Surat */}
          {loading && jenisSurat.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                <p className="text-gray-600">Memuat data jenis surat...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {jenisSuratColumns.map((col, index) => (
                        <th key={index} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {col.header}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((row, index) => (
                        <motion.tr 
                          key={row.id_jenis} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          {jenisSuratColumns.map((col, colIndex) => (
                            <td key={colIndex} className="px-6 py-4">
                              {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] || '-')}
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEditJenisSurat(row)} 
                                className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteJenisSurat(row.id_jenis)} 
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={jenisSuratColumns.length + 1} className="px-6 py-12 text-center text-gray-500">
                          Tidak ada data jenis surat
                        </td>
                      </tr>
                    )}
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
                      Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
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
        </>
      )}
      
      {/* ==================== MODAL DOKUMEN ==================== */}
      <Modal isOpen={isDokumenModalOpen} onClose={() => { setIsDokumenModalOpen(false); resetDokumenForm(); }} title={editDokumenId ? "Edit Dokumen" : "Tambah Dokumen"} size="lg">
        <form onSubmit={handleDokumenSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Dokumen <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={dokumenForm.judul_dokumen} 
              onChange={(e) => setDokumenForm({ ...dokumenForm, judul_dokumen: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Dokumen <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={dokumenForm.jenis_dokumen} 
              onChange={(e) => setDokumenForm({ ...dokumenForm, jenis_dokumen: e.target.value })} 
              required
            >
              <option value="">Pilih Jenis Dokumen</option>
              {jenisDokumenOptions.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hak Akses</label>
            <select 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={dokumenForm.hak_akses} 
              onChange={(e) => setDokumenForm({ ...dokumenForm, hak_akses: e.target.value })}
            >
              <option value="publik">Publik</option>
              <option value="terbatas">Terbatas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              rows="3" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={dokumenForm.deskripsi_dokumen} 
              onChange={(e) => setDokumenForm({ ...dokumenForm, deskripsi_dokumen: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={dokumenForm.status_dokumen} 
              onChange={(e) => setDokumenForm({ ...dokumenForm, status_dokumen: e.target.value })}
            >
              <option value="aktif">Aktif</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Dokumen {!editDokumenId && <span className="text-red-500">*</span>}
            </label>
            <input 
              type="file" 
              accept=".pdf" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              onChange={(e) => { setSelectedFile(e.target.files[0]); setDokumenForm({ ...dokumenForm, file: e.target.files[0] }); }} 
            />
            {editDokumenId && <p className="text-xs text-amber-600 mt-1">*Kosongkan jika tidak ingin mengubah file</p>}
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-600 rounded-full h-2" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-amber-600 mt-1">Upload: {uploadProgress}%</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : (editDokumenId ? "Perbarui" : "Simpan")}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsDokumenModalOpen(false); resetDokumenForm(); }} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
      
      {/* ==================== MODAL DETAIL SURAT (ADMIN) 3 TABS ==================== */}
      <Modal isOpen={isSuratModalOpen} onClose={() => { setIsSuratModalOpen(false); setSelectedPengajuan(null); }} title="Detail Pengajuan Surat" size="xl">
        {selectedPengajuan && (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="border-b flex gap-4">
              {["data", "lampiran", "log"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveSuratTab(tab)} 
                  className={`pb-2 px-1 transition-colors ${
                    activeSuratTab === tab 
                      ? "border-b-2 border-amber-600 text-amber-600 font-medium" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "data" ? "Data Surat" : tab === "lampiran" ? "Lampiran" : "Log Aktivitas"}
                </button>
              ))}
            </div>
            
            {/* TAB 1: Data Surat */}
            {activeSuratTab === "data" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Informasi Pemohon dan Status */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Nama Pemohon</p>
                    <p className="font-medium text-gray-800">{selectedPengajuan.pemohon?.nama_lengkap || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{selectedPengajuan.pemohon?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Surat</p>
                    <p className="font-medium text-gray-800">{selectedPengajuan.jenis_surat?.nama_jenis || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pengajuan</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedPengajuan.tanggal_pengajuan)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(selectedPengajuan.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nomor Surat</p>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      value={suratNoSurat} 
                      onChange={(e) => setSuratNoSurat(e.target.value)} 
                      placeholder="Isi nomor surat" 
                    />
                  </div>
                </div>
                
                {/* Dynamic Fields */}
                {selectedPengajuan.detail_fields && selectedPengajuan.detail_fields.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-gray-800">Data Pengajuan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPengajuan.detail_fields.map((f, i) => {
                        const fieldsConfig = selectedPengajuan.jenis_surat?.fields_config || { fields: [] };
                        const fieldConfig = fieldsConfig.fields?.find(cfg => cfg.name === f.field_name);
                        
                        let displayLabel = f.field_label || f.field_name || "Field";
                        
                        if (fieldConfig?.label) {
                          displayLabel = fieldConfig.label;
                        } else if (!f.field_label && f.field_name) {
                          displayLabel = f.field_name
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        }
                        
                        return (
                          <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">{displayLabel}</p>
                            <p className="text-sm text-gray-800 font-medium break-words">
                              {f.field_value || '-'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Catatan Admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Admin</label>
                  <textarea 
                    rows="3" 
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                    value={suratCatatan} 
                    onChange={(e) => setSuratCatatan(e.target.value)} 
                    placeholder="Tambah catatan untuk masyarakat..." 
                  />
                </div>
                
                {/* Upload File Final - dengan validasi required untuk status LEGALISI dan SIAP */}
                {(suratStatus === "LEGALISI" || suratStatus === "SIAP") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File Final Surat (PDF) 
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" 
                        onChange={(e) => setSuratFileFinal(e.target.files[0])} 
                      />
                      {suratFileFinal && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> File siap
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ File PDF hasil legalisasi surat WAJIB diupload sebelum menyimpan perubahan.
                    </p>
                  </div>
                )}
                
                {/* Tombol Aksi - dengan validasi file required */}
                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={() => {
                      // Validasi untuk status LEGALISI dan SIAP: file final wajib diupload
                      if ((suratStatus === "LEGALISI" || suratStatus === "SIAP") && !suratFileFinal) {
                        alert("File final surat (PDF) wajib diupload sebelum menyimpan perubahan!");
                        return;
                      }
                      handleUpdateStatusSurat(selectedPengajuan.id_pengajuan, suratStatus, suratCatatan, suratNoSurat, suratFileFinal);
                    }} 
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Simpan & Update Status
                  </button>
                  <button 
                    onClick={() => setIsSuratModalOpen(false)} 
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
            
            {/* TAB 2: Lampiran */}
            {activeSuratTab === "lampiran" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedPengajuan.lampiran && selectedPengajuan.lampiran.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPengajuan.lampiran.map((file, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Paperclip className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{file.nama_file}</p>
                            <p className="text-xs text-gray-500">
                              {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : 'Ukuran tidak diketahui'}
                            </p>
                          </div>
                        </div>
                        <a 
                          href={buildAssetUrl(file.file_path)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Paperclip className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Tidak ada lampiran</p>
                    <p className="text-xs text-gray-400 mt-1">Pemohon tidak mengupload file lampiran</p>
                  </div>
                )}
              </div>
            )}
            
            {/* TAB 3: Log Aktivitas */}
            {activeSuratTab === "log" && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {selectedPengajuan.logs && selectedPengajuan.logs.length > 0 ? (
                  selectedPengajuan.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border-l-4 border-amber-600 bg-gray-50 rounded-r-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{log.aktivitas || 'Update Status'}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(log.created_at)} - oleh {log.admin?.nama_lengkap || 'Admin'}
                        </p>
                        {log.detail && <p className="text-xs text-gray-600 mt-1">{log.detail}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Belum ada aktivitas</p>
                    <p className="text-xs text-gray-400 mt-1">Log aktivitas akan muncul saat admin memproses surat</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* ==================== MODAL JENIS SURAT ==================== */}
      <Modal isOpen={isJenisSuratModalOpen} onClose={() => { setIsJenisSuratModalOpen(false); resetJenisSuratForm(); }} title={editJenisSuratId ? "Edit Jenis Surat" : "Tambah Jenis Surat"} size="xl">
        <form onSubmit={handleJenisSuratSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Jenis Surat <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={jenisSuratForm.nama_jenis} 
              onChange={(e) => setJenisSuratForm({ ...jenisSuratForm, nama_jenis: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              rows="2" 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={jenisSuratForm.deskripsi} 
              onChange={(e) => setJenisSuratForm({ ...jenisSuratForm, deskripsi: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={jenisSuratForm.status} 
              onChange={(e) => setJenisSuratForm({ ...jenisSuratForm, status: e.target.value })}
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          
          {/* Field Builder Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Field Builder</h4>
              <button 
                type="button" 
                onClick={addField} 
                className="text-amber-600 hover:text-amber-700 text-sm flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Field
              </button>
            </div>
            {tempFields.map((field, idx) => (
              <div key={idx} className="border-t pt-3 mt-3 first:border-t-0 first:pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Nama Field (snake_case)" 
                    className="border border-gray-300 rounded-lg p-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                    value={field.name} 
                    onChange={(e) => updateField(idx, "name", e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="Label Field (contoh: Nama Kegiatan)" 
                    className="border border-gray-300 rounded-lg p-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                    value={field.label} 
                    onChange={(e) => updateField(idx, "label", e.target.value)} 
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <select 
                    className="border border-gray-300 rounded-lg p-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                    value={field.type} 
                    onChange={(e) => updateField(idx, "type", e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                  </select>
                  <label className="flex items-center gap-1 text-sm">
                    <input 
                      type="checkbox" 
                      checked={field.required} 
                      onChange={(e) => updateField(idx, "required", e.target.checked)} 
                    /> Wajib
                  </label>
                  <button 
                    type="button" 
                    onClick={() => removeField(idx)} 
                    className="text-red-600 hover:text-red-700 text-sm transition-colors"
                  >
                    Hapus
                  </button>
                </div>
                {field.type === 'select' && (
                  <input 
                    type="text" 
                    placeholder="Opsi (pisahkan dengan koma)" 
                    className="w-full border border-gray-300 rounded-lg p-1 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                    value={field.options?.join(', ')} 
                    onChange={(e) => updateField(idx, "options", e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                  />
                )}
              </div>
            ))}
            {tempFields.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Belum ada field. Klik "Tambah Field" untuk menambahkan.
              </p>
            )}
          </div>
          
          {/* Upload Config */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3 text-gray-800">Konfigurasi Upload Bukti</h4>
            <label className="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                checked={jenisSuratForm.upload_config?.allow_upload} 
                onChange={(e) => setJenisSuratForm({ 
                  ...jenisSuratForm, 
                  upload_config: { ...jenisSuratForm.upload_config, allow_upload: e.target.checked } 
                })} 
              /> Aktifkan Upload Bukti
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Maksimal File</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                  value={jenisSuratForm.upload_config?.max_files || 5} 
                  onChange={(e) => setJenisSuratForm({ 
                    ...jenisSuratForm, 
                    upload_config: { ...jenisSuratForm.upload_config, max_files: parseInt(e.target.value) } 
                  })} 
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Maksimal Ukuran (MB)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  className="w-full border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                  value={jenisSuratForm.upload_config?.max_size_mb || 5} 
                  onChange={(e) => setJenisSuratForm({ 
                    ...jenisSuratForm, 
                    upload_config: { ...jenisSuratForm.upload_config, max_size_mb: parseInt(e.target.value) } 
                  })} 
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="text-sm text-gray-600">Format yang Diizinkan</label>
              <div className="flex gap-3 mt-1">
                {["pdf", "jpg", "png", "doc"].map(f => (
                  <label key={f} className="flex items-center gap-1">
                    <input 
                      type="checkbox" 
                      checked={jenisSuratForm.upload_config?.allowed_types?.includes(f)} 
                      onChange={(e) => toggleAllowedType(f, e.target.checked)} 
                    /> {f.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Menyimpan..." : (editJenisSuratId ? "Perbarui" : "Simpan")}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsJenisSuratModalOpen(false); resetJenisSuratForm(); }} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Modal Detail Dokumen (Preview) */}
      <Modal isOpen={isDetailDokumenOpen} onClose={() => setIsDetailDokumenOpen(false)} title="Preview Dokumen" size="xl">
        {selectedDokumen && (
          <div className="space-y-4">
            {(() => {
              const previewUrl = buildAssetUrl(selectedDokumen.file_path);
              return (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-gray-800">{selectedDokumen.judul_dokumen}</h3>
                    <p className="text-gray-600 text-sm mt-1">{selectedDokumen.deskripsi_dokumen}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-gray-500">Jenis: {selectedDokumen.jenis_dokumen}</span>
                      <span className="text-xs text-gray-500">Tanggal: {formatDate(selectedDokumen.tanggal_upload)}</span>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-gray-100 h-[60vh]">
                    {previewUrl ? (
                      <iframe src={previewUrl} className="w-full h-full" title="Preview Dokumen" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                        File dokumen belum tersedia untuk dipreview.
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
            <div className="flex justify-end">
              <button 
                onClick={() => setIsDetailDokumenOpen(false)} 
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Preview Surat Final */}
      <Modal isOpen={isSuratPreviewOpen} onClose={() => { setIsSuratPreviewOpen(false); setSelectedSuratPreview(null); }} title="Preview Surat Final" size="xl">
        {selectedSuratPreview && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-gray-800">{selectedSuratPreview.jenis_surat?.nama_jenis || "Surat"}</h3>
              <p className="text-gray-600 text-sm mt-1">Pemohon: {selectedSuratPreview.pemohon?.nama_lengkap || "-"}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span>Status: {selectedSuratPreview.status || "-"}</span>
                <span>No. Surat: {selectedSuratPreview.no_surat || "-"}</span>
              </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-gray-100 h-[65vh]">
              {selectedSuratPreview.file_final ? (
                <iframe src={buildAssetUrl(selectedSuratPreview.file_final)} className="w-full h-full" title="Preview Surat Final" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  File surat final belum tersedia.
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => { setIsSuratPreviewOpen(false); setSelectedSuratPreview(null); }} 
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal Lampiran Preview */}
      <Modal isOpen={isLampiranModalOpen} onClose={() => { setIsLampiranModalOpen(false); setSelectedLampiran(null); }} title="Preview Lampiran" size="xl">
        {selectedLampiran && (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-gray-100 h-[60vh]">
              <iframe src={selectedLampiran.previewUrl} className="w-full h-full" title="Preview" />
            </div>
            <div className="flex justify-end gap-2">
              <a 
                href={selectedLampiran.downloadUrl} 
                download 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Download
              </a>
              <button 
                onClick={() => setIsLampiranModalOpen(false)} 
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
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