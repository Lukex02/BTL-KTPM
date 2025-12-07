async function getMyStudentsAPI(teacherId) {
    let token = localStorage.getItem('accessToken');

    let response = await fetch(`${API_BASE_URL}/user/getInChargeUsers/${teacherId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    // Nếu token hết hạn → refresh rồi gọi lại
    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');

        response = await fetch(`${API_BASE_URL}/user/getInChargeUsers/${teacherId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách học sinh');
    }

    return data; // mảng các student
}
// Hàm API mới: Lấy tất cả students (role: Student)
async function getAllStudentsAPI() {
    let token = localStorage.getItem('accessToken');

    let response = await fetch(`${API_BASE_URL}/user/findUsersByRole/Student`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');

        response = await fetch(`${API_BASE_URL}/user/findUsersByRole/Student`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Không thể lấy danh sách học sinh');
    }

    return data; // mảng tất cả students
}

// Giả sử có API assign student (nếu chưa có, cần implement backend). Ví dụ: