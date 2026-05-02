import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const targetPath = user?.role === "admin" ? "/admin/dashboard" : "/";
    const timer = setTimeout(() => {
      navigate(targetPath, { replace: true });
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate, user?.role]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          <h2 className="text-lg font-semibold text-slate-800">Mengalihkan Halaman</h2>
          <p className="text-sm text-slate-600">
            {user?.role === "admin"
              ? "Admin diarahkan ke dashboard admin."
              : "Masyarakat diarahkan ke halaman publik."}
          </p>
        </div>
      </div>
    </div>
  );
}

