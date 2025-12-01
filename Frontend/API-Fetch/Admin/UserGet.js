// @ts-nocheck
/* =========================================
   USER GET: Quản lý hiển thị Student & Teacher
   ========================================= */

const ADMIN_API_URL = "http://localhost:3000";

async function fetchSystemUsers() {
    const userId = localStorage.getItem('userId');
    if (!userId) return; 

    try {
        const response = await authFetch(`${ADMIN_API_URL}/user/getAll`, {
            method: 'GET'
        });

        if (!response.ok) throw new Error("Không lấy được dữ liệu hệ thống");

        const allUsers = await response.json();

        // --- BƯỚC 1: LỌC DỮ LIỆU ---
        const students = allUsers.filter(u => u.role && u.role.toLowerCase() === 'student');
        const teachers = allUsers.filter(u => u.role && u.role.toLowerCase() === 'teacher'); // Hoặc 'lecturer' tùy database
        
        console.log(`Data loaded: ${students.length} Students, ${teachers.length} Teachers.`);

        // --- BƯỚC 2: CẬP NHẬT UI ---
        updateStudentTable(students);
        updateTeacherGrid(teachers);

    } catch (error) {
        console.error("System Load Error:", error);
    }
}

// === PHẦN 1: HÀM HIỂN THỊ STUDENT (Dạng Bảng) ===
function updateStudentTable(users) {
    const tableBody = document.querySelector('#students .data-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; 

    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No students found.</td></tr>`;
        return;
    }

    users.forEach(user => {
        // Xử lý dữ liệu an toàn (tránh null/undefined)
        const displayId = user.id ? `#${user.id.substring(0, 6)}` : 'N/A';
        const displayName = user.name || 'Unknown Name';
        const displayUsername = user.username || 'N/A';
        const displayEmail = user.email || 'N/A';
        
        // Tạo dòng tr với 4 cột thông tin chính + Status + Action
        const row = `
            <tr>
                <td>${displayId}</td>
                <td>
                    <div class="user-cell">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayUsername)}&background=random" class="avatar-sm">
                       ${displayUsername}
                    </div>
                </td>
                <td>${displayName}</td>
                <td>${displayEmail}</td>
                <td><span class="badge active">Active</span></td>
                <td>
                    <button class="btn-sm" onclick="viewDetail('${user.id}', 'student', '${encodeURIComponent(displayName)}')">View Detail</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// === PHẦN 2: HÀM HIỂN THỊ TEACHER (Dạng Grid/Card) ===
function updateTeacherGrid(users) {
    // Tìm container chứa các card giáo viên
    const gridContainer = document.querySelector('#teachers .teacher-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = ''; // Xóa nội dung Loading/Cũ

    if (users.length === 0) {
        gridContainer.innerHTML = `<p style="text-align:center; width:100%;">No teachers found.</p>`;
        return;
    }

    users.forEach(user => {
        const displayName = user.name || user.username || 'Instructor';
        // Vì Teacher dạy nhiều khóa, ta đếm assignedContentIds (hoặc quizIds) làm số liệu
        const coursesCount = Array.isArray(user.assignedContentIds) ? user.assignedContentIds.length : 0;
        const quizCount = Array.isArray(user.assignedQuizIds) ? user.assignedQuizIds.length : 0;

        // HTML Card giống mẫu Admin HTML cũ của bạn
        const card = `
            <div class="teacher-card">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c7d2fe&color=3730a3" alt="Avatar">
                <h4>${displayName}</h4>
                <p>Teacher / Lecturer</p>
                <div class="t-stats">
                    <div><strong>${coursesCount}</strong> Content</div>
                    <div><strong>${quizCount}</strong> Quizzes</div>
                </div>
                <button class="btn-block" onclick="viewDetail('${user.id}', 'teacher', '${encodeURIComponent(displayName)}')">View Profile</button>
            </div>
        `;
        gridContainer.insertAdjacentHTML('beforeend', card);
    });
}

async function viewDetail(userId, type, userNameEncoded = '') {
    const userName = decodeURIComponent(userNameEncoded) || 'User';
    console.log(`Đang xem chi tiết ${type}:`, userId);

    // 1. Hiển thị Modal & Loading
    const modal = document.getElementById('detailModal');
    const container = document.getElementById('user-quiz-list');
    const headerInfo = document.getElementById('modal-user-info');

    if (!modal || !container) return;

    // Set Header Modal (Avatar + Name)
    headerInfo.innerHTML = `
        <img src="https://ui-avatars.com/api/?name=${userNameEncoded}&background=random&size=64" class="avatar-md" style="border-radius:50%">
        <div>
            <h2 style="margin:0">${userName}</h2>
            <p style="margin:0; color:#666">ID: ${userId}</p>
        </div>
    `;

    container.innerHTML = '<p style="text-align:center; padding:20px;">Loading quizzes data...</p>';
    modal.style.display = 'flex'; // Mở modal ngay

    // 2. Gọi API lấy danh sách Quiz
    try {
        const response = await authFetch(`${ADMIN_API_URL}/assessment/quiz/findByUserId/${userId}`);
        
        if (!response.ok) throw new Error("Không thể tải dữ liệu Quiz.");
        
        const quizzes = await response.json();
        renderQuizList(quizzes, container);

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="color:red; text-align:center;">Lỗi: ${error.message}</p>`;
    }
}

// Hàm render danh sách Quiz vào Modal
function renderQuizList(quizzes, container) {
    container.innerHTML = '';

    if (!quizzes || quizzes.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; width:100%">Người dùng này chưa tạo Quiz nào.</p>';
        return;
    }

    quizzes.forEach((quiz, index) => {
        // Đếm số câu hỏi
        const qCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
        const uniqueId = `q-toggle-${index}`; // ID cho dropdown

        // Tạo HTML cho từng câu hỏi bên trong (ẩn mặc định)
        let questionsHtml = '';
        if (qCount > 0) {
            questionsHtml = quiz.questions.map((q, i) => `
                <div class="q-item">
                    <strong>Q${i+1}: ${escapeHtml(q.question)}</strong>
                    <span class="q-correct">Answer: ${escapeHtml(q.correctAnswer)}</span>
                </div>
            `).join('');
        } else {
            questionsHtml = '<div class="q-item">No questions data.</div>';
        }

        // Tạo Card HTML
        const card = `
            <div class="quiz-detail-card">
                <div class="quiz-meta">
                    <span class="badge" style="background:#e0e7ff; color:#4338ca;">${quiz.type || 'Quiz'}</span>
                    <span style="font-size:0.8rem; color:#888;">ID: ${quiz.id.substring(0,6)}...</span>
                </div>
                <h4>${escapeHtml(quiz.title)}</h4>
                <div class="quiz-desc">${quiz.description ? escapeHtml(quiz.description) : 'No description provided.'}</div>
                
                <button class="btn-toggle-q" onclick="toggleQuestions('${uniqueId}')">
                    <i class="fas fa-list-ul"></i> View ${qCount} Questions
                </button>

                <div id="${uniqueId}" class="question-dropdown">
                    ${questionsHtml}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });
}

// Hàm toggle hiển thị câu hỏi
function toggleQuestions(id) {
    const el = document.getElementById(id);
    if (el) {
        const isHidden = el.style.display === 'none' || el.style.display === '';
        el.style.display = isHidden ? 'block' : 'none';
        el.classList.toggle('active');
    }
}

// Hàm tiện ích để tránh XSS khi render text từ user
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setupLogout() {
    // Tìm nút Sign out theo class trong HTML
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn chặn load lại trang do thẻ a href="#"

            // Hộp thoại xác nhận (Optional)
            if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                
                // 1. Xóa toàn bộ dữ liệu lưu trong LocalStorage (Token, UserId, Role...)
                localStorage.clear();
                
                // Hoặc nếu muốn xóa cụ thể từng cái:
                // localStorage.removeItem('accessToken');
                // localStorage.removeItem('userId');

                console.log("Đã đăng xuất thành công.");

                // 2. Chuyển hướng về trang đăng nhập
                // Lưu ý: Đổi 'index.html' thành tên file đăng nhập thực tế của bạn (ví dụ: login.html)
                window.location.href = 'login.html'; 
            }
        });
    }
}

// --- KHỞI CHẠY KHI TRANG LOAD ---
// Sửa lại dòng cuối cùng của file thành như sau:
document.addEventListener('DOMContentLoaded', () => {
    fetchSystemUsers(); // Gọi hàm lấy dữ liệu User cũ
    setupLogout();      // Gọi hàm đăng xuất mới thêm
});

