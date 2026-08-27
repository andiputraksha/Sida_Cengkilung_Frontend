import { useEffect, useState, useMemo } from "react";
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
  BellRing,
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
  HelpCircle,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = `${API_BASE_URL}/dokumen`;
const SURAT_API_URL = `${API_BASE_URL}/surat`;

// Tambahkan DataTables CSS
const dataTablesStyles = `
  .priority-datatable {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  .priority-datatable thead th {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 14px 16px;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .priority-datatable tbody tr {
    transition: all 0.2s ease;
  }
  .priority-datatable tbody tr:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .priority-datatable tbody td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f5;
    vertical-align: middle;
  }
  .priority-datatable .priority-row-merah {
    border-left: 4px solid #ef4444;
    background-color: #fef2f2;
  }
  .priority-datatable .priority-row-kuning {
    border-left: 4px solid #eab308;
    background-color: #fefce8;
  }
  .priority-datatable .priority-row-hijau {
    border-left: 4px solid #22c55e;
    background-color: #f0fdf4;
  }
`;

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
    kategori: "Surat", // Tambah kategori
    jenis_dokumen: "",
    hak_akses: "publik",
    status_dokumen: "aktif",
    file: null
  });
  const [editDokumenId, setEditDokumenId] = useState(null);
  
  const [jenisSuratForm, setJenisSuratForm] = useState({
    kategori: "Surat",
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
  const [dokumenFilter, setDokumenFilter] = useState({ search: "", kategori: "", jenis: "", status: "" });
  const [suratFilter, setSuratFilter] = useState({ search: "", jenis: "", status: "" });
  const [jenisSuratFilter, setJenisSuratFilter] = useState({
    search: "",
    kategori: "",
    status: ""
  });
  const [showDokumenFilters, setShowDokumenFilters] = useState(false);
  const [showSuratFilters, setShowSuratFilters] = useState(false);
  
  // Priority table state
  const [prioritySortField, setPrioritySortField] = useState("prioritas");
  const [prioritySortDirection, setPrioritySortDirection] = useState("asc");
  const [prioritySearchTerm, setPrioritySearchTerm] = useState("");
  const [priorityFilterLevel, setPriorityFilterLevel] = useState("semua");
  const [priorityCurrentPage, setPriorityCurrentPage] = useState(1);
  const [priorityItemsPerPage, setPriorityItemsPerPage] = useState(10);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const token = localStorage.getItem("token");
  
  // ==================== UTILITY FUNCTIONS ====================
  const parseJsonSafely = (value, fallback) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") return value;
    if (typeof value !== "string") return fallback;
    try {
      // Handle case where value might be a string representation of JSON
      const cleaned = value.replace(/[\r\n\s]+/g, ' ').trim();
      const parsed = JSON.parse(cleaned);
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

  const SOP_SURAT_HARI_KERJA = 3;
  const ACTIVE_SURAT_STATUSES = ["MENUNGGU", "DRAFT", "LEGALISASI", "SIAP"];

  const normalizePriorityText = (value) =>
    String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

  const parseDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const addBusinessDays = (date, days) => {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (!isWeekend(result)) added += 1;
    }
    return result;
  };

  const getBusinessDaysElapsed = (startDate, endDate = new Date()) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end <= start) return 0;
    return countBusinessDaysBetween(start, end);
  };

  const countBusinessDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end <= start) return 0;

    let total = 0;
    const cursor = new Date(start);
    while (cursor < end) {
      cursor.setDate(cursor.getDate() + 1);
      if (!isWeekend(cursor)) total += 1;
    }
    return total;
  };

  const getDetailText = (item) =>
    (item.detail_fields || [])
      .map((field) => `${field.field_name || ""} ${field.field_value || ""}`)
      .join(" ");

  const findEventDate = (item) => {
    const dateFieldKeywords = ["tanggal", "dibutuhkan", "diperlukan", "deadline", "dewasa", "pelaksanaan", "kegiatan", "upacara", "karya"];
    const candidates = (item.detail_fields || []).filter((field) =>
      dateFieldKeywords.some((keyword) => normalizePriorityText(field.field_name).includes(keyword))
    );

    for (const field of candidates) {
      const date = parseDateValue(field.field_value);
      if (date) return date;
    }
    return null;
  };

  const getSuratPriority = (item) => {
    const submittedAt = parseDateValue(item.tanggal_pengajuan);
    const slaDeadline = submittedAt ? addBusinessDays(submittedAt, SOP_SURAT_HARI_KERJA) : null;
    const processingBusinessDays = submittedAt ? getBusinessDaysElapsed(submittedAt) : 0;
    const neededDate = findEventDate(item);
    const workdaysLeft = neededDate ? countBusinessDaysBetween(new Date(), neededDate) : null;
    const isOverSop = processingBusinessDays > SOP_SURAT_HARI_KERJA;

    if (workdaysLeft !== null && workdaysLeft <= 2) {
      return {
        level: "merah",
        label: "Prioritas",
        tone: "bg-red-100 text-red-800 border-red-200",
        border: "border-red-500",
        dot: "bg-red-500",
        icon: AlertTriangle,
        order: 1,
        deadline: neededDate,
        slaDeadline,
        processingBusinessDays,
        remainingBusinessDays: workdaysLeft,
        reason: isOverSop
          ? "SOP 3 hari kerja terlampaui dan tanggal surat dibutuhkan <= 2 hari kerja"
          : "Tanggal surat dibutuhkan <= 2 hari kerja, wajib diprioritaskan"
      };
    }

    if ((workdaysLeft !== null && workdaysLeft >= 3 && workdaysLeft <= 4) || isOverSop) {
      return {
        level: "kuning",
        label: "Penting",
        tone: "bg-yellow-100 text-yellow-800 border-yellow-200",
        border: "border-yellow-500",
        dot: "bg-yellow-500",
        icon: AlertCircle,
        order: 2,
        deadline: neededDate,
        slaDeadline,
        processingBusinessDays,
        remainingBusinessDays: workdaysLeft,
        reason: isOverSop
          ? "SOP 3 hari kerja sudah terlampaui, perlu segera dicicil"
          : "Tanggal surat dibutuhkan tersisa 3-4 hari kerja"
      };
    }

    return {
      level: "hijau",
      label: "Rutin / Aman",
      tone: "bg-green-100 text-green-800 border-green-200",
      border: "border-green-500",
      dot: "bg-green-500",
      icon: CheckCircle,
      order: 3,
      deadline: neededDate,
      slaDeadline,
      processingBusinessDays,
      remainingBusinessDays: workdaysLeft,
      reason: workdaysLeft === null
        ? "Tanggal surat dibutuhkan belum terdeteksi, ikuti antrean dasar"
        : "Tanggal surat dibutuhkan masih lebih dari 4 hari kerja"
    };
  };

  const getPriorityBadge = (item) => {
    const priority = getSuratPriority(item);
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${priority.tone}`}>
          <span className={`w-2 h-2 rounded-full ${priority.dot}`}></span>
          {priority.label}
        </span>
        <span className="text-xs text-gray-500">
          {priority.remainingBusinessDays === null
            ? "Tanggal dibutuhkan belum tersedia"
            : priority.remainingBusinessDays === 0
              ? "Dibutuhkan hari ini"
              : `${priority.remainingBusinessDays} hari kerja menuju dibutuhkan`}
        </span>
      </div>
    );
  };

  // Kategori options
  const kategoriOptions = ["Surat", "Dokumen Adat/Desa"];
  
  // Jenis dokumen harus mengikuti master jenis surat
  const jenisDokumenOptions = useMemo(() => {
    return jenisSurat
      .filter((item) => item.status === "aktif")
      .filter((item) => {
        // Filter berdasarkan kategori yang dipilih
        if (dokumenForm.kategori) {
          return item.kategori === dokumenForm.kategori;
        }
        return true;
      })
      .map((item) => item.nama_jenis)
      .filter(Boolean);
  }, [jenisSurat, dokumenForm.kategori]);
  
  // Status surat options
  const statusSuratOptions = [
    { value: "MENUNGGU", label: "Menunggu", color: "orange" },
    { value: "DRAFT", label: "Draft", color: "gray" },
    { value: "LEGALISASI", label: "Legalisasi", color: "purple" },
    { value: "SIAP", label: "Siap", color: "blue" },
    { value: "SELESAI", label: "Selesai", color: "green" }
  ];
  
  // ==================== API CALLS ====================
  
  // Fetch dokumen
  // Ganti fetchDokumen dengan:
  const fetchDokumen = async ({ withLoading = true } = {}) => {
    try {
      if (withLoading) setLoading(true);
      const res = await axios.get(`${API_URL}/admin/semua`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Pastikan setiap dokumen memiliki field kategori yang benar
      const dokumenData = (res.data.data || []).map(item => {
        console.log("Dokumen dari API:", item); // Debug
        return {
          ...item,
                // Preferensi: kategori, kategori_dokumen, jenis_dokumen
                kategori: item.kategori || item.kategori_dokumen || item.jenis_dokumen || "Surat",
                jenis_dokumen: item.jenis_dokumen || item.kategori_dokumen || ""
              };
            });
      
            setDokumen(dokumenData);
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

  // Fetch semua data saat komponen mount
  useEffect(() => {
    const fetchAllDataOnMount = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchDokumen({ withLoading: false }),
          fetchPengajuanSurat({ withLoading: false }),
          fetchJenisSurat({ withLoading: false })
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllDataOnMount();
  }, []);

  // Refresh data saat tab berubah
  useEffect(() => {
    const refreshTabData = async () => {
      try {
        setRefreshing(true);
        
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
      }
    };
    
    refreshTabData();
  }, [activeTab]);

  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      await Promise.all([
        fetchDokumen({ withLoading: false }),
        fetchPengajuanSurat({ withLoading: false }),
        fetchJenisSurat({ withLoading: false })
      ]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };
  
  // ==================== DOKUMEN CRUD ====================
  
  const handleDokumenSubmit = async (e) => {
    e.preventDefault();
    
    if (!dokumenForm.judul_dokumen?.trim() || !dokumenForm.jenis_dokumen?.trim()) {
      alert("Judul dan jenis dokumen wajib diisi");
      return;
    }
    
    if (!dokumenForm.kategori) {
      alert("Kategori dokumen wajib dipilih");
      return;
    }
    
    if (!editDokumenId && !selectedFile) {
      alert("File dokumen wajib diupload");
      return;
    }
    
    const formData = new FormData();
    formData.append("judul_dokumen", dokumenForm.judul_dokumen.trim());
    formData.append("deskripsi_dokumen", dokumenForm.deskripsi_dokumen || "");
    formData.append("kategori", dokumenForm.kategori); // Pastikan ini terkirim
    formData.append("jenis_dokumen", dokumenForm.jenis_dokumen.trim());
    formData.append("hak_akses", dokumenForm.hak_akses || "publik");
    formData.append("status_dokumen", dokumenForm.status_dokumen || "aktif");
    if (selectedFile) formData.append("file", selectedFile);
    
    try {
      setLoading(true);
      
      // Debug: Tampilkan data yang dikirim
      console.log("Data yang dikirim:", {
        judul_dokumen: dokumenForm.judul_dokumen.trim(),
        kategori: dokumenForm.kategori,
        jenis_dokumen: dokumenForm.jenis_dokumen.trim(),
        hak_akses: dokumenForm.hak_akses,
        status_dokumen: dokumenForm.status_dokumen
      });
      
      if (editDokumenId) {
        const response = await axios.put(`${API_URL}/admin/${editDokumenId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });
        console.log("Response update:", response.data);
        alert("Dokumen berhasil diperbarui");
      } else {
        const response = await axios.post(`${API_URL}/admin`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total))
        });
        console.log("Response create:", response.data);
        alert("Dokumen berhasil ditambahkan");
      }
      
      setIsDokumenModalOpen(false);
      resetDokumenForm();
      await fetchDokumen(); // Refresh data
    } catch (error) {
      console.error("Error detail:", error.response?.data || error);
      alert(error.response?.data?.message || "Gagal menyimpan dokumen");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  // Ganti handleEditDokumen dengan:
  const handleEditDokumen = (item) => {
    const safeStatus =
      item?.status_dokumen === "aktif" || item?.status_dokumen === "arsip"
        ? item.status_dokumen
        : "aktif";

    // Ambil kategori dari item, cek beberapa properti yang mungkin dipakai di DB
    const kategori = item?.kategori || item?.kategori_dokumen || item?.jenis_dokumen || "Surat";
    const jenis = item?.jenis_dokumen || item?.kategori_dokumen || "";

    console.log("Edit dokumen - kategori:", kategori, "jenis:", jenis); // Debug

    setDokumenForm({
      judul_dokumen: item?.judul_dokumen || "",
      deskripsi_dokumen: item?.deskripsi_dokumen || "",
      kategori: kategori,
      jenis_dokumen: jenis,
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
    setDokumenForm({ 
      judul_dokumen: "", 
      deskripsi_dokumen: "", 
      kategori: "Surat",
      jenis_dokumen: "", 
      hak_akses: "publik", 
      status_dokumen: "aktif", 
      file: null 
    });
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

    if (!jenisSuratForm.kategori) {
      alert("Kategori dokumen wajib dipilih");
      return;
    }

    if (!jenisSuratForm.nama_jenis?.trim()) {
      alert("Nama jenis dokumen wajib diisi");
      return;
    }

    const data = {
      kategori: jenisSuratForm.kategori,
      nama_jenis: jenisSuratForm.nama_jenis.trim(),
      deskripsi: jenisSuratForm.deskripsi || "",
      status: jenisSuratForm.status || "aktif",
      fields_config: {
        fields: tempFields
      },
      upload_config: jenisSuratForm.upload_config
    };

    try {
      setLoading(true);

      if (editJenisSuratId) {
        await axios.put(
          `${SURAT_API_URL}/jenis/${editJenisSuratId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        alert("Jenis dokumen berhasil diperbarui");
      } else {
        await axios.post(
          `${SURAT_API_URL}/jenis`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        alert("Jenis dokumen berhasil ditambahkan");
      }

      setIsJenisSuratModalOpen(false);
      resetJenisSuratForm();
      await fetchJenisSurat();

    } catch (error) {
      console.error("Error menyimpan jenis dokumen:", error);

      alert(
        error.response?.data?.message ||
        "Gagal menyimpan jenis dokumen"
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditJenisSurat = (item) => {
    const normalizedFieldsConfig = parseJsonSafely(
      item.fields_config,
      { fields: [] }
    );

    const normalizedUploadConfig = parseJsonSafely(
      item.upload_config,
      {
        allow_upload: true,
        max_files: 5,
        max_size_mb: 5,
        allowed_types: ["pdf", "jpg", "png"]
      }
    );

    setJenisSuratForm({
      kategori: item.kategori || "Surat",
      nama_jenis: item.nama_jenis || "",
      deskripsi: item.deskripsi || "",
      status: item.status || "aktif",
      fields_config: normalizedFieldsConfig,
      upload_config: normalizedUploadConfig
    });

    setTempFields(
      Array.isArray(normalizedFieldsConfig?.fields)
        ? normalizedFieldsConfig.fields
        : []
    );

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
      kategori: "Surat",
      nama_jenis: "",
      deskripsi: "",
      status: "aktif",
      fields_config: {
        fields: []
      },
      upload_config: {
        allow_upload: true,
        max_files: 5,
        max_size_mb: 5,
        allowed_types: ["pdf", "jpg", "png"]
      }
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
      LEGALISASI: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: FileCheck, label: "Legalisasi" },
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
  
  const getNextSuratStatus = (status) => {
    switch (status) {
      case "MENUNGGU": return "DRAFT";
      case "DRAFT": return "LEGALISASI";
      case "LEGALISASI": return "SIAP";
      case "SIAP": return "SELESAI";
      case "SELESAI": return "SELESAI";
      default: return status || "";
    }
  };

  const getSuratActionLabel = (status) => {
    switch (status) {
      case "MENUNGGU": return "Verifikasi";
      case "DRAFT": return "Proses Draft";
      case "LEGALISASI": return "TTD & Cap";
      case "SIAP": return "Tandai Diambil";
      case "SELESAI": return "Lihat";
      default: return "Proses";
    }
  };

  const getActionButton = (row) => {
    const nextStatus = getNextSuratStatus(row.status);

    switch (row.status) {
      case "MENUNGGU":
        return (
          <button onClick={() => openSuratModal(row, nextStatus)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
            Verifikasi
          </button>
        );
      case "DRAFT":
        return (
          <button onClick={() => openSuratModal(row, nextStatus)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            Proses Draft
          </button>
        );
      case "LEGALISASI":
        return (
          <button onClick={() => openSuratModal(row, nextStatus)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            TTD & Cap
          </button>
        );
      case "SIAP":
        return (
          <button onClick={() => openSuratModal(row, nextStatus)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            Tandai Diambil
          </button>
        );
      case "SELESAI":
        return (
          <button onClick={() => openSuratModal(row, nextStatus)} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
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
  
  // Pastikan filter kategori bekerja dengan benar
  const filteredDokumen = dokumen.filter(item => {
    if (dokumenFilter.search && !item.judul_dokumen?.toLowerCase().includes(dokumenFilter.search.toLowerCase())) return false;
    
    // Filter kategori - gunakan nilai default jika tidak ada
    if (dokumenFilter.kategori) {
      const itemKategori = item.kategori || item.jenis_dokumen || "";
      if (itemKategori !== dokumenFilter.kategori) return false;
    }
    
    if (dokumenFilter.jenis && item.jenis_dokumen !== dokumenFilter.jenis) return false;
    if (dokumenFilter.status && item.status_dokumen !== dokumenFilter.status) return false;
    return true;
  });
  
  const filteredPengajuan = pengajuanSurat
    .filter(item => {
      if (suratFilter.search && !item.pemohon?.nama_lengkap?.toLowerCase().includes(suratFilter.search.toLowerCase())) return false;
      if (suratFilter.jenis && item.jenis_surat?.id_jenis != suratFilter.jenis) return false;
      if (suratFilter.status && item.status !== suratFilter.status) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityA = getSuratPriority(a);
      const priorityB = getSuratPriority(b);
      if (ACTIVE_SURAT_STATUSES.includes(a.status) !== ACTIVE_SURAT_STATUSES.includes(b.status)) {
        return ACTIVE_SURAT_STATUSES.includes(a.status) ? -1 : 1;
      }
      if (priorityA.order !== priorityB.order) return priorityA.order - priorityB.order;
      const deadlineA = priorityA.deadline?.getTime?.() || Number.MAX_SAFE_INTEGER;
      const deadlineB = priorityB.deadline?.getTime?.() || Number.MAX_SAFE_INTEGER;
      if (deadlineA !== deadlineB) return deadlineA - deadlineB;
      return new Date(b.tanggal_pengajuan || 0) - new Date(a.tanggal_pengajuan || 0);
    });
  
  const filteredJenisSurat = jenisSurat.filter(item => {
    if (
      jenisSuratFilter.search &&
      !item.nama_jenis
        ?.toLowerCase()
        .includes(jenisSuratFilter.search.toLowerCase())
    ) {
      return false;
    }

    if (
      jenisSuratFilter.kategori &&
      item.kategori !== jenisSuratFilter.kategori
    ) {
      return false;
    }

    if (
      jenisSuratFilter.status &&
      item.status !== jenisSuratFilter.status
    ) {
      return false;
    }

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
    LEGALISASI: pengajuanSurat.filter(p => p.status === 'LEGALISASI').length,
    SIAP: pengajuanSurat.filter(p => p.status === 'SIAP').length,
    SELESAI: pengajuanSurat.filter(p => p.status === 'SELESAI').length
  };

  const activePengajuanSurat = pengajuanSurat.filter((item) => ACTIVE_SURAT_STATUSES.includes(item.status));
  const suratPriorityStats = activePengajuanSurat.reduce((acc, item) => {
    const priority = getSuratPriority(item);
    acc[priority.level] = (acc[priority.level] || 0) + 1;
    return acc;
  }, { merah: 0, kuning: 0, hijau: 0 });

  // ==================== PRIORITY DATATABLE LOGIC ====================
  
  const allPriorityData = useMemo(() => {
    return activePengajuanSurat.map((item) => {
      const priority = getSuratPriority(item);
      return {
        ...item,
        priority,
        id: item.id_pengajuan,
        pemohonNama: item.pemohon?.nama_lengkap || "-",
        pemohonEmail: item.pemohon?.email || "-",
        jenisSuratNama: item.jenis_surat?.nama_jenis || "-",
        tanggalPengajuan: item.tanggal_pengajuan,
        status: item.status,
        deadline: priority.deadline,
        remainingDays: priority.remainingBusinessDays,
        reason: priority.reason,
        level: priority.level,
        label: priority.label
      };
    });
  }, [activePengajuanSurat]);

  const filteredPriorityData = useMemo(() => {
    let data = [...allPriorityData];
    
    if (priorityFilterLevel !== "semua") {
      data = data.filter(item => item.level === priorityFilterLevel);
    }
    
    if (prioritySearchTerm) {
      const search = prioritySearchTerm.toLowerCase();
      data = data.filter(item => 
        item.pemohonNama.toLowerCase().includes(search) ||
        item.jenisSuratNama.toLowerCase().includes(search) ||
        item.reason.toLowerCase().includes(search)
      );
    }
    
    data.sort((a, b) => {
      let comparison = 0;
      switch (prioritySortField) {
        case "prioritas":
          comparison = a.priority.order - b.priority.order;
          break;
        case "pemohon":
          comparison = a.pemohonNama.localeCompare(b.pemohonNama);
          break;
        case "jenis":
          comparison = a.jenisSuratNama.localeCompare(b.jenisSuratNama);
          break;
        case "deadline":
          const deadlineA = a.deadline?.getTime?.() || Number.MAX_SAFE_INTEGER;
          const deadlineB = b.deadline?.getTime?.() || Number.MAX_SAFE_INTEGER;
          comparison = deadlineA - deadlineB;
          break;
        case "hari":
          comparison = (a.remainingDays ?? Number.MAX_SAFE_INTEGER) - (b.remainingDays ?? Number.MAX_SAFE_INTEGER);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.priority.order - b.priority.order;
      }
      return prioritySortDirection === "asc" ? comparison : -comparison;
    });
    
    return data;
  }, [allPriorityData, priorityFilterLevel, prioritySearchTerm, prioritySortField, prioritySortDirection]);

  const priorityTotalItems = filteredPriorityData.length;
  const priorityTotalPages = Math.ceil(priorityTotalItems / priorityItemsPerPage);
  const priorityStartIndex = (priorityCurrentPage - 1) * priorityItemsPerPage;
  const priorityEndIndex = priorityStartIndex + priorityItemsPerPage;
  const priorityCurrentItems = filteredPriorityData.slice(priorityStartIndex, priorityEndIndex);

  const handlePrioritySort = (field) => {
    if (prioritySortField === field) {
      setPrioritySortDirection(prioritySortDirection === "asc" ? "desc" : "asc");
    } else {
      setPrioritySortField(field);
      setPrioritySortDirection("asc");
    }
    setPriorityCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (prioritySortField !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return prioritySortDirection === "asc" 
      ? <ChevronUp className="w-4 h-4 text-amber-600" />
      : <ChevronDown className="w-4 h-4 text-amber-600" />;
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
    // Ganti bagian ini di dokumenColumns:
    { 
      header: "KATEGORI", 
      accessor: "kategori",
      render: (value, row) => {
        // Debug untuk melihat nilai kategori
        console.log("Kategori value:", value, "Row:", row);
        
        // Tentukan warna berdasarkan nilai kategori
        const isSurat = value === "Surat";
        const isDokumenAdat = value === "Dokumen Adat/Desa";
        
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            isSurat 
              ? "bg-blue-100 text-blue-800 border-blue-200" 
              : isDokumenAdat
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
          }`}>
            {value || '-'}
          </span>
        );
      }
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
      header: "PRIORITAS",
      accessor: "prioritas",
      render: (_, row) => getPriorityBadge(row)
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
      header: "KATEGORI",
      accessor: "kategori",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            value === "Surat"
              ? "bg-blue-100 text-blue-800 border-blue-200"
              : "bg-purple-100 text-purple-800 border-purple-200"
          }`}
        >
          {value || "-"}
        </span>
      )
    },

    {
      header: "NAMA JENIS",
      accessor: "nama_jenis",
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value || "-"}
        </span>
      )
    },

    {
      header: "DESKRIPSI",
      accessor: "deskripsi",
      render: (value) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {value
            ? value.length > 50
              ? `${value.substring(0, 50)}...`
              : value
            : "-"}
        </span>
      )
    },

    {
      header: "JUMLAH FIELD",
      accessor: "fields_config",
      render: (value) => (
        <span className="text-sm text-gray-700">
          {value?.fields?.length || 0} field
        </span>
      )
    },

    {
      header: "UPLOAD BUKTI",
      accessor: "upload_config",
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            value?.allow_upload
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {value?.allow_upload ? "Ya" : "Tidak"}
        </span>
      )
    },

    {
      header: "STATUS",
      accessor: "status",
      render: (value) => getStatusBadge(value)
    }
  ];

  // Priority Table Columns
  const priorityColumns = [
    { 
      header: "PRIORITAS", 
      field: "prioritas",
      render: (row) => {
        const PriorityIcon = row.priority.icon;
        const levelConfig = {
          merah: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
          kuning: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
          hijau: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" }
        };
        const config = levelConfig[row.level];
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            <PriorityIcon className="w-3.5 h-3.5" />
            {row.label}
          </span>
        );
      }
    },
    { 
      header: "PEMOHON", 
      field: "pemohon",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.pemohonNama}</div>
          <div className="text-xs text-gray-500">{row.pemohonEmail}</div>
        </div>
      )
    },
    { 
      header: "JENIS SURAT", 
      field: "jenis",
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">{row.jenisSuratNama}</span>
      )
    },
    { 
      header: "TANGGAL DIBUTUHKAN", 
      field: "deadline",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm text-gray-700">
            {row.deadline ? formatTanggal(row.deadline) : "-"}
          </span>
        </div>
      )
    },
    { 
      header: "SISA HARI KERJA", 
      field: "hari",
      render: (row) => {
        const days = row.remainingDays;
        if (days === null) return <span className="text-sm text-gray-500">-</span>;
        let colorClass = "text-gray-700";
        if (days <= 1) colorClass = "text-red-600 font-bold";
        else if (days <= 3) colorClass = "text-yellow-600 font-semibold";
        else colorClass = "text-green-600";
        
        return (
          <span className={`text-sm ${colorClass}`}>
            {days === 0 ? "Hari ini" : `${days} hari kerja`}
          </span>
        );
      }
    },
    { 
      header: "STATUS", 
      field: "status",
      render: (row) => getStatusBadge(row.status)
    },
    { 
      header: "ALASAN", 
      field: "alasan",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-600 line-clamp-1">{row.reason}</span>
        </div>
      )
    },
    { 
      header: "AKSI", 
      field: "aksi",
      render: (row) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            openSuratModal(row, getNextSuratStatus(row.status));
          }}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          {getSuratActionLabel(row.status)}
        </button>
      )
    }
  ];
  
  // ==================== RENDER ====================
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-6 space-y-6">
      
      {/* Inject DataTables Styles */}
      <style>{dataTablesStyles}</style>
      
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
              <Plus className="w-5 h-5" /> Tambah Jenis Dokumen
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
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {suratStats.MENUNGGU}
              </span>
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
              
              {(dokumenFilter.search || dokumenFilter.kategori || dokumenFilter.jenis || dokumenFilter.status) && (
                <button
                  onClick={() => setDokumenFilter({ search: "", kategori: "", jenis: "", status: "" })}
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t">
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
                      value={dokumenFilter.kategori} 
                      onChange={(e) => setDokumenFilter({ ...dokumenFilter, kategori: e.target.value })}
                    >
                      <option value="">Semua Kategori</option>
                      {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                      value={dokumenFilter.jenis} 
                      onChange={(e) => setDokumenFilter({ ...dokumenFilter, jenis: e.target.value })}
                    >
                      <option value="">Semua Jenis</option>
                      {jenisSurat.filter(j => j.status === 'aktif').map(j => (
                        <option key={j.nama_jenis} value={j.nama_jenis}>{j.nama_jenis}</option>
                      ))}
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    s.color === 'orange' ? 'bg-orange-100' : 
                    s.color === 'gray' ? 'bg-gray-100' : 
                    s.color === 'purple' ? 'bg-purple-100' : 
                    s.color === 'blue' ? 'bg-blue-100' : 
                    'bg-green-100'
                  }`}>
                    {s.value === 'MENUNGGU' && <Clock className="w-5 h-5 text-orange-600" />}
                    {s.value === 'DRAFT' && <FileText className="w-5 h-5 text-gray-600" />}
                    {s.value === 'LEGALISASI' && <FileCheck className="w-5 h-5 text-purple-600" />}
                    {s.value === 'SIAP' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    {s.value === 'SELESAI' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Notifikasi Prioritas DataTable */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <BellRing className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">Notifikasi Prioritas Penanganan Surat</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Sistem mengurutkan surat aktif berdasarkan SOP <span className="font-medium text-amber-600">2-3 hari kerja</span> dan tanggal surat dibutuhkan (Senin-Jumat).
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                  <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 px-4 py-3 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Merah</p>
                    </div>
                    <p className="text-2xl font-bold text-red-800">{suratPriorityStats.merah || 0}</p>
                    <p className="text-xs text-red-600 mt-0.5">Mendesak</p>
                  </div>
                  <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 px-4 py-3 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Kuning</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-800">{suratPriorityStats.kuning || 0}</p>
                    <p className="text-xs text-yellow-600 mt-0.5">Penting</p>
                  </div>
                  <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 px-4 py-3 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Hijau</p>
                    </div>
                    <p className="text-2xl font-bold text-green-800">{suratPriorityStats.hijau || 0}</p>
                    <p className="text-xs text-green-600 mt-0.5">Rutin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar untuk Priority Table */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari pemohon, jenis surat..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={prioritySearchTerm}
                    onChange={(e) => {
                      setPrioritySearchTerm(e.target.value);
                      setPriorityCurrentPage(1);
                    }}
                  />
                </div>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={priorityFilterLevel}
                  onChange={(e) => {
                    setPriorityFilterLevel(e.target.value);
                    setPriorityCurrentPage(1);
                  }}
                >
                  <option value="semua">Semua Level Prioritas</option>
                  <option value="merah">🔴 Merah - Mendesak</option>
                  <option value="kuning">🟡 Kuning - Penting</option>
                  <option value="hijau">🟢 Hijau - Rutin</option>
                </select>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  value={priorityItemsPerPage}
                  onChange={(e) => {
                    setPriorityItemsPerPage(Number(e.target.value));
                    setPriorityCurrentPage(1);
                  }}
                >
                  <option value="5">5 data per halaman</option>
                  <option value="10">10 data per halaman</option>
                  <option value="25">25 data per halaman</option>
                  <option value="50">50 data per halaman</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-amber-600">{priorityTotalItems}</span> 
                  surat aktif ditemukan
                </div>
              </div>
            </div>

            {/* Priority DataTable */}
            <div className="overflow-x-auto">
              <table className="priority-datatable">
                <thead>
                  <tr>
                    {priorityColumns.map((col, index) => (
                      <th 
                        key={index}
                        onClick={() => col.field !== "aksi" && col.field !== "alasan" && handlePrioritySort(col.field)}
                        className={`${col.field !== "aksi" && col.field !== "alasan" ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {col.header}
                          {col.field !== "aksi" && col.field !== "alasan" && getSortIcon(col.field)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {priorityCurrentItems.length > 0 ? (
                    priorityCurrentItems.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`priority-row-${row.level} cursor-pointer`}
                        onClick={() => openSuratModal(row, getNextSuratStatus(row.status))}
                      >
                        {priorityColumns.map((col, colIndex) => (
                          <td key={colIndex}>
                            {col.render(row)}
                          </td>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={priorityColumns.length} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <BellRing className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Tidak ada surat yang perlu diprioritaskan</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {priorityFilterLevel !== "semua" 
                              ? "Coba ubah filter level prioritas" 
                              : "Semua surat telah selesai diproses"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Priority Table Pagination */}
            {priorityTotalItems > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Menampilkan {priorityTotalItems === 0 ? 0 : priorityStartIndex + 1} - {Math.min(priorityEndIndex, priorityTotalItems)} dari {priorityTotalItems} data
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPriorityCurrentPage(1)}
                      disabled={priorityCurrentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        priorityCurrentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => setPriorityCurrentPage(priorityCurrentPage - 1)}
                      disabled={priorityCurrentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        priorityCurrentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, priorityTotalPages) }, (_, i) => {
                        let pageNum;
                        if (priorityTotalPages <= 5) {
                          pageNum = i + 1;
                        } else if (priorityCurrentPage <= 3) {
                          pageNum = i + 1;
                        } else if (priorityCurrentPage >= priorityTotalPages - 2) {
                          pageNum = priorityTotalPages - 4 + i;
                        } else {
                          pageNum = priorityCurrentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPriorityCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              priorityCurrentPage === pageNum
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPriorityCurrentPage(priorityCurrentPage + 1)}
                      disabled={priorityCurrentPage === priorityTotalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        priorityCurrentPage === priorityTotalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setPriorityCurrentPage(priorityTotalPages)}
                      disabled={priorityCurrentPage === priorityTotalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        priorityCurrentPage === priorityTotalPages
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
          
          {/* Filter Section untuk tabel utama surat */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setShowSuratFilters(!showSuratFilters)} 
                className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter & Pencarian Semua Surat</span>
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
          
          {/* Table Manajemen Surat (Semua) */}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                value={jenisSuratFilter.kategori} 
                onChange={(e) => setJenisSuratFilter({ ...jenisSuratFilter, kategori: e.target.value })}
              >
                <option value="">Semua Kategori</option>
                {kategoriOptions.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
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
          {/* Kategori Dokumen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Dokumen <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={dokumenForm.kategori || ""}
              onChange={(e) => {
                const newKategori = e.target.value;
                console.log("Kategori dipilih:", newKategori); // Debug
                setDokumenForm({
                  ...dokumenForm,
                  kategori: newKategori,
                  jenis_dokumen: "" // Reset jenis dokumen saat kategori berubah
                });
              }}
              required
            >
              <option value="">Pilih Kategori</option>
              {kategoriOptions.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          
          {/* Jenis Dokumen - Filter berdasarkan kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Dokumen <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
              value={dokumenForm.jenis_dokumen} 
              onChange={(e) => setDokumenForm({ ...dokumenForm, jenis_dokumen: e.target.value })} 
              required
              disabled={!dokumenForm.kategori}
            >
              <option value="">
                {dokumenForm.kategori ? "Pilih Jenis Dokumen" : "Pilih Kategori Terlebih Dahulu"}
              </option>
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
              onChange={(e) => { 
                setSelectedFile(e.target.files[0]); 
                setDokumenForm({ ...dokumenForm, file: e.target.files[0] }); 
              }} 
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
                
                {/* Upload File Final */}
                {(suratStatus === "LEGALISASI" || suratStatus === "SIAP") && (
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
                
                {/* Tombol Aksi */}
                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={() => {
                      if ((suratStatus === "LEGALISASI" || suratStatus === "SIAP") && !suratFileFinal) {
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
      <Modal isOpen={isJenisSuratModalOpen} onClose={() => { setIsJenisSuratModalOpen(false); resetJenisSuratForm(); }} title={editJenisSuratId ? "Edit Jenis Dokumen" : "Tambah Jenis Dokumen"} size="xl">
        <form onSubmit={handleJenisSuratSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Kategori - BARU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Dokumen <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={jenisSuratForm.kategori}
              onChange={(e) =>
                setJenisSuratForm({
                  ...jenisSuratForm,
                  kategori: e.target.value
                })
              }
              required
            >
              <option value="">Pilih Kategori</option>
              {kategoriOptions.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          
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
                  
                  <input 
                    type="text" 
                    placeholder="Placeholder" 
                    className="border border-gray-300 rounded-lg p-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                    value={field.placeholder || ""} 
                    onChange={(e) => updateField(idx, "placeholder", e.target.value)} 
                  />
                  
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
                    value={field.options?.join(', ') || ""} 
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
                      <span className="text-xs text-gray-500">Kategori: {selectedDokumen.kategori || "-"}</span>
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
