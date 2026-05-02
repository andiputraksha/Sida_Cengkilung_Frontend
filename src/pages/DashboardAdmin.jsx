import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, getUser, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/utils/api";
function DashboardAdmin() {
  const [data, setData] = useState(null);
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
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h2>Dashboard Admin</h2>
      <p>Selamat datang, {user.nama}</p>

      <hr />

      <h3>Statistik</h3>
      <div style={{ display: "flex", gap: "20px" }}>
        <Card title="Total Penduduk" value={data.statistik.total_penduduk} />
        <Card title="Total Konten" value={data.statistik.total_konten} />
        <Card title="Total Dokumen" value={data.statistik.total_dokumen} />
        <Card title="Permohonan Menunggu" value={data.statistik.permohonan_menunggu} />
      </div>

      <hr />

      <h3>Distribusi Penduduk</h3>
      {data.distribusi_penduduk.map((item, index) => (
        <div key={index}>
          {item.status} : {item.jumlah} orang ({item.persentase}%)
        </div>
      ))}

      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      padding: "20px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      width: "180px"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

export default DashboardAdmin;

