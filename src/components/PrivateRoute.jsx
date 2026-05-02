import { Navigate } from "react-router-dom";
import { getToken, getUser } from "@/utils/auth"; // pastikan alias @ sudah terpasang

/**
 * PrivateRoute
 * Props:
 * - children: komponen yang di-wrap
 * - allowedRoles: array role yang boleh mengakses route
 */
function PrivateRoute({ children, allowedRoles }) {
  const token = getToken();
  
  // Gunakan getUser sekali, jangan membuat object baru tiap render
  const user = getUser(); 

  // Jika tidak login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak di-allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;