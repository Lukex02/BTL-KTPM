// @ts-nocheck
const USER_API_BASE_URL = "http://localhost:3000"; 

/* =========================================
   1. FETCH DATA (LẤY DỮ LIỆU)
   ========================================= */
async function getAllUsersAPI() {
    try {
        const response = await fetch(`${USER_API_BASE_URL}/user/getAll`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const users = await response.json();
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error("Lỗi fetch getAllUsers:", error);
        return [];
    }
}

/* =========================================
   2. RENDER UI (HIỂN THỊ DỮ LIỆU)
   ========================================= */
function renderStudents(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return; // Nếu không tìm thấy ID thì thoát, tránh lỗi

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; width:100%; padding:20px;">No students found.</p>';
        return;
    }

    container.innerHTML = data.map(s => {
        // Xử lý dữ liệu thiếu
        const name = s.name || s.username || 'Unknown User';
        const role = s.role || 'Student';
        // Avatar mặc định nếu không có ảnh
        const imgSrc = s.img || s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

        return `
            <div class="student-card">
                <div class="student-img-wrapper">
                    <img src="${imgSrc}" alt="${name}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
                </div>
                <div class="student-content">
                    <h4 class="st-name">${name}</h4>
                    <p class="st-role">${role}</p>
                    <button class="btn-message">Send Message</button>
                </div>
            </div>
        `;
    }).join('');
}

/* =========================================
   3. CONTROLLER (ĐIỀU KHIỂN CHÍNH)
   ========================================= */
async function initTeacherPageData() {
    // Chỉ chạy logic này nếu đang ở trang có chứa grid sinh viên
    if (!document.getElementById('all-students-grid') && !document.getElementById('recent-students-grid')) return;

    try {
        // 1. Lấy dữ liệu
        const allUsers = await getAllUsersAPI();
        
        // 2. Lọc lấy Student (Tùy chỉnh logic lọc nếu cần)
        // const studentsOnly = allUsers.filter(u => u.role === 'student');
        const studentsOnly = allUsers; // Tạm thời lấy hết để test

        // 3. Render Recent Students (Lấy 4 người đầu)
        renderStudents('recent-students-grid', studentsOnly.slice(0, 4));

        // 4. Render All Students (Tab My Students)
        renderStudents('all-students-grid', studentsOnly);

        // 5. Xử lý hiển thị phân trang (Tùy chọn)
        const pageDiv = document.getElementById('student-pagination');
        if (pageDiv) {
            pageDiv.style.display = studentsOnly.length > 0 ? 'flex' : 'none';
        }

    } catch (error) {
        console.error("Lỗi khởi tạo dữ liệu:", error);
    }
}

// Tự động chạy khi file JS được load và DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', initTeacherPageData);