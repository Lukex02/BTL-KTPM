// @ts-nocheck
// Cấu hình URL Server
const API_BASE_URL = "http://localhost:3000";
const AUTH_API_URL = `${API_BASE_URL}/auth`;

/* ===========================
   1. CÁC HÀM TIỆN ÍCH AUTH
   =========================== */

// Giải mã Token JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Lấy Header có chứa Token (Dùng cho các file fetch khác)
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Xử lý Đăng xuất
function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

/* ===========================
   2. LOGIC REFRESH TOKEN TỰ ĐỘNG
   =========================== */

// Hàm gọi API lấy Token mới
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${AUTH_API_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);
            return data.access_token;
        } else {
            throw new Error("Refresh token hết hạn");
        }
    } catch (error) {
        console.error("Lỗi refresh:", error);
        handleLogout(); // Đăng xuất nếu không refresh được
        return null;
    }
}

// Hàm fetch bọc (Wrapper) tự động refresh token khi lỗi 401
// Dùng hàm này thay cho fetch thường ở các trang nội bộ
async function authFetch(url, options = {}) {
    // 1. Gắn token vào header
    let headers = getAuthHeaders();
    if (!headers) {
        window.location.href = 'login.html';
        return;
    }
    
    // Gộp header của người dùng truyền vào (nếu có)
    options.headers = { ...headers, ...options.headers };

    // 2. Gọi API lần 1
    let response = await fetch(url, options);

    // 3. Nếu lỗi 401 (Unauthorized) -> Thử refresh token
    if (response.status === 401) {
        console.log("Token hết hạn, đang thử refresh...");
        const newToken = await refreshAccessToken();

        if (newToken) {
            // Gắn token mới và gọi lại request cũ
            options.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, options);
        }
    }

    return response;
}