import { Outlet } from "react-router-dom";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1 pt-[73px]"> {/* Tambahkan padding-top untuk navbar fixed */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}