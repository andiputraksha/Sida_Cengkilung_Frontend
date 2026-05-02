import { getUser, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function DashboardUser() {
  const user = getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Dashboard Masyarakat</h2>
      <p>Selamat datang, {user.nama}</p>

      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default DashboardUser;