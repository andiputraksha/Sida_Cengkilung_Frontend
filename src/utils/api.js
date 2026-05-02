export const BACKEND_BASE_URL = (
  import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(/:\d+$/, ":5000")
).replace(/\/$/, "");

export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

export const buildAssetUrl = (path = "") => {
  const raw = String(path ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalizedPath = raw.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalizedPath) return "";

  return `${BACKEND_BASE_URL}/${normalizedPath}`;
};
