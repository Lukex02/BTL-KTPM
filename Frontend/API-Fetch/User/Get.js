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
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; width:100%; padding:20px;">No students found.</p>';
        return;
    }

    container.innerHTML = data.map(s => {
        const name = s.name || s.username || 'Unknown User';
        const role = s.role || 'Student';
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
   
    if (!document.getElementById('all-students-grid') && !document.getElementById('recent-students-grid')) return;

    try {
        const allUsers = await getAllUsersAPI();
        
        const studentsOnly = allUsers;

        renderStudents('recent-students-grid', studentsOnly.slice(0, 4));
        renderStudents('all-students-grid', studentsOnly);

        const pageDiv = document.getElementById('student-pagination');
        if (pageDiv) {
            pageDiv.style.display = studentsOnly.length > 0 ? 'flex' : 'none';
        }

    } catch (error) {
        console.error("Lỗi khởi tạo dữ liệu:", error);
    }
}

document.addEventListener('DOMContentLoaded', initTeacherPageData);