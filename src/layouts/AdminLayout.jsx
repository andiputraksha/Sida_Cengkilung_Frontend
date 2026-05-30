import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Database,
  Folder,
  LogOut,
  Menu,
  AlertTriangle,
  X,
  Bell,
  Clock,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "@/utils/api";

const SURAT_API_URL = `${API_BASE_URL}/surat`;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [suratNotifications, setSuratNotifications] = useState({
    totalPending: 0,
    urgentCount: 0,
    importantCount: 0,
    totalActive: 0,
    urgentList: [] // Daftar surat mendesak untuk tooltip/alert
  });
  const [showUrgentAlert, setShowUrgentAlert] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Fetch data surat untuk notifikasi
  useEffect(() => {
    const fetchSuratNotifications = async () => {
      try {
        const res = await axios.get(`${SURAT_API_URL}/admin/semua`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const pengajuan = res.data.data || [];
        const ACTIVE_SURAT_STATUSES = ["MENUNGGU", "DRAFT", "LEGALISI", "SIAP"];
        
        // Fungsi helper untuk menentukan prioritas
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
          const dateFieldKeywords = ["tanggal", "dewasa", "pelaksanaan", "kegiatan", "upacara", "karya"];
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
          const deadline = submittedAt ? addBusinessDays(submittedAt, 5) : null; // 5 hari kerja SOP
          const remainingBusinessDays = deadline ? countBusinessDaysBetween(new Date(), deadline) : null;
          const overdue = deadline ? new Date().setHours(0, 0, 0, 0) > new Date(deadline).setHours(0, 0, 0, 0) : false;
          const jenis = normalizePriorityText(item.jenis_surat?.nama_jenis || item.nama_jenis || "");
          const details = normalizePriorityText(getDetailText(item));
          const combined = `${jenis} ${details}`;
          const eventDate = findEventDate(item);
          const daysToEvent = eventDate ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

          const urgentKeywords = ["mendesak", "darurat", "besok", "lusa", "kematian", "hukum", "klaim", "jaminan", "dispensasi"];
          const importantKeywords = ["warisan budaya", "pawiwahan", "perkawinan", "perceraian", "sengketa", "klaim", "verifikasi", "pecalang", "menengah"];

          if (
            overdue ||
            remainingBusinessDays === 0 ||
            remainingBusinessDays === 1 ||
            urgentKeywords.some((keyword) => combined.includes(keyword)) ||
            (jenis.includes("pelaksanaan karya") && daysToEvent !== null && daysToEvent <= 2)
          ) {
            return {
              level: "merah",
              label: "Mendesak / Kritis",
              remainingBusinessDays,
              reason: overdue ? "melewati SOP 5 hari kerja" : "mendekati batas SOP",
              pemohon: item.pemohon?.nama_lengkap || item.pemohon_nama || "-",
              jenisSurat: item.jenis_surat?.nama_jenis || item.nama_jenis || "-"
            };
          }

          if (
            remainingBusinessDays === 2 ||
            remainingBusinessDays === 3 ||
            importantKeywords.some((keyword) => combined.includes(keyword)) ||
            (jenis.includes("pelaksanaan karya") && daysToEvent !== null && daysToEvent <= 30)
          ) {
            return {
              level: "kuning",
              label: "Penting",
              remainingBusinessDays,
              reason: "perlu verifikasi/koordinasi",
              pemohon: item.pemohon?.nama_lengkap || item.pemohon_nama || "-",
              jenisSurat: item.jenis_surat?.nama_jenis || item.nama_jenis || "-"
            };
          }

          return {
            level: "hijau",
            label: "Rutin / Aman",
            remainingBusinessDays,
            reason: "pengajuan rutin",
            pemohon: item.pemohon?.nama_lengkap || item.pemohon_nama || "-",
            jenisSurat: item.jenis_surat?.nama_jenis || item.nama_jenis || "-"
          };
        };

        // Hitung notifikasi
        const activeSurat = pengajuan.filter((item) => ACTIVE_SURAT_STATUSES.includes(item.status));
        const pendingSurat = pengajuan.filter((item) => item.status === "MENUNGGU");
        let urgentCount = 0;
        let importantCount = 0;
        const urgentList = [];

        activeSurat.forEach((item) => {
          const priority = getSuratPriority(item);
          if (priority.level === "merah") {
            urgentCount++;
            urgentList.push(priority);
          } else if (priority.level === "kuning") {
            importantCount++;
          }
        });

        setSuratNotifications({
          totalPending: pendingSurat.length,
          urgentCount,
          importantCount,
          totalActive: activeSurat.length,
          urgentList: urgentList.slice(0, 5) // Maksimal 5 item untuk ditampilkan
        });

      } catch (error) {
        console.error("Error fetching surat notifications:", error);
      }
    };

    // Fetch pertama kali
    fetchSuratNotifications();

    // Polling setiap 2 menit untuk update notifikasi
    const interval = setInterval(fetchSuratNotifications, 120000);
    
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Konten", path: "/admin/konten", icon: FileText },
    { name: "Galeri", path: "/admin/galeri", icon: Image },
    { name: "Pengguna", path: "/admin/pengguna", icon: Users },
    { name: "Penduduk", path: "/admin/penduduk", icon: Database },
    { 
      name: "Dokumen", 
      path: "/admin/dokumen", 
      icon: Folder,
      // Tambahkan notifikasi badge
      notification: suratNotifications.totalPending > 0 ? {
        count: suratNotifications.totalPending,
        urgent: suratNotifications.urgentCount > 0
      } : null
    },
  ];

  const pageTitle = menuItems.find((item) =>
    location.pathname.includes(item.path)
  )?.name;

  const hasUrgentItems = suratNotifications.urgentCount > 0;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 90 : 260 }}
        className="bg-slate-900 text-white shadow-xl flex flex-col transition-all relative z-20"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                SIDA Admin
              </h1>
              {hasUrgentItems && (
                <p className="text-xs text-amber-400 mt-0.5 font-medium">
                  Sistem Informasi Desa
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            const hasNotification = item.notification;
            
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all relative ${
                    isActive
                      ? "bg-amber-600 shadow-md"
                      : "hover:bg-slate-800"
                  }`
                }
              >
                <div className="relative">
                  <Icon size={20} />
                  {/* Notifikasi badge untuk menu Dokumen */}
                  {hasNotification && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold ${
                        hasNotification.urgent 
                          ? "bg-red-500 text-white animate-pulse" 
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {hasNotification.count > 99 ? "99+" : hasNotification.count}
                    </motion.span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>{item.name}</span>
                    {/* Informasi tambahan untuk menu Dokumen */}
                    {hasNotification && !isActive && (
                      <div className="flex flex-col items-end">
                        {hasNotification.urgent && (
                          <span className="text-[10px] text-red-400 font-semibold leading-tight">
                            {suratNotifications.urgentCount} Mendesak
                          </span>
                        )}
                        <span className="text-[10px] text-amber-400 leading-tight">
                          {hasNotification.count} Menunggu
                        </span>
                      </div>
                    )}
                    {hasNotification && isActive && (
                      <div className="flex flex-col items-end">
                        {hasNotification.urgent && (
                          <span className="text-[10px] text-red-200 font-semibold leading-tight">
                            {suratNotifications.urgentCount} Mendesak
                          </span>
                        )}
                        <span className="text-[10px] text-amber-200 leading-tight">
                          {hasNotification.count} Menunggu
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {/* Indikator mendesak saat sidebar collapsed */}
                {collapsed && hasNotification?.urgent && (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Notifikasi Urgent di Sidebar Footer (saat tidak collapsed) */}
        {!collapsed && hasUrgentItems && (
          <div className="px-3 pb-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-white" />
                <p className="text-xs font-semibold text-white">
                  Prioritas Mendesak!
                </p>
              </div>
              <p className="text-[10px] text-red-100 leading-relaxed">
                {suratNotifications.urgentCount} surat memerlukan penanganan segera. 
                Segera proses di menu Dokumen.
              </p>
              <button
                onClick={() => navigate("/admin/dokumen")}
                className="mt-2 w-full text-[10px] bg-white/20 hover:bg-white/30 text-white rounded-lg py-1.5 font-medium transition-colors flex items-center justify-center gap-1"
              >
                Proses Sekarang <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          </div>
        )}

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={openLogoutModal}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-600 hover:bg-red-700 transition-all"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header dengan Alert Urgent */}
        <header className="bg-white shadow-sm">
          {/* Urgent Alert Bar */}
          <AnimatePresence>
            {hasUrgentItems && showUrgentAlert && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 overflow-hidden"
              >
                <div className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        ⚠️ Ada Prioritas Penanganan Surat!
                      </p>
                      <p className="text-red-100 text-xs">
                        <span className="font-bold">{suratNotifications.urgentCount} surat mendesak</span> memerlukan penanganan segera. 
                        {suratNotifications.importantCount > 0 && (
                          <span> + {suratNotifications.importantCount} surat penting.</span>
                        )}
                        {" "}Total {suratNotifications.totalActive} surat aktif menunggu proses.
                      </p>
                      
                      {/* Detail surat mendesak */}
                      {suratNotifications.urgentList.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {suratNotifications.urgentList.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-red-100">
                              <span className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0"></span>
                              <span className="font-medium">{item.jenisSurat}</span>
                              <span className="text-red-200">- {item.pemohon}</span>
                              <span className="text-red-300">({item.reason})</span>
                            </div>
                          ))}
                          {suratNotifications.urgentList.length > 2 && (
                            <p className="text-xs text-red-200 pl-4">
                              + {suratNotifications.urgentList.length - 2} surat lainnya
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/admin/dokumen")}
                      className="px-4 py-2 bg-white text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <Folder className="w-4 h-4" />
                      Buka Manajemen Surat
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                    <button
                      onClick={() => setShowUrgentAlert(false)}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Tutup notifikasi"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Utama */}
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                {pageTitle || "Dashboard"}
                {pageTitle === "Dokumen" && suratNotifications.totalPending > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      suratNotifications.urgentCount > 0
                        ? "bg-red-100 text-red-700 border-2 border-red-300"
                        : "bg-amber-100 text-amber-700 border-2 border-amber-300"
                    }`}
                  >
                    {suratNotifications.urgentCount > 0 ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {suratNotifications.urgentCount} Mendesak
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        {suratNotifications.totalPending} Menunggu
                      </>
                    )}
                  </motion.span>
                )}
              </h2>
              <p className="text-sm text-slate-500">
                Sistem Informasi Desa Cengkilung
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick notification indicator */}
              {hasUrgentItems && !showUrgentAlert && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setShowUrgentAlert(true)}
                  className="relative p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  title="Tampilkan notifikasi mendesak"
                >
                  <Bell className="w-5 h-5 text-red-600" />
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {suratNotifications.urgentCount}
                  </motion.span>
                </motion.button>
              )}

              <div className="text-sm text-slate-600 font-medium">
                {user?.nama || "Admin"}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-md p-6 min-h-[70vh]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeLogoutModal}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Konfirmasi Logout
                    </h3>
                  </div>
                  <button
                    onClick={closeLogoutModal}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Apakah Anda yakin ingin keluar dari sistem? 
                    Anda akan dialihkan ke halaman login.
                  </p>
                  
                  {/* User Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Sedang login sebagai:</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {user?.nama || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleLogout();
                      closeLogoutModal();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Ya, Logout
                  </button>
                  <button
                    onClick={closeLogoutModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}