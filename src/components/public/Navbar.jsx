import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, logout } from "@/utils/auth";
import { useState, useEffect, useRef } from "react";
import { buildAssetUrl } from "@/utils/api";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const logoUrl = buildAssetUrl("uploads/profil/logo.png");
  
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoError, setIsLogoError] = useState(false);
  
  const profilMenuRef = useRef(null);
  const informasiMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const timeoutRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profilMenuRef.current && !profilMenuRef.current.contains(event.target)) {
        setOpenMenu((prev) => prev === "profil" ? null : prev);
      }
      if (informasiMenuRef.current && !informasiMenuRef.current.contains(event.target)) {
        setOpenMenu((prev) => prev === "informasi" ? null : prev);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const isActiveParent = (paths) => {
    return paths.some(path => location.pathname === path);
  };

  // Handle mouse enter with clear timeout
  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenMenu(menu);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  // Mendapatkan inisial untuk avatar
  const getInitials = () => {
    if (!user?.nama_lengkap) return "U";
    return user.nama_lengkap
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2" 
          : "bg-white shadow-sm py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        
        {/* ===== LOGO ===== */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 overflow-hidden bg-white">
            {isLogoError ? (
              <div className="bg-gradient-to-br from-amber-600 to-amber-600 w-10 h-10 flex items-center justify-center text-white text-sm rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
            ) : (
              <img 
                src={logoUrl}
                alt="Logo Desa Adat Cengkilung"
                className="w-full h-full object-contain p-1"
                onError={() => setIsLogoError(true)}
              />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-gray-800 group-hover:text-amber-600 transition-colors">
              DESA ADAT
            </h1>
            <p className="text-xs text-gray-500 -mt-1">CENGKILUNG</p>
          </div>
        </Link>

        {/* ===== MOBILE MENU BUTTON ===== */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span 
              className={`w-full h-0.5 bg-gray-600 transform transition-all duration-300 origin-left ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`} 
            />
            <span 
              className={`w-full h-0.5 bg-gray-600 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`} 
            />
            <span 
              className={`w-full h-0.5 bg-gray-600 transform transition-all duration-300 origin-left ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`} 
            />
          </div>
        </button>

        {/* ===== NAVIGATION - DESKTOP ===== */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-all duration-200 hover:text-amber-600 relative group ${
              isActivePath("/") ? "text-amber-600" : "text-gray-700"
            }`}
          >
            Beranda
            <span 
              className={`absolute -bottom-1 left-0 w-full h-0.5 bg-amber-600 transform transition-transform duration-200 ${
                isActivePath("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} 
            />
          </Link>

          {/* PROFIL DROPDOWN */}
          <div
            ref={profilMenuRef}
            className="relative"
            onMouseEnter={() => handleMouseEnter("profil")}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`text-sm font-medium transition-all duration-200 hover:text-amber-600 flex items-center gap-1 group ${
                isActiveParent(["/profil-desa", "/sejarah"]) ? "text-amber-600" : "text-gray-700"
              }`}
              aria-expanded={openMenu === "profil"}
              aria-haspopup="true"
            >
              Profil Desa
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${
                  openMenu === "profil" ? "rotate-180" : ""
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openMenu === "profil" && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                onMouseEnter={() => handleMouseEnter("profil")}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/profil-desa"
                  className={`block px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors ${
                    isActivePath("/profil-desa") ? "text-amber-600 bg-amber-50" : "text-gray-700"
                  }`}
                  onClick={() => setOpenMenu(null)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Profil Desa
                  </span>
                </Link>
                <Link
                  to="/sejarah"
                  className={`block px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors ${
                    isActivePath("/sejarah") ? "text-amber-600 bg-amber-50" : "text-gray-700"
                  }`}
                  onClick={() => setOpenMenu(null)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sejarah Desa
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* INFORMASI DROPDOWN */}
          <div
            ref={informasiMenuRef}
            className="relative"
            onMouseEnter={() => handleMouseEnter("informasi")}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`text-sm font-medium transition-all duration-200 hover:text-amber-600 flex items-center gap-1 group ${
                isActiveParent(["/berita", "/galeri", "/statistik"]) ? "text-amber-600" : "text-gray-700"
              }`}
              aria-expanded={openMenu === "informasi"}
              aria-haspopup="true"
            >
              Informasi Desa
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${
                  openMenu === "informasi" ? "rotate-180" : ""
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {openMenu === "informasi" && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                onMouseEnter={() => handleMouseEnter("informasi")}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/berita"
                  className={`block px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors ${
                    isActivePath("/berita") ? "text-amber-600 bg-amber-50" : "text-gray-700"
                  }`}
                  onClick={() => setOpenMenu(null)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                    </svg>
                    Berita
                  </span>
                </Link>
                <Link
                  to="/galeri"
                  className={`block px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors ${
                    isActivePath("/galeri") ? "text-amber-600 bg-amber-50" : "text-gray-700"
                  }`}
                  onClick={() => setOpenMenu(null)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galeri
                  </span>
                </Link>
                <Link
                  to="/statistik"
                  className={`block px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors ${
                    isActivePath("/statistik") ? "text-amber-600 bg-amber-50" : "text-gray-700"
                  }`}
                  onClick={() => setOpenMenu(null)}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Statistik
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* DATA DESA - BISA DIAKSES SEMUA USER */}
          <Link
            to="/data-desa"
            className={`text-sm font-medium transition-all duration-200 hover:text-amber-600 relative group ${
              isActivePath("/data-desa") ? "text-amber-600" : "text-gray-700"
            }`}
          >
            Data Desa
            <span 
              className={`absolute -bottom-1 left-0 w-full h-0.5 bg-amber-600 transform transition-transform duration-200 ${
                isActivePath("/data-desa") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`} 
            />
          </Link>

          {/* AUTH BUTTON / PROFILE */}
          {!user ? (
            <Link
              to="/login"
              className="bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium"
            >
              Masuk
            </Link>
          ) : (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-600 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all">
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                  {user.nama_lengkap || user.name || 'Pengguna'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.nama_lengkap || user.name || 'Pengguna'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.email || ''}
                    </p>
                  </div>
                  
                  {user.role === 'masyarakat' && (
                    <Link
                      to="/"
                      className="block px-4 py-2.5 text-sm hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Halaman Publik
                      </span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* ===== MOBILE MENU ===== */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-[73px] left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-300 md:hidden ${
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2 max-h-[calc(100vh-73px)] overflow-y-auto">
            <Link
              to="/"
              className={`px-4 py-3 rounded-lg transition-colors ${
                isActivePath("/") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Beranda
            </Link>

            {/* Profil Mobile */}
            <div className="border-b border-gray-100 pb-2">
              <button
                onClick={() => setOpenMenu(openMenu === "profil-mobile" ? null : "profil-mobile")}
                className="w-full px-4 py-3 flex items-center justify-between rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                aria-expanded={openMenu === "profil-mobile"}
              >
                <span className="font-medium">Profil Desa</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openMenu === "profil-mobile" ? "rotate-180" : ""
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openMenu === "profil-mobile" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/profil-desa"
                    className={`block px-4 py-2 rounded-lg ${
                      isActivePath("/profil-desa") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setOpenMenu(null);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Profil Desa
                  </Link>
                  <Link
                    to="/sejarah"
                    className={`block px-4 py-2 rounded-lg ${
                      isActivePath("/sejarah") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setOpenMenu(null);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sejarah Desa
                  </Link>
                </div>
              )}
            </div>

            {/* Informasi Mobile */}
            <div className="border-b border-gray-100 pb-2">
              <button
                onClick={() => setOpenMenu(openMenu === "informasi-mobile" ? null : "informasi-mobile")}
                className="w-full px-4 py-3 flex items-center justify-between rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                aria-expanded={openMenu === "informasi-mobile"}
              >
                <span className="font-medium">Informasi Desa</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openMenu === "informasi-mobile" ? "rotate-180" : ""
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openMenu === "informasi-mobile" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/berita"
                    className={`block px-4 py-2 rounded-lg ${
                      isActivePath("/berita") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setOpenMenu(null);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Berita
                  </Link>
                  <Link
                    to="/galeri"
                    className={`block px-4 py-2 rounded-lg ${
                      isActivePath("/galeri") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setOpenMenu(null);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Galeri
                  </Link>
                  <Link
                    to="/statistik"
                    className={`block px-4 py-2 rounded-lg ${
                      isActivePath("/statistik") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setOpenMenu(null);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Statistik
                  </Link>
                </div>
              )}
            </div>

            {/* DATA DESA - BISA DIAKSES SEMUA USER */}
            <Link
              to="/data-desa"
              className={`px-4 py-3 rounded-lg transition-colors ${
                isActivePath("/data-desa") ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Data Desa
            </Link>

            {/* Auth Mobile */}
            <div className="pt-4 border-t border-gray-200">
              {!user ? (
                <Link
                  to="/login"
                  className="block w-full bg-gradient-to-r from-amber-600 to-amber-600 text-white px-4 py-3 rounded-lg text-center font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-amber-50 rounded-lg">
                    <p className="font-medium text-amber-700">
                      {user.nama_lengkap || user.name || 'Pengguna'}
                    </p>
                    <p className="text-xs text-amber-500 mt-1">
                      {user.email || ''}
                    </p>
                  </div>
                  
                  {user.role === 'masyarakat' && (
                    <Link
                      to="/"
                      className="block w-full bg-amber-100 text-amber-700 px-4 py-3 rounded-lg text-center font-medium hover:bg-amber-200 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Halaman Publik
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}



