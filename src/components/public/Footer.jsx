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
      href: "https://youtube.com/@banjarcengkilung6768",
      color: "hover:bg-red-600",
      bgColor: "bg-red-600",
      // Logo YouTube asli
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: "Facebook",
      href: "https://facebook.com/share/17PwzWXDJY/",
      color: "hover:bg-blue-600",
      bgColor: "bg-blue-600",
      // Logo Facebook asli
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/+6282236624414",
      color: "hover:bg-green-500",
      bgColor: "bg-green-500",
      // Logo WhatsApp asli
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      )
    },
    {
      name: "Google Maps",
      href: "https://maps.app.goo.gl/MJ9pUDrz2apPxsK59",
      color: "hover:bg-blue-500",
      bgColor: "bg-blue-500",
      // Logo Google Maps asli
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          <path d="M12 21.5s7-7.5 7-12.5c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 5 7 12.5 7 12.5z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
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
    { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      text: "desaadatcengkilung@gmail.com", 
      href: "mailto:desaadatcengkilung@gmail.com" 
    },
    { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      text: "+62 822-3662-4414", 
      href: "https://wa.me/+6282236624414" 
    },
    { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      text: "Jl. Cekomaria II, Br. Cengkilung", 
      href: "https://maps.app.goo.gl/MJ9pUDrz2apPxsK59" 
    },
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
                      <span className="text-gray-400 group-hover:text-white transition-colors">
                        {item.icon}
                      </span>
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
                  <span className="text-gray-400 group-hover:text-white transition-colors duration-300 relative z-10">
                    {social.icon}
                  </span>
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

            {/* QR Code WhatsApp */}
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
        </div>
      </div>
    </footer>
  );
}