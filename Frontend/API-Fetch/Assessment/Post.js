// @ts-nocheck
const API_BASE_URL = "https://localhost:3000";

/**
 * Hàm gọi API tạo Quiz mới
 * @param {Object} quizData - Dữ liệu quiz theo đúng cấu trúc Swagger
 * @returns {Promise} - Trả về kết quả từ server
 */
async function createQuizAPI(quizData) {
    try {
        const response = await fetch(`${API_BASE_URL}/assessment/quiz/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Nếu server cần token xác thực, hãy bỏ comment dòng dưới và điền token
                // 'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            body: JSON.stringify(quizData)
        });

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