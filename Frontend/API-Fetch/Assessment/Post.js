// @ts-nocheck
const API_BASE_URL = "http://localhost:3000";

/**
 * Hàm gọi API tạo Quiz mới
 * @param {Object} quizData - Dữ liệu quiz theo đúng cấu trúc Swagger
 * @returns {Promise} - Trả về kết quả từ server
 */
async function createQuizAPI(quizData) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No access token. Please login.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/assessment/quiz/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Thêm header auth
            },
            body: JSON.stringify(quizData)
        });

        if (response.status === 401) {
            // Token expire - Bạn có thể add refresh logic ở đây nếu có
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Có lỗi xảy ra khi tạo Quiz');
        }

        return data; 
    } catch (error) {
        console.error("Lỗi gọi API createQuiz:", error);
        throw error; 
    }
}