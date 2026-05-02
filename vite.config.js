import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // alias @ untuk src
    },
  },

  server: {
    host: true, // ✅ WAJIB supaya bisa diakses dari ngrok / network luar
    port: 3000,
    open: true,
    strictPort: true, // pastikan pakai port 3000 atau gagal

    // ✅ FIX: gunakan array / wildcard, jangan "all"
    allowedHosts: [
      ".ngrok-free.app", // untuk semua subdomain ngrok
    ],

    fs: {
      strict: false, // akses file luar src di dev kalau diperlukan
    },
  },

  build: {
    outDir: "build",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"), // pastikan SPA fallback ke index.html
    },
  },

  // Config tambahan supaya SPA route refresh tidak error
  base: "/", // semua path relatif

  preview: {
    host: true, // biar preview juga bisa diakses luar
    port: 5000,
  },
});