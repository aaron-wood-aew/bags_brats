const getApiUrl = () => {
    // If VITE_API_URL is set at build time, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // In production (not localhost), use the Railway backend URL
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:5001`;
    }
    // Production fallback — Railway backend
    return 'https://bagsbrats-production.up.railway.app';
};

const API_URL = getApiUrl();
export default API_URL;
