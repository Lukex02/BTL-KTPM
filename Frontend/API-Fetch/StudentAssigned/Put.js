async function assignStudentAPI(teacherId, studentId) {
    let token = localStorage.getItem('accessToken');

    const payload = {
        teacherId,
        studentId
    };

    let response = await fetch(`${API_BASE_URL}/user/link`, { // Giả định endpoint /user/assignStudent
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Phiên đăng nhập hết hạn.');

        response = await fetch(`${API_BASE_URL}/user/link`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Không thể giao học sinh');
    }

    return data;
}
async function assignQuizToUserAPI(quizId, userId) {
    let token = localStorage.getItem('accessToken');

    const payload = {
        quizId,
        userId
    };

    let response = await fetch(`${API_BASE_URL}/assessment/quiz/assign`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');

        response = await fetch(`${API_BASE_URL}/assessment/quiz/assign`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Không thể assign quiz cho student');
    }

    return data;
}
// Add this to Post.js, after the existing functions