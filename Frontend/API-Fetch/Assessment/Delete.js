async function deleteQuizAPI(quizId) {
    let token = localStorage.getItem('accessToken');
    // if (!token) {
    //     throw new Error('No access token. Please login.');
    // }

    let response = await fetch(`${API_BASE_URL}/assessment/quiz/delete/${quizId}`, {
        method: 'DELETE',
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
        response = await fetch(`${API_BASE_URL}/assessment/quiz/delete/${quizId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi xóa Quiz');
    }

    return data;  // Ví dụ: { message: "Quiz deleted" }
}