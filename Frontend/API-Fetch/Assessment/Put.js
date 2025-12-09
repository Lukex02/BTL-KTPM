/**
 * Hàm gọi API cập nhật Quiz
 * @param {string} quizId - ID của quiz cần cập nhật
 * @param {Object} quizData - Dữ liệu quiz cập nhật (tương tự create)
 * @returns {Promise} - Trả về kết quả từ server
 */
async function updateQuizAPI(quizId, quizData) {
    let token = localStorage.getItem('accessToken');
    // if (!token) {
    //     throw new Error('No access token. Please login.');
    // }
    console.log('Full JSON Body for Update:', JSON.stringify(quizData, null, 2));
    console.log('Authorization Header:', `Bearer ${token}`);

    let response = await fetch(`${API_BASE_URL}/assessment/quiz/update`, {
        method: 'PUT',
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
        response = await fetch(`${API_BASE_URL}/assessment/quiz/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(quizData)
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật Quiz');
    }

    return data;
}