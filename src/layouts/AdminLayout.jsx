import { useState } from "react";
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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

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
    { name: "Dokumen", path: "/admin/dokumen", icon: Folder },
  ];

  const pageTitle = menuItems.find((item) =>
    location.pathname.includes(item.path)
  )?.name;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 90 : 260 }}
        className="bg-slate-900 text-white shadow-xl flex flex-col transition-all"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-wide">
              SIDA Admin
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-amber-600 shadow-md"
                      : "hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={20} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

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
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              {pageTitle || "Dashboard"}
            </h2>
            <p className="text-sm text-slate-500">
              Sistem Informasi Desa Cengkilung
            </p>
          </div>

          <div className="text-sm text-slate-600 font-medium">
            {user?.nama || "Admin"}
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
