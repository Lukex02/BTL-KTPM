// @ts-nocheck
const API_BASE_URL = "http://localhost:3000";
const AUTH_API_URL = `${API_BASE_URL}/auth`;  // Define here if not global from auth.js

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/refresh`, {
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

/**
 * Hàm gọi API xóa Quiz theo Quiz ID
 * @param {string} quizId - ID của quiz cần xóa
 * @returns {Promise} - Trả về kết quả từ server
 */
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