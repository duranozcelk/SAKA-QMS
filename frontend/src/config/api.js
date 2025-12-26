// ============================================
// API Configuration
// ============================================

// API Base URL - Vite environment variable'dan al
// Development: http://localhost:8000
// Production: https://your-backend.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API endpoints - Merkezi yönetim için
export const API_ENDPOINTS = {
    // Upload endpoints
    upload: `${API_BASE_URL}/api/upload`,

    // Files endpoints
    files: `${API_BASE_URL}/api/files`,
    fileRead: (filename) => `${API_BASE_URL}/api/files/read/${filename}`,
    fileSave: `${API_BASE_URL}/api/files/save`,
    fileDelete: (filename) => `${API_BASE_URL}/api/files/${filename}`,

    // Companies endpoints
    companies: `${API_BASE_URL}/api/companies`,
    companyFolders: (companyName) => `${API_BASE_URL}/api/companies/${companyName}/folders`,
};

// Axios default config (eğer axios kullanıyorsanız)
export const axiosConfig = {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 saniye (Render free tier için yeterli)
    headers: {
        'Content-Type': 'application/json',
    },
};

// Fetch helper function (opsiyonel)
export const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

// Export environment info for debugging
export const ENV_INFO = {
    mode: import.meta.env.MODE,
    apiUrl: API_BASE_URL,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
};

// Development'ta console'a yazdır
if (import.meta.env.DEV) {
    console.log('🚀 API Configuration:', ENV_INFO);
}
