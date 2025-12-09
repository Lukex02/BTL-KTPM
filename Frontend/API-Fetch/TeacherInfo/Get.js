/**
 * Hàm gọi API lấy thông tin user theo ID
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} - Trả về object user từ server
 */
async function getUserByIdAPI(userId) {
    let token = localStorage.getItem('accessToken');

    let response = await fetch(`${API_BASE_URL}/user/self`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
            throw new Error('Session expired. Please login again.');
        }
        response = await fetch(`${API_BASE_URL}/user/self`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi lấy thông tin user');
    }

    return data;  // Giả sử data là {id, username, role, name, email}
}
