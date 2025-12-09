async function changePasswordAPI(oldPassword, newPassword, confirmNewPassword) {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');  // ← ĐÚNG: dùng userId (camelCase)

    if (!userId) {
        throw new Error('Không tìm thấy tài khoản. Vui lòng đăng nhập lại.');
    }

    const payload = {
        userId: userId,  // ← gửi đúng userId
        oldPassword,
        newPassword,
        confirmNewPassword
    };

    console.log('Đang gửi đổi mật khẩu:', payload);

    let response = await fetch(`${API_BASE_URL}/user/changePassword`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
            throw new Error('Phiên đăng nhập đã hết hạn.');
        }
        response = await fetch(`${API_BASE_URL}/user/changePassword`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify(payload)
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
    }

    return data;
}




/**
 * Hàm gọi API cập nhật profile user
 * @param {Object} userData - Dữ liệu user: {id, username, role, name, email}
 * @returns {Promise} - Trả về kết quả từ server
 */
async function updateUserAPI(userData) {
    let token = localStorage.getItem('accessToken');

    let response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
            throw new Error('Session expired. Please login again.');
        }
        response = await fetch(`${API_BASE_URL}/user/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật profile');
    }

    return data;  // Ví dụ: { message: "User updated" }
}