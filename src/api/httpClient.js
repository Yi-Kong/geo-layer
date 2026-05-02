const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function buildURL(path) {
  const baseURL = API_BASE_URL.replace(/\/$/, "");
  const requestPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseURL}${requestPath}`;
}

export async function getJSON(path) {
  const response = await fetch(buildURL(path));

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}
