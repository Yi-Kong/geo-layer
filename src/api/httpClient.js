const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

function buildURL(path) {
  const baseURL = API_BASE_URL.replace(/\/$/, "");
  const requestPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseURL}${requestPath}`;
}

async function requestJSON(path, options = {}) {
  const response = await fetch(buildURL(path), options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function get(path, options) {
  return requestJSON(path, {
    ...options,
    method: "GET",
  });
}

function send(method, path, data, options = {}) {
  return requestJSON(path, {
    ...options,
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

export const request = {
  get,
  post: (path, data, options) => send("POST", path, data, options),
  put: (path, data, options) => send("PUT", path, data, options),
  patch: (path, data, options) => send("PATCH", path, data, options),
  delete: (path, data, options) => send("DELETE", path, data, options),
};
