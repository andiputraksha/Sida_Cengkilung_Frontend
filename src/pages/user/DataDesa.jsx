import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getToken, getUser, isAuthenticated, isMasyarakat } from "@/utils/auth";
import { API_BASE_URL, buildAssetUrl } from "@/utils/api";
import {
  FileText,
  File,
  Eye,
  Send,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Lock,
  Globe,
  Calendar,
  User,
  ChevronRight,
  Upload,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Paperclip,
  Download,
  Eye as EyeIcon,
  FileWarning,
  FileCheck,
  StickyNote,
  Printer,
  ChevronDown,
  ChevronUp,
  ListChecks,
  FileSignature,
  LogIn,
  ArrowUp,
  ArrowDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==================== DATATABLES CSS STYLES ====================
const dataTablesStyles = `
  .status-datatable {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  .status-datatable thead th {
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
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    white-space: nowrap;
  }
  .status-datatable thead th:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  }
  .status-datatable thead th.no-sort {
    cursor: default;
  }
  .status-datatable thead th.no-sort:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }
  .status-datatable tbody tr {
    transition: all 0.2s ease;
  }
  .status-datatable tbody tr:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .status-datatable tbody td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f5;
    vertical-align: middle;
  }
  .status-datatable .status-row-MENUNGGU {
    border-left: 4px solid #f97316;
  }
  .status-datatable .status-row-DRAFT {
    border-left: 4px solid #6b7280;
  }
  .status-datatable .status-row-LEGALISI {
    border-left: 4px solid #a855f7;
  }
  .status-datatable .status-row-SIAP {
    border-left: 4px solid #3b82f6;
  }
  .status-datatable .status-row-SELESAI {
    border-left: 4px solid #22c55e;
  }
  @media (max-width: 768px) {
    .status-datatable thead th,
    .status-datatable tbody td {
      padding: 10px 8px;
      font-size: 0.7rem;
    }
  }
`;

export default function DataDesa() {
  const DEFAULT_UPLOAD_CONFIG = {
    allow_upload: true,
    max_files: 5,
    max_size_mb: 5,
    allowed_types: ["pdf", "jpg", "png"]
  };

  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState("dokumen");
  
  // Data state
  const [dokumen, setDokumen] = useState([]);
  const [jenisSurat, setJenisSurat] = useState([]);
  const [pengajuanSaya, setPengajuanSaya] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pengajuanTimeFilter, setPengajuanTimeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // ==================== DATATABLE STATE UNTUK STATUS SURAT ====================
  const [statusSearchTerm, setStatusSearchTerm] = useState("");
  const [statusSortField, setStatusSortField] = useState("tanggal");
  const [statusSortDirection, setStatusSortDirection] = useState("desc");
  const [statusCurrentPage, setStatusCurrentPage] = useState(1);
  const [statusItemsPerPage, setStatusItemsPerPage] = useState(10);
  const [statusFilterJenisSurat, setStatusFilterJenisSurat] = useState("");
  
  // Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDokumen, setSelectedDokumen] = useState(null);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  
  // Form Ajukan Surat states
  const [selectedJenisSurat, setSelectedJenisSurat] = useState(null);
  const [formFields, setFormFields] = useState({});
  const [lampiranFiles, setLampiranFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  // Upload config dari jenis surat
  const [uploadConfig, setUploadConfig] = useState({
    ...DEFAULT_UPLOAD_CONFIG
  });
  
  const user = getUser();
  const isLoggedIn = isAuthenticated();
  const isUserMasyarakat = isMasyarakat();
  
  // Status surat options untuk filter
  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "MENUNGGU", label: "Menunggu", color: "orange" },
    { value: "DRAFT", label: "Draft", color: "gray" },
    { value: "LEGALISI", label: "Legalisasi", color: "purple" },
    { value: "SIAP", label: "Siap", color: "blue" },
    { value: "SELESAI", label: "Selesai", color: "green" }
  ];

  const pengajuanTimeOptions = [
    { value: "all", label: "Semua Pengajuan" },
    { value: "7", label: "7 Hari Terakhir" },
    { value: "30", label: "1 Bulan Terakhir" },
    { value: "90", label: "3 Bulan Terakhir" },
    { value: "180", label: "6 Bulan Terakhir" },
    { value: "365", label: "1 Tahun Terakhir" },
    { value: "over365", label: "Lebih dari 1 Tahun" }
  ];
  
  // ==================== API CALLS ====================
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

  const normalizeFieldsConfig = (rawFieldsConfig) => {
    const parsed = parseJsonSafely(rawFieldsConfig, { fields: [] });
    const fields = Array.isArray(parsed?.fields) ? parsed.fields : [];

    return {
      fields: fields
        .map((field) => ({
          name: field?.name || "",
          label: field?.label || field?.name || "Field",
          type: field?.type || "text",
          required: Boolean(field?.required),
          placeholder: field?.placeholder || "",
          options: Array.isArray(field?.options)
            ? field.options
            : typeof field?.options === "string"
              ? field.options.split(",").map((s) => s.trim()).filter(Boolean)
              : []
        }))
        .filter((field) => field.name)
    };
  };

  const normalizeUploadConfig = (rawUploadConfig) => {
    const parsed = parseJsonSafely(rawUploadConfig, DEFAULT_UPLOAD_CONFIG);
    const allowedTypesRaw = Array.isArray(parsed?.allowed_types)
      ? parsed.allowed_types
      : typeof parsed?.allowed_types === "string"
        ? parsed.allowed_types.split(",")
        : DEFAULT_UPLOAD_CONFIG.allowed_types;

    const allowedTypes = [...new Set(
      allowedTypesRaw
        .map((type) => String(type || "").toLowerCase().trim().replace(/^\./, ""))
        .filter(Boolean)
    )];

    return {
      allow_upload: parsed?.allow_upload !== false,
      max_files: Number(parsed?.max_files) > 0 ? Number(parsed.max_files) : DEFAULT_UPLOAD_CONFIG.max_files,
      max_size_mb: Number(parsed?.max_size_mb) > 0 ? Number(parsed.max_size_mb) : DEFAULT_UPLOAD_CONFIG.max_size_mb,
      allowed_types: allowedTypes.length > 0 ? allowedTypes : DEFAULT_UPLOAD_CONFIG.allowed_types
    };
  };

  const normalizeJenisSuratItem = (item) => ({
    ...item,
    fields_config: normalizeFieldsConfig(item?.fields_config),
    upload_config: normalizeUploadConfig(item?.upload_config)
  });

  const normalizePengajuanItem = (item) => ({
    ...item,
    jenis_surat: item?.jenis_surat || {
      id_jenis: item?.id_jenis,
      nama_jenis: item?.nama_jenis || "-"
    },
    detail_fields: item?.detail_fields || [],
    lampiran: item?.lampiran || []
  });
  
  // Fetch dokumen publik (tanpa login)
  const fetchDokumenPublik = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/dokumen/publik`);
      const data = res.data?.success ? res.data.data : [];
      setDokumen(data.filter(d => d.status_dokumen === 'aktif'));
    } catch (err) {
      console.error("Error fetching dokumen:", err);
      setDokumen([]);
      setError("Gagal memuat data dokumen publik");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch jenis surat aktif (hanya jika login)
  const fetchJenisSurat = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/surat/jenis/aktif`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const normalizedJenis = (res.data?.data || []).map(normalizeJenisSuratItem);
      setJenisSurat(normalizedJenis);
    } catch (err) {
      console.error("Error fetching jenis surat:", err);
    }
  };
  
  // Fetch pengajuan surat saya (hanya jika login)
  const fetchPengajuanSaya = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/surat/pengajuan/saya`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPengajuanSaya((res.data?.data || []).map(normalizePengajuanItem));
    } catch (err) {
      console.error("Error fetching pengajuan saya:", err);
    }
  };
  
  // Initial fetch - selalu fetch dokumen publik
  useEffect(() => {
    fetchDokumenPublik();
  }, []);
  
  // Fetch data yang memerlukan login ketika user login
  useEffect(() => {
    if (isLoggedIn && isUserMasyarakat) {
      fetchJenisSurat();
      fetchPengajuanSaya();
    }
  }, [isLoggedIn, isUserMasyarakat]);
  
  // ==================== DOKUMEN FUNCTIONS ====================
  
  const handlePreview = (dokumen) => {
    setSelectedDokumen(dokumen);
    setIsPreviewModalOpen(true);
  };
  
  // ==================== AJUKAN SURAT FUNCTIONS ====================
  
  const handleJenisSuratChange = (jenisId) => {
    const parsedId = parseInt(jenisId, 10);
    const jenis = jenisSurat.find(j => j.id_jenis === parsedId) || null;

    setSelectedJenisSurat(jenis);
    setFormFields({});
    setLampiranFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setUploadConfig(jenis?.upload_config || { ...DEFAULT_UPLOAD_CONFIG });
    setSubmitError("");
  };
  
  const handleFieldChange = (fieldName, value) => {
    setFormFields(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const config = uploadConfig || DEFAULT_UPLOAD_CONFIG;
    if (files.length === 0) return;
    
    if (lampiranFiles.length + files.length > config.max_files) {
      setSubmitError(`Maksimal ${config.max_files} file lampiran`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    for (const file of files) {
      if (file.size > config.max_size_mb * 1024 * 1024) {
        setSubmitError(`Ukuran file ${file.name} melebihi ${config.max_size_mb}MB`);
        return;
      }
      
      const ext = file.name.split('.').pop().toLowerCase();
      if (!config.allowed_types.includes(ext)) {
        setSubmitError(`Format file ${file.name} tidak didukung. Gunakan: ${config.allowed_types.join(', ')}`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    
    setLampiranFiles(prev => [...prev, ...files]);
    setSubmitError("");
  };
  
  const removeLampiran = (index) => {
    setLampiranFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAjukanSurat = async (e) => {
    e.preventDefault();
    
    if (!selectedJenisSurat) {
      setSubmitError("Pilih jenis surat terlebih dahulu");
      return;
    }
    
    const fields = selectedJenisSurat.fields_config?.fields || [];
    for (const field of fields) {
      const value = formFields[field.name];
      const isEmpty = value === undefined || value === null || String(value).trim() === "";
      if (field.required && isEmpty) {
        setSubmitError(`Field "${field.label}" wajib diisi`);
        return;
      }
    }
    
    try {
      setSubmitting(true);
      setSubmitError("");
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append("id_jenis", selectedJenisSurat.id_jenis);
      
      const detailFields = fields.map((field) => ({
        name: field.name,
        value: formFields[field.name] ?? ""
      }));
      formData.append("detail_fields", JSON.stringify(detailFields));
      
      lampiranFiles.forEach(file => {
        formData.append("lampiran", file);
      });
      
      await axios.post(`${API_BASE_URL}/surat/pengajuan`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      
      setSubmitSuccess(true);
      setSelectedJenisSurat(null);
      setFormFields({});
      setLampiranFiles([]);
      
      await fetchPengajuanSaya();
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab("status");
      }, 2000);
      
    } catch (error) {
      console.error("Error ajukan surat:", error);
      setSubmitError(error.response?.data?.message || "Gagal mengajukan surat");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  // ==================== STATUS SURAT FUNCTIONS ====================
  
  const handleDetailPengajuan = async (pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setIsDetailModalOpen(true);
  };
  
  const handleDownloadSurat = async (idPengajuan, fileName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/surat/download/${idPengajuan}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });
      
      const disposition = response.headers?.["content-disposition"] || "";
      const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
      const serverFileName = match ? decodeURIComponent(match[1].replace(/"/g, "").trim()) : null;
      const downloadName = serverFileName || fileName || `surat_${idPengajuan}.pdf`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error download surat:", error);
      alert(error.response?.status === 404 ? "File surat belum tersedia atau tidak ditemukan" : "Gagal mengunduh surat");
    }
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const getDaysSincePengajuan = (item) => {
    const tanggalPengajuan = parseDateValue(item?.tanggal_pengajuan);
    if (!tanggalPengajuan) return null;
    const start = new Date(tanggalPengajuan);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };
  
  // ==================== DATATABLE LOGIC UNTUK STATUS SURAT ====================
  
  // Semua data ditampilkan permanen tanpa filter expired
  const allStatusData = useMemo(() => {
    return pengajuanSaya
      .map(item => {
        const alasanField = item.detail_fields?.find(
          f => f.field_name === 'alasan_dispensasi' || 
               f.field_name === 'tujuan_rekomendasi' || 
               f.field_name === 'sejarah_singkat' || 
               f.field_name === 'keterangan'
        );
        
        return {
          ...item,
          _alasan: alasanField?.field_value || item.detail_fields?.[0]?.field_value || '-',
          _jenisSuratNama: item.jenis_surat?.nama_jenis || item.nama_jenis || '-',
          _tanggalPengajuan: parseDateValue(item.tanggal_pengajuan),
          _daysSince: getDaysSincePengajuan(item),
          _id: item.id_pengajuan
        };
      });
  }, [pengajuanSaya]);

  // Filter, search, sort data
  const filteredStatusData = useMemo(() => {
    let data = [...allStatusData];
    
    // Filter periode pengajuan (hanya jika user memilih filter waktu)
    if (pengajuanTimeFilter !== "all") {
      data = data.filter(item => {
        const daysSince = item._daysSince;
        if (daysSince === null) return false;
        if (pengajuanTimeFilter === "over365") return daysSince > 365;
        return daysSince <= Number(pengajuanTimeFilter);
      });
    }
    
    // Filter status
    if (statusFilter) {
      data = data.filter(item => item.status === statusFilter);
    }
    
    // Filter jenis surat
    if (statusFilterJenisSurat) {
      data = data.filter(item => 
        item.jenis_surat?.id_jenis == statusFilterJenisSurat ||
        item.id_jenis == statusFilterJenisSurat
      );
    }
    
    // Pencarian
    if (statusSearchTerm) {
      const search = statusSearchTerm.toLowerCase();
      data = data.filter(item => 
        item._jenisSuratNama.toLowerCase().includes(search) ||
        item._alasan.toLowerCase().includes(search) ||
        (item.no_surat && item.no_surat.toLowerCase().includes(search)) ||
        (item.catatan_admin && item.catatan_admin.toLowerCase().includes(search))
      );
    }
    
    // Sorting
    data.sort((a, b) => {
      let comparison = 0;
      switch (statusSortField) {
        case "tanggal":
          comparison = (a._tanggalPengajuan?.getTime() || 0) - (b._tanggalPengajuan?.getTime() || 0);
          break;
        case "jenis":
          comparison = a._jenisSuratNama.localeCompare(b._jenisSuratNama);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "no_surat":
          comparison = (a.no_surat || "").localeCompare(b.no_surat || "");
          break;
        default:
          comparison = (a._tanggalPengajuan?.getTime() || 0) - (b._tanggalPengajuan?.getTime() || 0);
      }
      return statusSortDirection === "asc" ? comparison : -comparison;
    });
    
    return data;
  }, [allStatusData, pengajuanTimeFilter, statusFilter, statusFilterJenisSurat, statusSearchTerm, statusSortField, statusSortDirection]);

  // Pagination
  const statusTotalItems = filteredStatusData.length;
  const statusTotalPages = Math.ceil(statusTotalItems / statusItemsPerPage);
  const statusStartIndex = (statusCurrentPage - 1) * statusItemsPerPage;
  const statusEndIndex = statusStartIndex + statusItemsPerPage;
  const statusCurrentItems = filteredStatusData.slice(statusStartIndex, statusEndIndex);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setStatusCurrentPage(1);
  }, [pengajuanTimeFilter, statusFilter, statusFilterJenisSurat, statusSearchTerm, statusItemsPerPage]);

  const handleStatusSort = (field) => {
    if (statusSortField === field) {
      setStatusSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setStatusSortField(field);
      setStatusSortDirection("asc");
    }
    setStatusCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (statusSortField !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return statusSortDirection === "asc" 
      ? <ChevronUp className="w-4 h-4 text-amber-600" />
      : <ChevronDown className="w-4 h-4 text-amber-600" />;
  };

  const handleStatusPageChange = (page) => {
    setStatusCurrentPage(page);
    const tableElement = document.getElementById('status-datatable-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // ==================== UTILITIES ====================
  
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  
  const getFileIcon = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText className="w-6 h-6 text-red-600" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-6 h-6 text-emerald-600" />;
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return <File className="w-6 h-6 text-blue-600" />;
    return <File className="w-6 h-6 text-gray-600" />;
  };
  
  const getStatusBadge = (status) => {
    const config = {
      MENUNGGU: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Clock, label: "Menunggu" },
      DRAFT: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: FileText, label: "Draft" },
      LEGALISI: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: FileCheck, label: "Legalisasi" },
      SIAP: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle, label: "Siap" },
      SELESAI: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Selesai" }
    };
    const c = config[status] || config.MENUNGGU;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${c.color}`}>
        <Icon className="w-3 h-3" /> {c.label}
      </span>
    );
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case "MENUNGGU": return <Clock className="w-5 h-5 text-orange-500" />;
      case "DRAFT": return <FileText className="w-5 h-5 text-gray-500" />;
      case "LEGALISI": return <FileCheck className="w-5 h-5 text-purple-500" />;
      case "SIAP": return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "SELESAI": return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFieldLabel = (rawLabel) => {
    if (!rawLabel) return "-";
    return String(rawLabel)
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  
  // Render dynamic form fields
  const renderDynamicField = (field, value, onChange) => {
    const commonClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";
    
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows={field.rows || 3}
            className={commonClass}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      case "date":
        return (
          <input
            type="date"
            className={commonClass}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      case "select":
        return (
          <select
            className={commonClass}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            className={commonClass}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      default:
        return (
          <input
            type="text"
            className={commonClass}
            placeholder={field.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
          />
        );
    }
  };
  
  // Timeline component
  const StatusTimeline = ({ currentStatus }) => {
    const steps = [
      { key: "MENUNGGU", label: "Menunggu", icon: Clock },
      { key: "DRAFT", label: "Draft", icon: FileText },
      { key: "LEGALISI", label: "Legalisasi", icon: FileCheck },
      { key: "SIAP", label: "Siap", icon: CheckCircle },
      { key: "SELESAI", label: "Selesai", icon: CheckCircle }
    ];
    
    const getStepStatus = (stepKey) => {
      const stepOrder = steps.findIndex(s => s.key === stepKey);
      const currentOrder = steps.findIndex(s => s.key === currentStatus);
      if (stepOrder < currentOrder) return "completed";
      if (stepOrder === currentOrder) return "current";
      return "pending";
    };
    
    return (
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${(steps.findIndex(s => s.key === currentStatus) + 1) * 20}%` }}></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.key);
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center z-10
                  ${status === "completed" ? "bg-green-500 text-white" : ""}
                  ${status === "current" ? "bg-amber-500 text-white ring-4 ring-amber-200" : ""}
                  ${status === "pending" ? "bg-gray-200 text-gray-500" : ""}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${status === "current" ? "font-bold text-amber-600" : "text-gray-500"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Komponen pesan login
  const LoginRequiredMessage = ({ title, description }) => (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-12 h-12 text-amber-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
      >
        <LogIn className="w-5 h-5" />
        Login Sekarang
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
  
  // Filter dokumen
  const filteredDokumen = dokumen.filter(item => {
    if (searchTerm && !item.judul_dokumen?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterJenis && item.jenis_dokumen !== filterJenis) return false;
    return true;
  });
  
  const jenisDokumenOptions = [
    "Awig-awig", "Perarem", "Peraturan Desa", "Keputusan Paruman", "Lainnya"
  ];
  
  if (loading && activeTab === "dokumen") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="relative bg-gradient-to-r from-amber-600 to-amber-600 h-80 animate-pulse"></div>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-center gap-3 mb-10">
            {[1, 2, 3].map(i => <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>)}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-32 bg-gray-200 animate-pulse"></div>
                <div className="p-6"><div className="h-4 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Inject DataTables Styles */}
      <style>{dataTablesStyles}</style>
      
      {/* Hero Section */}
      <div className="relative text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/85 via-stone-800/80 to-zinc-900/90 z-10"></div>
          <img src={buildAssetUrl("uploads/profil/banjar-cengkilung.jpg")} alt="Banjar Cengkilung" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
        </div>
        
        <div className="relative z-30 max-w-6xl mx-auto px-4 py-20">
          <nav className="flex items-center gap-2 text-sm text-stone-300/70 mb-6 flex-wrap">
            <Link to="/" className="hover:text-amber-300 transition-colors">Beranda</Link>
            <span className="text-stone-400/40">/</span>
            <span className="text-amber-200 font-medium">Dokumen Desa</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dokumen & Layanan Surat
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-stone-200">Desa Adat Cengkilung</span>
          </h1>
          <p className="text-lg text-stone-200/90 max-w-2xl leading-relaxed">Akses dokumen desa dan ajukan surat adat secara online</p>
          
          {isLoggedIn && isUserMasyarakat && (
            <div className="mt-4 p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-amber-500/20 inline-block">
              <p className="text-sm text-stone-300">Halo, {user?.nama_lengkap || 'Pengguna'}! Selamat datang di layanan surat desa adat.</p>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.03"/>
          </svg>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex gap-6">
            <button onClick={() => { setActiveTab("dokumen"); setSearchTerm(""); setFilterJenis(""); }}
              className={`pb-3 px-1 flex items-center gap-2 transition-all ${activeTab === "dokumen" ? "border-b-2 border-amber-600 text-amber-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}>
              <FileText className="w-4 h-4" /> Dokumen Desa
            </button>
            <button onClick={() => { setActiveTab("ajukan"); setSelectedJenisSurat(null); setFormFields({}); setLampiranFiles([]); }}
              className={`pb-3 px-1 flex items-center gap-2 transition-all ${activeTab === "ajukan" ? "border-b-2 border-amber-600 text-amber-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}>
              <Send className="w-4 h-4" /> Ajukan Surat
            </button>
            <button onClick={() => { setActiveTab("status"); setStatusFilter(""); setPengajuanTimeFilter("all"); }}
              className={`pb-3 px-1 flex items-center gap-2 transition-all ${activeTab === "status" ? "border-b-2 border-amber-600 text-amber-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}>
              <Clock className="w-4 h-4" /> Status Surat
              {isLoggedIn && pengajuanSaya.filter(p => p.status === 'MENUNGGU').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pengajuanSaya.filter(p => p.status === 'MENUNGGU').length}</span>
              )}
            </button>
          </nav>
        </div>
        
        {/* ==================== TAB 1: DOKUMEN DESA ==================== */}
        {activeTab === "dokumen" && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-gray-700 hover:text-amber-600">
                  <Filter className="w-5 h-5" /> Filter & Pencarian <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                </button>
                <button onClick={() => { fetchDokumenPublik(); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw className="w-5 h-5 text-gray-600" /></button>
              </div>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Cari dokumen..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <div>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
                          <option value="">Semua Jenis</option>
                          {jenisDokumenOptions.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center"><span className="font-medium">{filteredDokumen.length}</span> dokumen ditemukan</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {filteredDokumen.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDokumen.map((item, index) => (
                  <motion.div key={item.id_dokumen} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">{getFileIcon(item.file_path)}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{item.judul_dokumen}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.jenis_dokumen || 'Dokumen Umum'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.deskripsi_dokumen || 'Tidak ada deskripsi'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.tanggal_upload)}</span>
                        <button onClick={() => handlePreview(item)} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-all">
                          <Eye className="w-4 h-4" /> Lihat Detail
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><FileText className="w-12 h-12 text-gray-400" /></div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak Ada Dokumen</h3>
                <p className="text-gray-500">{searchTerm ? "Tidak ada dokumen yang sesuai dengan pencarian Anda." : "Belum ada dokumen yang tersedia saat ini."}</p>
              </div>
            )}
          </>
        )}
        
        {/* ==================== TAB 2: AJUKAN SURAT ==================== */}
        {activeTab === "ajukan" && (
          <>
            {!isLoggedIn ? (
              <LoginRequiredMessage 
                title="Akses Diperlukan"
                description="Anda harus login terlebih dahulu untuk dapat mengajukan surat adat secara online. Silakan login menggunakan akun Anda untuk melanjutkan."
              />
            ) : !isUserMasyarakat ? (
              <LoginRequiredMessage 
                title="Akses Terbatas"
                description="Fitur ini hanya tersedia untuk akun masyarakat. Silakan login dengan akun masyarakat untuk mengajukan surat."
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                {submitSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Pengajuan Berhasil!</h3>
                    <p className="text-gray-600">Pengajuan surat Anda telah dikirim dan sedang diproses oleh admin.</p>
                    <button onClick={() => { setSubmitSuccess(false); setActiveTab("status"); }} className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg">Lihat Status Surat</button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ajukan Surat Adat</h2>
                    <p className="text-gray-600 mb-6">Silakan pilih jenis surat dan isi form di bawah ini</p>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Surat <span className="text-red-500">*</span></label>
                      <select className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" value={selectedJenisSurat?.id_jenis || ""} onChange={(e) => handleJenisSuratChange(e.target.value)}>
                        <option value="">Pilih Jenis Surat</option>
                        {jenisSurat.map(jenis => <option key={jenis.id_jenis} value={jenis.id_jenis}>{jenis.nama_jenis}</option>)}
                      </select>
                    </div>
                    
                    {selectedJenisSurat && (
                      <form onSubmit={handleAjukanSurat} className="space-y-6">
                        {selectedJenisSurat.deskripsi && (
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800">{selectedJenisSurat.deskripsi}</p>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800">Data Pengajuan</h3>
                          {selectedJenisSurat.fields_config?.fields?.map((field, idx) => (
                            <div key={idx}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                              </label>
                              {renderDynamicField(field, formFields[field.name], handleFieldChange)}
                            </div>
                          ))}
                          {(selectedJenisSurat.fields_config?.fields?.length || 0) === 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                              Jenis surat ini tidak memiliki field tambahan dari admin. Anda bisa langsung lanjut.
                            </div>
                          )}
                        </div>
                        
                        {uploadConfig.allow_upload && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Upload Bukti Pendukung (Opsional)</h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition-colors">
                              <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept={uploadConfig.allowed_types.map(t => `.${t}`).join(',')} className="hidden" />
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-gray-600">Klik untuk upload atau drag and drop</span>
                              </button>
                              <p className="text-xs text-gray-500 mt-2">Maksimal {uploadConfig.max_files} file, maksimal {uploadConfig.max_size_mb}MB per file. Format: {uploadConfig.allowed_types.join(', ')}</p>
                            </div>
                            
                            {lampiranFiles.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">File yang akan diupload ({lampiranFiles.length} file):</p>
                                {lampiranFiles.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-gray-500" /><span className="text-sm">{file.name}</span><span className="text-xs text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span></div>
                                    <button type="button" onClick={() => removeLampiran(idx)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {!uploadConfig.allow_upload && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                            Upload lampiran tidak diperlukan untuk jenis surat ini (sesuai pengaturan admin).
                          </div>
                        )}
                        
                        {submitError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{submitError}</div>}
                        
                        {uploadProgress > 0 && <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-amber-600 rounded-full h-2 transition-all" style={{ width: `${uploadProgress}%` }}></div><p className="text-xs text-amber-600 mt-1">Mengupload: {uploadProgress}%</p></div>}
                        
                        <div className="flex gap-3 pt-4">
                          <button type="submit" disabled={submitting} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50">
                            {submitting ? <span className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Memproses...</span> : "Ajukan Surat"}
                          </button>
                          <button type="button" onClick={() => { setSelectedJenisSurat(null); setFormFields({}); setLampiranFiles([]); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium transition-all">Reset</button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
        
        {/* ==================== TAB 3: STATUS SURAT DENGAN DATATABLE ==================== */}
        {activeTab === "status" && (
          <>
            {!isLoggedIn ? (
              <LoginRequiredMessage 
                title="Akses Diperlukan"
                description="Anda harus login terlebih dahulu untuk melihat riwayat dan status pengajuan surat Anda."
              />
            ) : !isUserMasyarakat ? (
              <LoginRequiredMessage 
                title="Akses Terbatas"
                description="Fitur ini hanya tersedia untuk akun masyarakat. Silakan login dengan akun masyarakat untuk melihat status surat."
              />
            ) : (
              <>
                {/* Summary Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  {statusOptions.filter(s => s.value !== "").map((s, idx) => (
                    <motion.div
                      key={s.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`bg-white rounded-xl shadow-md p-4 border-l-4 cursor-pointer hover:shadow-lg transition-all ${
                        s.color === 'orange' ? 'border-orange-500' : 
                        s.color === 'gray' ? 'border-gray-500' : 
                        s.color === 'purple' ? 'border-purple-500' : 
                        s.color === 'blue' ? 'border-blue-500' : 
                        'border-green-500'
                      } ${statusFilter === s.value ? 'ring-2 ring-amber-400 shadow-lg scale-105' : ''}`}
                      onClick={() => setStatusFilter(statusFilter === s.value ? "" : s.value)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {allStatusData.filter(item => item.status === s.value).length}
                          </p>
                        </div>
                        <div className={`w-8 h-8 bg-${s.color}-100 rounded-lg flex items-center justify-center`}>
                          {s.value === 'MENUNGGU' && <Clock className="w-4 h-4 text-orange-600" />}
                          {s.value === 'DRAFT' && <FileText className="w-4 h-4 text-gray-600" />}
                          {s.value === 'LEGALISI' && <FileCheck className="w-4 h-4 text-purple-600" />}
                          {s.value === 'SIAP' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                          {s.value === 'SELESAI' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6" id="status-datatable-container">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Pencarian */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari jenis surat, alasan, no surat..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        value={statusSearchTerm}
                        onChange={(e) => setStatusSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    {/* Filter Periode */}
                    <div>
                      <select
                        value={pengajuanTimeFilter}
                        onChange={(e) => setPengajuanTimeFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {pengajuanTimeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Filter Jenis Surat */}
                    <div>
                      <select
                        value={statusFilterJenisSurat}
                        onChange={(e) => setStatusFilterJenisSurat(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Semua Jenis Surat</option>
                        {jenisSurat.map(j => (
                          <option key={j.id_jenis} value={j.id_jenis}>{j.nama_jenis}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Items per page */}
                    <div>
                      <select
                        value={statusItemsPerPage}
                        onChange={(e) => {
                          setStatusItemsPerPage(Number(e.target.value));
                          setStatusCurrentPage(1);
                        }}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="5">5 data per halaman</option>
                        <option value="10">10 data per halaman</option>
                        <option value="25">25 data per halaman</option>
                        <option value="50">50 data per halaman</option>
                        <option value="100">100 data per halaman</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Info & Reset */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Menampilkan <span className="font-semibold text-amber-600">{statusTotalItems}</span> pengajuan
                      {(pengajuanTimeFilter !== "all" || statusFilter || statusFilterJenisSurat || statusSearchTerm) && (
                        <span> (difilter dari {allStatusData.length} total)</span>
                      )}
                    </p>
                    
                    {(pengajuanTimeFilter !== "all" || statusFilter || statusFilterJenisSurat || statusSearchTerm) && (
                      <button
                        onClick={() => {
                          setPengajuanTimeFilter("all");
                          setStatusFilter("");
                          setStatusFilterJenisSurat("");
                          setStatusSearchTerm("");
                          setStatusCurrentPage(1);
                        }}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reset Filter
                      </button>
                    )}
                  </div>
                </div>
                
                {/* DataTable */}
                {statusCurrentItems.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="status-datatable">
                        <thead>
                          <tr>
                            <th onClick={() => handleStatusSort("tanggal")} className="w-[120px]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Tanggal
                                {getSortIcon("tanggal")}
                              </div>
                            </th>
                            <th onClick={() => handleStatusSort("jenis")}>
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" />
                                Jenis Surat
                                {getSortIcon("jenis")}
                              </div>
                            </th>
                            <th onClick={() => handleStatusSort("status")} className="w-[120px]">
                              <div className="flex items-center gap-2">
                                <ListChecks className="w-3.5 h-3.5" />
                                Status
                                {getSortIcon("status")}
                              </div>
                            </th>
                            <th className="no-sort w-[160px] text-center">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {statusCurrentItems.map((item, idx) => (
                            <motion.tr
                              key={item._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              className={`status-row-${item.status}`}
                            >
                              <td>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                  <span className="text-sm text-gray-700">
                                    {formatDate(item.tanggal_pengajuan)}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="font-medium text-gray-800 text-sm">
                                  {item._jenisSuratNama}
                                </span>
                              </td>
                              <td>
                                {getStatusBadge(item.status)}
                              </td>
                              <td>
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleDetailPengajuan(item)}
                                    className="px-3 py-1.5 border border-amber-600 text-amber-600 rounded-lg text-sm hover:bg-amber-50 transition-colors flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Detail
                                  </button>
                                  {item.status === "SELESAI" && item.file_final && (
                                    <button
                                      onClick={() => handleDownloadSurat(item.id_pengajuan, `surat_${item.id_pengajuan}.pdf`)}
                                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Unduh
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {statusTotalItems > 0 && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>
                              Menampilkan {statusTotalItems === 0 ? 0 : statusStartIndex + 1} - {Math.min(statusEndIndex, statusTotalItems)} dari {statusTotalItems} data
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStatusPageChange(1)}
                              disabled={statusCurrentPage === 1}
                              className={`p-2 rounded-lg transition-colors ${
                                statusCurrentPage === 1
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronsLeft className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => handleStatusPageChange(statusCurrentPage - 1)}
                              disabled={statusCurrentPage === 1}
                              className={`p-2 rounded-lg transition-colors ${
                                statusCurrentPage === 1
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, statusTotalPages) }, (_, i) => {
                                let pageNum;
                                if (statusTotalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (statusCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (statusCurrentPage >= statusTotalPages - 2) {
                                  pageNum = statusTotalPages - 4 + i;
                                } else {
                                  pageNum = statusCurrentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handleStatusPageChange(pageNum)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                      statusCurrentPage === pageNum
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
                              onClick={() => handleStatusPageChange(statusCurrentPage + 1)}
                              disabled={statusCurrentPage === statusTotalPages}
                              className={`p-2 rounded-lg transition-colors ${
                                statusCurrentPage === statusTotalPages
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleStatusPageChange(statusTotalPages)}
                              disabled={statusCurrentPage === statusTotalPages}
                              className={`p-2 rounded-lg transition-colors ${
                                statusCurrentPage === statusTotalPages
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
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      {allStatusData.length === 0 ? "Belum Ada Pengajuan" : "Tidak Ada Data Sesuai Filter"}
                    </h3>
                    <p className="text-gray-500">
                      {allStatusData.length === 0 
                        ? "Anda belum pernah mengajukan surat. Silakan ajukan surat di tab \"Ajukan Surat\"." 
                        : "Coba ubah filter atau periode pencarian untuk melihat data lainnya."}
                    </p>
                    {allStatusData.length === 0 ? (
                      <button onClick={() => setActiveTab("ajukan")} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg">
                        Ajukan Surat Sekarang
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPengajuanTimeFilter("all");
                          setStatusFilter("");
                          setStatusFilterJenisSurat("");
                          setStatusSearchTerm("");
                        }}
                        className="mt-4 px-6 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      {/* ==================== MODAL PREVIEW DOKUMEN ==================== */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedDokumen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsPreviewModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsPreviewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold text-gray-800 mb-2 pr-8">{selectedDokumen.judul_dokumen}</h3>
              <p className="text-sm text-gray-500 mb-4">{selectedDokumen.jenis_dokumen} • {formatDate(selectedDokumen.tanggal_upload)}</p>
              <div className="border rounded-lg overflow-hidden bg-gray-100 h-[60vh]">
                <iframe src={buildAssetUrl(selectedDokumen.file_path)} className="w-full h-full" title="Preview Dokumen" />
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setIsPreviewModalOpen(false)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Tutup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ==================== MODAL DETAIL SURAT ==================== */}
      <AnimatePresence>
        {isDetailModalOpen && selectedPengajuan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={() => setIsDetailModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative my-8" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">{getStatusIcon(selectedPengajuan.status)}</div>
                <div><h3 className="text-xl font-bold text-gray-800">{selectedPengajuan.jenis_surat?.nama_jenis}</h3><p className="text-sm text-gray-500">Diajukan: {formatDateTime(selectedPengajuan.tanggal_pengajuan)}</p></div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                {getStatusBadge(selectedPengajuan.status)}
                {selectedPengajuan.no_surat && <p className="text-sm text-gray-600">No. Surat: {selectedPengajuan.no_surat}</p>}
              </div>
              
              <div className="border-t pt-4 mb-4"><h4 className="font-semibold text-gray-800 mb-3">Data Pengajuan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPengajuan.detail_fields?.map((field, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">{formatFieldLabel(field.field_label || field.field_name)}</p><p className="text-sm text-gray-800">{field.field_value || '-'}</p></div>
                  ))}
                </div>
              </div>
              
              {selectedPengajuan.lampiran && selectedPengajuan.lampiran.length > 0 && (
                <div className="border-t pt-4 mb-4"><h4 className="font-semibold text-gray-800 mb-3">Lampiran Bukti</h4>
                  <div className="space-y-2">{selectedPengajuan.lampiran.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-gray-500" /><span className="text-sm">{file.nama_file}</span></div><a href={buildAssetUrl(file.file_path)} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700"><Download className="w-4 h-4" /></a></div>
                  ))}</div>
                </div>
              )}
              
              {selectedPengajuan.catatan_admin && (
                <div className="bg-amber-50 p-4 rounded-lg mb-4"><h4 className="font-semibold text-amber-800 mb-1">Catatan Admin</h4><p className="text-sm text-amber-700">{selectedPengajuan.catatan_admin}</p></div>
              )}
              
              <div className="border-t pt-4 mb-4"><h4 className="font-semibold text-gray-800 mb-3">Timeline Proses</h4><StatusTimeline currentStatus={selectedPengajuan.status} /></div>
              
              <div className="flex gap-3">
                {selectedPengajuan.status === "SELESAI" && selectedPengajuan.file_final && (
                  <button onClick={() => handleDownloadSurat(selectedPengajuan.id_pengajuan, `surat_${selectedPengajuan.id_pengajuan}.pdf`)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download Surat
                  </button>
                )}
                <button onClick={() => setIsDetailModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Tutup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-8 text-center">
        <p className="text-sm text-gray-500">Data diperbarui secara berkala. Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  );
}
