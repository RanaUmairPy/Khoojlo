export const API_BASE = 'https://rumairpy.pythonanywhere.com/api';
// Public domain root for media/static files (no /api prefix)
export const MEDIA_BASE = 'https://rumairpy.pythonanywhere.com';

// small helper to build absolute URLs
const buildUrl = (path) => {
  if (!path) return API_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  // ensure leading slash
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

// apiFetch: fetch wrapper with timeout, JSON handling and optional auth
export async function apiFetch(path, opts = {}) {
  const url = buildUrl(path);
  const controller = new AbortController();
  const timeout = opts.timeout || 10000; // 10s default
  const timer = setTimeout(() => controller.abort(), timeout);

  const headers = Object.assign(
    {
      Accept: 'application/json',
    },
    opts.headers || {}
  );

  // attach JSON content-type when sending a body and not a FormData
  if (opts.body && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // attach Authorization if token present
  try {
    const access = localStorage.getItem('access');
    if (access) headers['Authorization'] = `Bearer ${access}`;
  } catch (e) {
    // ignore localStorage errors
  }

  const fetchOpts = {
    method: opts.method || (opts.body ? 'POST' : 'GET'),
    headers,
    signal: controller.signal,
    credentials: opts.credentials || 'same-origin',
    // allow passing already-stringified body or objects
    body:
      opts.body && !(opts.body instanceof FormData) && typeof opts.body !== 'string'
        ? JSON.stringify(opts.body)
        : opts.body,
  };

  try {
    const res = await fetch(url, fetchOpts);
    clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      payload = await res.json().catch(() => null);
    } else {
      payload = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const err = new Error(`API request failed with status ${res.status}`);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  } catch (err) {
    clearTimeout(timer);
    // normalize AbortError to a clearer message
    if (err.name === 'AbortError') {
      const e = new Error('Request timed out');
      e.name = 'TimeoutError';
      throw e;
    }
    throw err;
  }
}

// add default export for modules that import default
export default {
  API_BASE,
  MEDIA_BASE,
  apiFetch,
};
