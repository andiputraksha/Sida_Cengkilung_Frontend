// src/utils/auth.js
export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastLogin");
  // Redirect ke halaman utama
  window.location.href = "/";
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const isMasyarakat = () => {
  return hasRole("masyarakat");
};

export const isAdmin = () => {
  return hasRole("admin");
};