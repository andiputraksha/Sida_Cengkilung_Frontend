import { Routes, Route, Navigate } from "react-router-dom";
import { getToken, getUser } from "@/utils/auth";

import Login from "@/pages/Login";

// Public
import PublicLayout from "@/layouts/PublicLayout";
import Home from "@/pages/public/Home";
import ProfilDesa from "@/pages/public/ProfilDesa";
import Sejarah from "@/pages/public/Sejarah";
import Berita from "@/pages/public/Berita";
import DetailBerita from "@/pages/public/DetailBerita";
import Galeri from "@/pages/public/Galeri";
import Statistik from "@/pages/public/Statistik";
import Layanan from "@/pages/public/Layanan";

// User Pages (tetap dalam PublicLayout tapi dengan akses berbeda)
import DataDesa from "@/pages/user/DataDesa";
import DetailDokumen from "@/pages/user/DetailDokumen";
import PermohonanDokumen from "@/pages/user/PermohonanDokumen";

// Admin Pages
import DashboardAdmin from "@/pages/admin/DashboardAdmin";
import KontenPage from "@/pages/admin/KontenPage";
import GaleriPage from "@/pages/admin/GaleriPage";
import PenggunaPage from "@/pages/admin/PenggunaPage";
import PendudukPage from "@/pages/admin/PendudukPage";
import DokumenPage from "@/pages/admin/DokumenPage";

// User Pages (dashboard - sudah tidak digunakan untuk masyarakat)
// Tapi kita tetap simpan untuk kemungkinan pengembangan ke depan
import DashboardUser from "@/pages/DashboardUser";

// Layouts
import AdminLayout from "@/layouts/AdminLayout";
import UserLayout from "@/layouts/UserLayout";

// Auth
import PrivateRoute from "@/components/PrivateRoute";
import ScrollToTop from "@/components/ScrollToTop";

function PublicAccessGuard({ children }) {
  const token = getToken();
  const user = getUser();

  // Admin yang sudah login tidak boleh mengakses halaman publik
  if (token && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Guest dan masyarakat tetap boleh akses halaman publik
  return children;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<PublicAccessGuard><PublicLayout /></PublicAccessGuard>}>
        <Route index element={<Home />} />
        <Route path="profil-desa" element={<ProfilDesa />} />
        <Route path="sejarah" element={<Sejarah />} />
        <Route path="berita" element={<Berita />} />
        <Route path="galeri" element={<Galeri />} />
        <Route path="statistik" element={<Statistik />} />
        <Route path="layanan" element={<Layanan />} />
        <Route path="berita/:id" element={<DetailBerita />} />
        
        {/* Data Desa - bisa diakses semua user, dengan fitur berbeda berdasarkan role */}
        <Route path="data-desa" element={<DataDesa />} />
        
        {/* Halaman khusus untuk user yang sudah login */}
        <Route path="dokumen/:id" element={
          <PrivateRoute allowedRoles={["masyarakat", "admin"]}>
            <DetailDokumen />
          </PrivateRoute>
        } />
        <Route path="permohonan/:id" element={
          <PrivateRoute allowedRoles={["masyarakat"]}>
            <PermohonanDokumen />
          </PrivateRoute>
        } />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/dashboard-admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Redirect dashboard user ke halaman utama karena masyarakat tidak perlu dashboard terpisah */}
      <Route path="/dashboard-user" element={<Navigate to="/" replace />} />

      {/* ================= ADMIN AREA ================= */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="konten" element={<KontenPage />} />
        <Route path="galeri" element={<GaleriPage />} />
        <Route path="pengguna" element={<PenggunaPage />} />
        <Route path="penduduk" element={<PendudukPage />} />
        <Route path="dokumen" element={<DokumenPage />} />
      </Route>

      {/* ================= USER AREA (TIDAK DIGUNAKAN UNTUK MASYARAKAT) ================= */}
      {/* Kita tetap simpan untuk pengembangan ke depan jika diperlukan */}
      <Route
        path="/user"
        element={
          <PrivateRoute allowedRoles={["masyarakat"]}>
            <UserLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardUser />} />
      </Route>

      {/* ================= 404 ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
