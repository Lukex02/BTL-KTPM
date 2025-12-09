// @ts-nocheck
const API_BASE_URL = "http://localhost:3000";
const AUTH_API = `${API_BASE_URL}/auth`;  // Define here if not global from auth.js

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        const response = await fetch(`${AUTH_API}/refresh`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
            },
        });

        if (response.status === 201 || response.status === 200) {
            const data = await response.json();
            
            // Luôn lưu access_token mới
            localStorage.setItem('accessToken', data.access_token);

            // Nếu có refresh_token mới thì lưu, không có thì thôi (vẫn giữ cái cũ)
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }
            // ← Không throw error gì cả nếu thành công

            return data.access_token;
        } else {
            // Chỉ khi thực sự bị từ chối mới logout
            console.error("Refresh token bị từ chối:", response.status);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = 'login.html';
            return null;
        }
    } catch (error) {
        console.error("Lỗi mạng khi refresh token:", error);
        // Chỉ logout khi thực sự lỗi mạng nghiêm trọng, không phải do token hết hạn
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = 'login.html';
        return null;
    }
}
/**
 * Hàm gọi API tạo Quiz mới
 * @param {Object} quizData - Dữ liệu quiz theo đúng cấu trúc Swagger
 * @returns {Promise} - Trả về kết quả từ server
 */
async function createQuizAPI(quizData) {
    let token = localStorage.getItem('accessToken');
    // if (!token) {
    //     throw new Error('No access token. Please login.');
    // }
    console.log('Full JSON Body:', JSON.stringify(quizData, null, 2));
    console.log('Authorization Header:', `Bearer ${token}`);

    let response = await fetch(`${API_BASE_URL}/assessment/quiz/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizData)
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
            throw new Error('Session expired. Please login again.');
        }
        response = await fetch(`${API_BASE_URL}/assessment/quiz/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quizData)
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi tạo Quiz');
    }

    return data;
}

/**
 * Hàm gọi API lấy danh sách Quiz theo User ID
 * @param {string} userId - ID của user
 * @returns {Promise<Array>} - Trả về mảng quizzes từ server
 */


/**
 * Hàm gọi API xóa Quiz theo Quiz ID
 * @param {string} quizId - ID của quiz cần xóa
 * @returns {Promise} - Trả về kết quả từ server
 */



