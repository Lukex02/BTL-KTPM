async function getQuizzesByUserIdAPI(userId) {
    let token = localStorage.getItem('accessToken');

    let response = await fetch(`${API_BASE_URL}/assessment/quiz/findByUserId/${userId}`, {
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
        response = await fetch(`${API_BASE_URL}/assessment/quiz/findByUserId/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi lấy danh sách Quiz');
    }

    return data;
}

/**
 * Hàm gọi API lấy chi tiết Quiz theo Quiz ID
 * @param {string} quizId - ID của quiz
 * @returns {Promise<Object>} - Trả về object quiz từ server
 */
async function getQuizByIdAPI(quizId) {
    let token = localStorage.getItem('accessToken');
    // if (!token) {
    //     throw new Error('No access token. Please login.');
    // }

    let response = await fetch(`${API_BASE_URL}/assessment/quiz/findById/${quizId}`, {
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
        response = await fetch(`${API_BASE_URL}/assessment/quiz/${quizId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi lấy chi tiết Quiz');
    }

    return data;  // Giả sử data là {id, title, description, questions: [...]}
}