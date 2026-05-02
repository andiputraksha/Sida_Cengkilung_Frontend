import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, getUser } from "@/utils/auth";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/api";
import {
  Users,
  FileText,
  Folder,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  BookOpen,
  Image,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  PieChart,
  BarChart3,
  Activity,
  Home,
  Building
} from "lucide-react";
import { motion } from "framer-motion";

function DashboardAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/dashboard-admin`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );

        setData(response.data.data);
      } catch (error) {
        console.log(error);
        alert("Gagal mengambil dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'menunggu': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'diterima': return 'bg-green-100 text-green-700 border-green-200';
      case 'ditolak': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'menunggu': return <Clock className="w-4 h-4" />;
      case 'diterima': return <CheckCircle className="w-4 h-4" />;
      case 'ditolak': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-80 animate-pulse"></div>
          <div className="bg-white rounded-2xl shadow-lg p-6 h-80 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-6">Terjadi kesalahan saat mengambil data dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // Pastikan distribusi penduduk memiliki data permanen dan nonpermanen
  let distribusiData = data.distribusi_penduduk || [];
  
  // Jika data dari API hanya memiliki 1 item atau tidak lengkap, buat data default
  const hasPermanen = distribusiData.some(item => item.status === 'permanen');
  const hasNonPermanen = distribusiData.some(item => item.status === 'nonpermanen');
  
  if (!hasPermanen || !hasNonPermanen) {
    // Buat data lengkap berdasarkan total penduduk
    const totalPenduduk = data.statistik?.total_penduduk || 0;
    const existingPermanen = distribusiData.find(item => item.status === 'permanen');
    const existingNonPermanen = distribusiData.find(item => item.status === 'nonpermanen');
    
    const permanenCount = existingPermanen?.jumlah || 0;
    const nonPermanenCount = existingNonPermanen?.jumlah || (totalPenduduk - permanenCount);
    
    distribusiData = [
      {
        status: 'permanen',
        label: 'Penduduk Permanen',
        jumlah: permanenCount,
        persentase: totalPenduduk > 0 ? ((permanenCount / totalPenduduk) * 100).toFixed(1) : '0'
      },
      {
        status: 'nonpermanen',
        label: 'Penduduk Non-Permanen',
        jumlah: nonPermanenCount,
        persentase: totalPenduduk > 0 ? ((nonPermanenCount / totalPenduduk) * 100).toFixed(1) : '0'
      }
    ];
  }

  // Statistik cards data
  const statsCards = [
    {
      title: "Total Penduduk",
      value: data.statistik?.total_penduduk || 0,
      icon: Users,
      color: "from-emerald-500 to-amber-600",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Konten",
      value: data.statistik?.total_konten || 0,                                             
      icon: FileText,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Total Dokumen",
      value: data.statistik?.total_dokumen || 0,
      icon: Folder,
      color: "from-green-500 to-teal-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Permohonan Menunggu",
      value: data.statistik?.permohonan_menunggu || 0,
      icon: Clock,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Selamat datang kembali, <span className="font-semibold text-amber-600">{user?.nama_lengkap || user?.nama || 'Admin'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-gray-600">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {formatNumber(card.value)}
                </h3>
                <p className="text-sm text-gray-500">{card.title}</p>
              </div>

              <div className="absolute bottom-2 right-2 text-6xl font-black text-gray-100 opacity-30 select-none">
                {String(index + 1).padStart(2, '0')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Status Penduduk - DIPERBAIKI */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Distribusi Status Penduduk
              </h3>
            </div>
            <span className="text-xs text-gray-500">
              Total: {formatNumber(data.statistik?.total_penduduk || 0)} Jiwa
            </span>
          </div>

          <div className="space-y-4">
            {/* Penduduk Permanen */}
            {distribusiData.filter(item => item.status === 'permanen').map((item, index) => {
              const percentage = parseFloat(item.persentase) || 0;
              const jumlah = item.jumlah || 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Home className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Penduduk Permanen
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatNumber(jumlah)} orang ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-1000 bg-green-600"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {/* Penduduk Non-Permanen */}
            {distribusiData.filter(item => item.status === 'nonpermanen').map((item, index) => {
              const percentage = parseFloat(item.persentase) || 0;
              const jumlah = item.jumlah || 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Building className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Penduduk Non-Permanen
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatNumber(jumlah)} orang ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-1000 bg-orange-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ringkasan Distribusi */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              {/* Kartu Permanen */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-medium text-green-700 uppercase">Permanen</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatNumber(distribusiData.find(item => item.status === 'permanen')?.jumlah || 0)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {distribusiData.find(item => item.status === 'permanen')?.persentase || 0}% dari total
                </div>
              </div>
              
              {/* Kartu Non-Permanen */}
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700 uppercase">Non-Permanen</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {formatNumber(distribusiData.find(item => item.status === 'nonpermanen')?.jumlah || 0)}
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  {distribusiData.find(item => item.status === 'nonpermanen')?.persentase || 0}% dari total
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistik Lainnya */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Statistik Konten & Dokumen
            </h3>
          </div>

          <div className="space-y-6">
            {/* Konten */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Konten</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {formatNumber(data.statistik?.total_konten || 0)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Published</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.konten_published || 0}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Draft</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.konten_draft || 0}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Archived</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.konten_archived || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Dokumen */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Dokumen</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {formatNumber(data.statistik?.total_dokumen || 0)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Publik</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.dokumen_publik || 0}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Terbatas</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.dokumen_terbatas || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Galeri */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Image className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Galeri</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">
                  {formatNumber(data.statistik?.total_galeri || 0)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Foto</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.galeri_foto || 0}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Video</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.statistik?.galeri_video || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities atau Info Tambahan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '30px 30px'
            }} 
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Sistem Informasi Desa Adat Cengkilung</h3>
            <p className="text-white/80">
              Kelola konten, galeri, dokumen, dan data penduduk dengan mudah dan efisien.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30 text-center">
              <div className="text-3xl font-bold">{formatNumber(data.statistik?.total_penduduk || 0)}</div>
              <div className="text-xs text-white/70">Total Penduduk</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30 text-center">
              <div className="text-3xl font-bold">{formatNumber(data.statistik?.permohonan_menunggu || 0)}</div>
              <div className="text-xs text-white/70">Permohonan Aktif</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DashboardAdmin;