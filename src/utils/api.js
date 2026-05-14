const normalizeBackendBaseUrl = (value = "") =>
  String(value)
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");

export const BACKEND_BASE_URL = normalizeBackendBaseUrl(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  window.location.origin.replace(/:\d+$/, ":5000")
);

export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

export const buildAssetUrl = (path = "") => {
  const raw = String(path ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  let normalizedPath = raw.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalizedPath) return "";

  // Be tolerant with legacy/saved paths from DB:
  // - "src/uploads/..." -> "uploads/..."
  // - "/api/uploads/..." -> "uploads/..."
  // - "<domain>/uploads/..." is handled by extracting from "/uploads/"
  normalizedPath = normalizedPath.replace(/^src\/uploads\//i, "uploads/");
  normalizedPath = normalizedPath.replace(/^api\/uploads\//i, "uploads/");

  const uploadsIndex = normalizedPath.toLowerCase().indexOf("uploads/");
  if (uploadsIndex > 0) {
    normalizedPath = normalizedPath.slice(uploadsIndex);
  }

  if (!normalizedPath) return "";

  return `${BACKEND_BASE_URL}/${normalizedPath}`;
};
