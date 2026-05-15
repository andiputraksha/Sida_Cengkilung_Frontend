import { useEffect, useState, useRef } from "react";
import axios from "axios";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { API_BASE_URL, BACKEND_BASE_URL, buildAssetUrl } from "@/utils/api";
import {
  Image,
  Video,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  Calendar,
  Tag,
  FolderOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Camera,
  Film,
  Link as LinkIcon,
  Youtube
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = `${API_BASE_URL}/galeri`;

export default function GaleriPage() {
  const [galeri, setGaleri] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [form, setForm] = useState({
    judul_media: "",
    tipe_media: "foto",
    sumber_media: "file",
    id_kategori_galeri: "",
    tanggal_publikasi: "",
    file: null,
    youtube_url: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [youtubePreview, setYoutubePreview] = useState(null);
  const [youtubeError, setYoutubeError] = useState("");
  const [filter, setFilter] = useState({
    tipe: "",
    kategori: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState({});
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  // Refs untuk video
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("token");

  // Fetch semua galeri untuk admin
  const fetchGaleriAdmin = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/semua`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGaleri(res.data.data || []);
    } catch (error) {
      console.error("Error fetching galeri:", error);
      alert("Gagal memuat data galeri");
    } finally {
      setLoading(false);
    }
  };

  // Fetch kategori galeri
  const fetchKategori = async () => {
    try {
      const res = await axios.get(`${API_URL}/kategori`);
      setKategori(res.data.data || []);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  useEffect(() => {
    fetchGaleriAdmin();
    fetchKategori();
  }, []);

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
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Fungsi untuk mendapatkan thumbnail YouTube
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  // Fungsi untuk generate thumbnail dari video
  const generateVideoThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.playsInline = true;
      video.muted = true;
      
      video.onloadeddata = () => {
        // Ambil frame di awal video, aman untuk video sangat pendek
        const safeSeekTime = Math.min(1, Math.max(0, (video.duration || 1) / 4));
        video.currentTime = safeSeekTime;
      };

      video.onseeked = () => {
        // Buat canvas untuk mengambil frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Gambar frame video ke canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Konversi canvas ke blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Gagal membuat thumbnail'));
            return;
          }

          // Buat file dari blob
          const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
          resolve(thumbnailFile);
        }, 'image/jpeg', 0.8);
        
        // Bersihkan
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        reject(new Error('Gagal memuat video'));
      };

      // Set sumber video
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (form.tipe_media === 'foto' && !file.type.startsWith('image/')) {
        alert("Hanya file gambar yang diperbolehkan");
        return;
      }
      if (form.tipe_media === 'video' && !file.type.startsWith('video/')) {
        alert("Hanya file video yang diperbolehkan");
        return;
      }

      // Validasi ukuran (max 5MB untuk foto, 10MB untuk video)
      const maxSize = form.tipe_media === 'foto' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`Ukuran file maksimal ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      setVideoThumbnail(null);
      setSelectedFile(file);
      setForm({ ...form, file, youtube_url: "" });
      setYoutubePreview(null);
      setYoutubeError("");
      
      if (form.tipe_media === 'foto') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewMedia(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Untuk video, buat preview URL object
        const videoUrl = URL.createObjectURL(file);
        setPreviewMedia(videoUrl);
        
        // Generate thumbnail dari video
        try {
          setIsGeneratingThumbnail(true);
          const thumbnail = await generateVideoThumbnail(file);
          setVideoThumbnail(thumbnail);
        } catch (error) {
          console.error("Error generating thumbnail:", error);
        } finally {
          setIsGeneratingThumbnail(false);
        }
      }
    }
  };

  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value;
    setForm({ ...form, youtube_url: url, file: null });
    setSelectedFile(null);
    setPreviewMedia(null);
    setYoutubeError("");

    if (url && isYouTubeUrl(url)) {
      const embedUrl = getYouTubeEmbedUrl(url);
      setYoutubePreview(embedUrl);
    } else if (url && url.length > 0) {
      setYoutubeError("URL YouTube tidak valid");
      setYoutubePreview(null);
    }
  };

  const handleThumbnailError = (id) => {
    setThumbnailErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.judul_media || !form.id_kategori_galeri) {
      alert("Judul dan kategori wajib diisi");
      return;
    }

    // Validasi berdasarkan sumber media
    if (form.sumber_media === 'file' && !editId && !selectedFile) {
      alert("File wajib diupload");
      return;
    }

    if (form.sumber_media === 'youtube' && !form.youtube_url) {
      alert("URL YouTube wajib diisi");
      return;
    }

    if (form.sumber_media === 'youtube' && !isYouTubeUrl(form.youtube_url)) {
      alert("URL YouTube tidak valid");
      return;
    }

    const formData = new FormData();
    formData.append("judul_media", form.judul_media);
    formData.append("tipe_media", form.tipe_media);
    formData.append("id_kategori_galeri", form.id_kategori_galeri);
    formData.append("sumber_media", form.sumber_media);
    
    if (form.tanggal_publikasi) {
      formData.append("tanggal_publikasi", form.tanggal_publikasi);
    }

    if (form.sumber_media === 'file' && selectedFile) {
      formData.append("file", selectedFile);
      
      // Jika ada thumbnail yang di-generate, kirim juga
      if (videoThumbnail) {
        formData.append("thumbnail", videoThumbnail);
      }
    } else if (form.sumber_media === 'youtube') {
      formData.append("youtube_url", form.youtube_url);
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
        alert("Galeri berhasil diperbarui");
      } else {
        await axios.post(API_URL, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        alert("Galeri berhasil ditambahkan");
      }

      setIsOpen(false);
      resetForm();
      fetchGaleriAdmin();
    } catch (error) {
      console.error("Error saving galeri:", error);
      alert(error.response?.data?.message || "Gagal menyimpan galeri");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    // Tentukan sumber media berdasarkan file_path
    const sumberMedia = item.file_path && item.file_path.includes('youtu') ? 'youtube' : 'file';
    
    setForm({
      judul_media: item.judul_media,
      tipe_media: item.tipe_media,
      sumber_media: sumberMedia,
      id_kategori_galeri: item.id_kategori_galeri,
      tanggal_publikasi: item.tanggal_publikasi ? item.tanggal_publikasi.split('T')[0] : "",
      file: null,
      youtube_url: sumberMedia === 'youtube' ? item.file_path : ""
    });
    setEditId(item.id_galeri);
    
    if (sumberMedia === 'file' && item.file_path) {
      setPreviewMedia(`${BACKEND_BASE_URL}/${item.file_path}`);
      setYoutubePreview(null);
    } else if (sumberMedia === 'youtube') {
      setYoutubePreview(getYouTubeEmbedUrl(item.file_path));
      setPreviewMedia(null);
    }
    
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus media ini?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Media berhasil dihapus");
      fetchGaleriAdmin();
    } catch (error) {
      console.error("Error deleting galeri:", error);
      alert("Gagal menghapus media");
    }
  };

  const handlePreview = (item) => {
    setSelectedMedia(item);
    setIsPreviewOpen(true);
  };

  const resetForm = () => {
    setForm({
      judul_media: "",
      tipe_media: "foto",
      sumber_media: "file",
      id_kategori_galeri: "",
      tanggal_publikasi: "",
      file: null,
      youtube_url: ""
    });
    setEditId(null);
    setSelectedFile(null);
    setPreviewMedia(null);
    setYoutubePreview(null);
    setYoutubeError("");
    setVideoThumbnail(null);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Filter galeri
  const filteredGaleri = galeri.filter(item => {
    if (filter.tipe && item.tipe_media !== filter.tipe) return false;
    if (filter.kategori && item.id_kategori_galeri != filter.kategori) return false;
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        item.judul_media.toLowerCase().includes(searchLower) ||
        (item.nama_kategori && item.nama_kategori.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Pagination logic
  const totalItems = filteredGaleri.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredGaleri.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getVideoThumbnail = (row) => {
    // Jika video dari YouTube, gunakan thumbnail YouTube
    if (row.file_path && row.file_path.includes('youtu')) {
      return getYouTubeThumbnail(row.file_path);
    }
    
    // Jika video upload dan ada thumbnail, gunakan thumbnail dari server
    if (row.thumbnail) {
      return buildAssetUrl(row.thumbnail);
    }
    
    // Jika tidak ada thumbnail, return null untuk fallback ke ikon
    return null;
  };

  const columns = [
    { 
      header: "Media", 
      accessor: "file_path",
      render: (value, row) => {
        const videoThumbnail = row.tipe_media === 'video' ? getVideoThumbnail(row) : null;
        const thumbnailUrl = videoThumbnail || (row.thumbnail ? buildAssetUrl(row.thumbnail) : null);
        const hasError = thumbnailErrors[row.id_galeri];
        const fotoSrc = hasError ? buildAssetUrl(row.file_path) : buildAssetUrl(row.thumbnail || row.file_path);
        
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0">
              {row.tipe_media === 'foto' ? (
                <img 
                  src={fotoSrc}
                  alt={row.judul_media}
                  className="w-full h-full object-cover"
                  onError={() => handleThumbnailError(row.id_galeri)}
                />
              ) : (
                <>
                  {thumbnailUrl && !hasError ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={row.judul_media}
                      className="w-full h-full object-cover"
                      onError={() => handleThumbnailError(row.id_galeri)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-600">
                      {value && value.includes('youtu') ? (
                        <Youtube className="w-8 h-8 text-white" />
                      ) : (
                        <Film className="w-6 h-6 text-white" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      }
    },
    { 
      header: "Judul", 
      accessor: "judul_media",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            ID: {row.id_galeri}
          </div>
        </div>
      )
    },
    { 
      header: "Kategori", 
      accessor: "nama_kategori",
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-sm text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    { 
      header: "Tipe", 
      accessor: "tipe_media",
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
            value === 'foto' 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}>
            {value === 'foto' ? (
              <Camera className="w-3 h-3" />
            ) : (
              <Video className="w-3 h-3" />
            )}
            {value === 'foto' ? 'Foto' : 'Video'}
          </span>
          {row.file_path && row.file_path.includes('youtu') && (
            <span className="inline-flex items-center gap-1 text-xs text-red-600">
              <Youtube className="w-3 h-3" />
              YouTube
            </span>
          )}
        </div>
      )
    },
    { 
      header: "Tanggal", 
      accessor: "tanggal_publikasi",
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
            Manajemen Galeri
          </h1>
          <p className="text-gray-600">
            Kelola semua foto dan video kegiatan desa
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fetchGaleriAdmin();
              fetchKategori();
            }}
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
            Tambah Media
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
              <p className="text-sm text-gray-600 mb-1">Total Media</p>
              <p className="text-2xl font-bold text-gray-800">{galeri.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-amber-600" />
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
              <p className="text-sm text-gray-600 mb-1">Foto</p>
              <p className="text-2xl font-bold text-gray-800">
                {galeri.filter(item => item.tipe_media === 'foto').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-emerald-600" />
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
              <p className="text-sm text-gray-600 mb-1">Video</p>
              <p className="text-2xl font-bold text-gray-800">
                {galeri.filter(item => item.tipe_media === 'video').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-amber-600" />
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
              <p className="text-sm text-gray-600 mb-1">Kategori</p>
              <p className="text-2xl font-bold text-gray-800">{kategori.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-green-600" />
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
          
          {(filter.search || filter.tipe || filter.kategori) && (
            <button
              onClick={() => setFilter({ tipe: "", kategori: "", search: "" })}
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
                    placeholder="Cari judul media..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  />
                </div>

                <div>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={filter.tipe}
                    onChange={(e) => setFilter({ ...filter, tipe: e.target.value })}
                  >
                    <option value="">Semua Tipe</option>
                    <option value="foto">Foto</option>
                    <option value="video">Video</option>
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
                      <option key={item.id_kategori_galeri} value={item.id_kategori_galeri}>
                        {item.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium">{totalItems}</span> media ditemukan
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
            <p className="text-gray-600">Memuat data galeri...</p>
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
                    key={row.id_galeri}
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
                          onClick={() => handlePreview(row)}
                          className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Preview"
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
                          onClick={() => handleDelete(row.id_galeri)}
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

      {/* Modal Tambah/Edit Galeri */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        title={editId ? "Edit Media" : "Tambah Media"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Media <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.judul_media}
                onChange={(e) => setForm({ ...form, judul_media: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Media <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.tipe_media}
                onChange={(e) => {
                  setForm({ 
                    ...form, 
                    tipe_media: e.target.value, 
                    file: null, 
                    youtube_url: "",
                    sumber_media: "file" 
                  });
                  setPreviewMedia(null);
                  setYoutubePreview(null);
                  setSelectedFile(null);
                  setVideoThumbnail(null);
                }}
                required
              >
                <option value="foto">Foto</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.id_kategori_galeri}
                onChange={(e) => setForm({ ...form, id_kategori_galeri: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {kategori.map((item) => (
                  <option key={item.id_kategori_galeri} value={item.id_kategori_galeri}>
                    {item.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Publikasi
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={form.tanggal_publikasi}
                onChange={(e) => setForm({ ...form, tanggal_publikasi: e.target.value })}
              />
            </div>

            {/* Pilihan Sumber Media (hanya untuk video) */}
            {form.tipe_media === 'video' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sumber Video
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sumber_media"
                      value="file"
                      checked={form.sumber_media === 'file'}
                      onChange={() => {
                        setForm({ ...form, sumber_media: 'file', youtube_url: "" });
                        setYoutubePreview(null);
                      }}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span className="text-sm text-gray-700">Upload File</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sumber_media"
                      value="youtube"
                      checked={form.sumber_media === 'youtube'}
                      onChange={() => {
                        setForm({ ...form, sumber_media: 'youtube', file: null });
                        setSelectedFile(null);
                        setPreviewMedia(null);
                        setVideoThumbnail(null);
                      }}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span className="text-sm text-gray-700">Link YouTube</span>
                  </label>
                </div>
              </div>
            )}

            {/* Upload File */}
            {(form.tipe_media === 'foto' || (form.tipe_media === 'video' && form.sumber_media === 'file')) && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File {form.tipe_media === 'foto' ? 'Foto' : 'Video'} {!editId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept={form.tipe_media === 'foto' ? "image/*" : "video/*"}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onChange={handleFileChange}
                />
                {editId && (
                  <p className="text-xs text-gray-500 mt-1">
                    *Kosongkan jika tidak ingin mengubah file
                  </p>
                )}
                {isGeneratingThumbnail && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                    Menghasilkan thumbnail...
                  </p>
                )}
              </div>
            )}

            {/* Input URL YouTube */}
            {form.tipe_media === 'video' && form.sumber_media === 'youtube' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL YouTube {!editId && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={form.youtube_url}
                    onChange={handleYouTubeUrlChange}
                  />
                </div>
                {youtubeError && (
                  <p className="text-sm text-red-600 mt-1">{youtubeError}</p>
                )}
                {editId && !form.youtube_url && (
                  <p className="text-xs text-gray-500 mt-1">
                    *Kosongkan jika tidak ingin mengubah URL
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Preview untuk Foto */}
          {previewMedia && form.tipe_media === 'foto' && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <img src={previewMedia} alt="Preview" className="w-48 h-48 object-cover rounded-lg border-2 border-amber-200" />
            </div>
          )}

          {/* Preview untuk Video (file) */}
          {previewMedia && form.tipe_media === 'video' && form.sumber_media === 'file' && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <video
                src={previewMedia}
                controls
                className="w-full max-h-96 rounded-lg border-2 border-amber-200"
              />
            </div>
          )}

          {/* Preview untuk YouTube */}
          {youtubePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Preview YouTube:</p>
              <div className="relative pt-[56.25%] rounded-lg overflow-hidden border-2 border-amber-200">
                <iframe
                  src={youtubePreview}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                  title="YouTube preview"
                ></iframe>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading || isGeneratingThumbnail}
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

      {/* Modal Preview Media */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Media"
        size="xl"
      >
        {selectedMedia && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">{selectedMedia.judul_media}</h3>
            
            <div className="relative bg-black rounded-lg overflow-hidden">
              {selectedMedia.tipe_media === 'foto' ? (
                <img
                  src={buildAssetUrl(selectedMedia.file_path)}
                  alt={selectedMedia.judul_media}
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="aspect-w-16 aspect-h-9">
                  {selectedMedia.file_path && selectedMedia.file_path.includes('youtu') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedMedia.file_path)}
                      className="w-full h-[70vh]"
                      allowFullScreen
                      title={selectedMedia.judul_media}
                    ></iframe>
                  ) : (
                    <video
                      src={buildAssetUrl(selectedMedia.file_path)}
                      controls
                      className="w-full h-[70vh]"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Kategori</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  {selectedMedia.nama_kategori}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Tipe</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  {selectedMedia.tipe_media === 'foto' ? (
                    <Camera className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Video className="w-4 h-4 text-amber-600" />
                  )}
                  {selectedMedia.tipe_media === 'foto' ? 'Foto' : 'Video'}
                  {selectedMedia.file_path && selectedMedia.file_path.includes('youtu') && (
                    <>
                      <span className="mx-1"></span>
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>YouTube</span>
                    </>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Tanggal</p>
                <p className="font-medium text-gray-800 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  {formatDate(selectedMedia.tanggal_publikasi)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Uploader</p>
                <p className="font-medium text-gray-800">
                  {selectedMedia.uploader || 'Admin'}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
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



