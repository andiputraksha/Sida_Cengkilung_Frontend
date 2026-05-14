import { Link } from "react-router-dom";
import { useState } from "react";
import { buildAssetUrl } from "@/utils/api";
import qrCodeImage from "@/assets/qrcode.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLogoError, setIsLogoError] = useState(false);
  const logoUrl = buildAssetUrl("uploads/profil/logo.png");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Logic untuk subscribe newsletter
      console.log("Subscribe:", email);
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const socialMedia = [
    {
      name: "YouTube",
      icon: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z",
      play: "M9.75 15.02l5.75-3.27-5.75-3.27v6.54z",
      href: "https://youtube.com/@banjarcengkilung6768",
      color: "hover:bg-red-600",
      bgColor: "bg-red-600"
    },
    {
      name: "Facebook",
      icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
      href: "https://facebook.com/share/17PwzWXDJY/",
      color: "hover:bg-emerald-600",
      bgColor: "bg-emerald-600"
    },
    {
      name: "WhatsApp",
      icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
      href: "https://wa.me/+6282236624414",
      color: "hover:bg-green-600",
      bgColor: "bg-green-600"
    },
    // {
    //   name: "Instagram",
    //   icon: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M21 16v-4a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4z",
    //   href: "https://instagram.com/desa.adat.cengkilung",
    //   color: "hover:bg-amber-600",
    //   bgColor: "bg-gradient-to-tr from-yellow-400 via-amber-500 to-amber-600"
    // },
    {
      name: "Google Maps",
      icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      href: "https://maps.app.goo.gl/MJ9pUDrz2apPxsK59",
      color: "hover:bg-green-600",
      bgColor: "bg-green-600"
    }
  ];

  const quickLinks = [
    { name: "Beranda", path: "/" },
    { name: "Profil Desa", path: "/profil-desa" },
    { name: "Sejarah Desa", path: "/sejarah" },
    { name: "Berita Desa", path: "/berita" },
    { name: "Galeri", path: "/galeri" },
    { name: "Statistik", path: "/statistik" },
    { name: "Data Desa", path: "/data-desa" },
  ];

  const contactInfo = [
    { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", text: "desaadatcengkilung@gmail.com", href: "mailto:desaadatcengkilung@gmail.com" },
    { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", text: "+62 822-3662-4414", href: "https://wa.me/+6282236624414" },
    { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", text: "Jl. Cekomaria II, Br. Cengkilung", href: "https://maps.app.goo.gl/MJ9pUDrz2apPxsK59" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-0 overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} 
        />
      </div>

      {/* Animated Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-500"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={scrollToTop}>
              <div className="w-14 h-14 flex items-center justify-center rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 overflow-hidden bg-white">
                {isLogoError ? (
                  <div className="bg-gradient-to-br from-emerald-500 to-amber-600 w-14 h-14 flex items-center justify-center text-white text-sm rounded-xl">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
                <h2 className="font-bold text-xl tracking-wide text-white">
                  DESA ADAT
                </h2>
                <p className="text-sm text-emerald-400 -mt-1">CENGKILUNG</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Sistem Informasi Desa Adat Cengkilung - Pusat informasi dan komunikasi warga desa adat. Melestarikan tradisi, memajukan budaya, dan membangun kebersamaan.
            </p>

            {/* Newsletter Subscription */}
            {/* <div className="pt-4">
              <h4 className="text-sm font-semibold text-white mb-3">Langganan Newsletter</h4>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Kirim
                </button>
              </form>
              {isSubscribed && (
                <p className="text-xs text-green-400 mt-2 animate-pulse">
                  âœ“ Berhasil berlangganan newsletter!
                </p>
              )}
            </div> */}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Tautan Cepat
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500"></span>
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Kontak & Informasi
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500"></span>
            </h3>
            <ul className="space-y-4">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors duration-300">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors break-all">
                      {item.text}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Ikuti Kami
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500"></span>
            </h3>
            
            {/* Social Media Icons */}
            <div className="flex flex-wrap gap-3">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 ${social.color}`}
                  aria-label={social.name}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${social.bgColor}`}></div>
                  <svg 
                    className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300 relative z-10" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={social.icon} />
                  </svg>
                  {social.play && (
                    <svg 
                      className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors duration-300 absolute bottom-2 right-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.play} />
                    </svg>
                  )}
                </a>
              ))}
            </div>

            {/* Additional Info */}
            <div className="pt-4 space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online 24/7
              </p>
              <p className="text-xs text-gray-500">
                Response time: &lt; 24 jam
              </p>
            </div>

            {/* QR Code WhatsApp (local asset to avoid external request errors) */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-3 text-center font-medium">Scan untuk WhatsApp</p>
              <div className="w-36 h-36 bg-white rounded-lg flex items-center justify-center mx-auto overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <img
                  src={qrCodeImage}
                  alt="QR Code WhatsApp Desa Adat Cengkilung"
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">+62 822-3662-4414</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-gray-800 py-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Desa Adat Cengkilung. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              {/* <Link to="/privacy" className="text-xs text-gray-500 hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <Link to="/terms" className="text-xs text-gray-500 hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link> */}
              <button 
                onClick={scrollToTop}
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 hover:-translate-y-1"
                aria-label="Back to top"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Counter */}
          {/* <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2.500+</div>
              <div className="text-xs text-gray-500">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-xs text-gray-500">Berita & Artikel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-xs text-gray-500">Kegiatan Adat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1920</div>
              <div className="text-xs text-gray-500">Tahun Berdiri</div>
            </div>
          </div> */}
        </div>
      </div>
    </footer>
  );
}

