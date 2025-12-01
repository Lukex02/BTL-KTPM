// @ts-nocheck

/* =========================================
   TEACHER MANAGER: OPTIMIZED WITH USER/SELF
   ========================================= */

const TEACHERS_PER_PAGE = 8;
const API_URL_LOCAL = "http://localhost:3000"; 

// STATE
let allFetchedTeachers = []; 
let myLinkedTeacherIds = []; // Danh sách ID các GV mà mình đã đăng ký
let currentTeacherPage = 1;

// Biến tạm chờ xác nhận
let pendingAction = { teacherId: null, type: null, teacherName: '' };

function getInitials(name) {
    if (!name) return 'G';
    const names = name.trim().split(' ').filter(n => n.length > 0);
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    } else if (names[0].length > 1) {
        initials = names[0].substring(0, 2).toUpperCase();
    }
    return initials;
}

/**
 * 1. LOAD DATA: FETCH TEACHERS & MY PROFILE (USER/SELF)
 */
async function loadAllTeachers() {
    const gridContainer = document.getElementById('all-teacher-grid');
    if (gridContainer) gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải dữ liệu...</p></div>';

    try {
        // Gọi song song 2 API:
        // 1. Lấy danh sách toàn bộ giáo viên
        // 2. Lấy thông tin bản thân (user/self) để biết mình đang follow ai
        const [teachersRes, myProfileRes] = await Promise.all([
            authFetch(`${API_URL_LOCAL}/user/findUsersByRole/Teacher`, { method: 'GET' }),
            authFetch(`${API_URL_LOCAL}/user/self`, { method: 'GET' })
        ]);

        if (!teachersRes || !teachersRes.ok) throw new Error('Failed to fetch teachers list');
        
        // Xử lý danh sách giáo viên
        allFetchedTeachers = await teachersRes.json();

        // Xử lý danh sách giáo viên đã liên kết của tôi
        myLinkedTeacherIds = [];
        if (myProfileRes && myProfileRes.ok) {
            const myData = await myProfileRes.json();
            
            // Lấy danh sách teachersInCharge từ API user/self
            if (myData && Array.isArray(myData.teachersInCharge)) {
                // Chuyển hết về String để so sánh cho chuẩn
                myLinkedTeacherIds = myData.teachersInCharge.map(id => String(id));
            }
        }

        console.log("My Linked Teachers:", myLinkedTeacherIds);

        currentTeacherPage = 1;
        if (allFetchedTeachers.length === 0 && gridContainer) {
            gridContainer.innerHTML = '<div style="text-align:center;width:100%;">Chưa có giáo viên nào.</div>';
            return;
        }

        renderTeachersByPage(1);

    } catch (error) {
        console.error('Error loading data:', error);
        if (gridContainer) gridContainer.innerHTML = '<div style="color:red;text-align:center;">Lỗi kết nối server.</div>';
    }
}

/**
 * 2. RENDER CARD
 */
function renderTeachersByPage(page) {
    const grid = document.getElementById('all-teacher-grid');
    if (!grid) return;

    const start = (page - 1) * TEACHERS_PER_PAGE;
    const end = start + TEACHERS_PER_PAGE;
    const pageData = allFetchedTeachers.slice(start, end);

    grid.innerHTML = pageData.map(teacher => {
        const name = teacher.fullname || teacher.username || "Giáo viên";
        const email = teacher.email || "No Email";
        
        // LOGIC CHECK MỚI: Cực nhanh và chính xác
        // Kiểm tra ID của giáo viên này có nằm trong danh sách "teachersInCharge" của tôi không
        const isLinked = myLinkedTeacherIds.includes(String(teacher.id));

        // Avatar Logic
        let avatarHTML;
        if (teacher.avatar && teacher.avatar.trim() !== '') {
            avatarHTML = `<img src="${teacher.avatar}" class="teacher-avatar-img" onerror="this.parentNode.innerHTML='<div class=\'avatar-placeholder gradient-1\'>${getInitials(name)}</div>'">`;
        } else {
            const colorIdx = (name.length % 5) + 1;
            avatarHTML = `<div class="avatar-placeholder gradient-${colorIdx}">${getInitials(name)}</div>`;
        }

        // Button Logic
        let actionBtn;
        if (isLinked) {
            actionBtn = `
                <button class="btn-teacher-action linked" onclick="openConfirmBar('${teacher.id}', 'unlink', '${name}')">
                    <span><i class="fas fa-check"></i> Đã đăng ký</span>
                </button>`;
        } else {
            actionBtn = `
                <button class="btn-teacher-action not-linked" onclick="openConfirmBar('${teacher.id}', 'link', '${name}')">
                    Đăng ký <i class="fas fa-arrow-right"></i>
                </button>`;
        }

        return `
            <div class="teacher-card-premium">
                <div class="teacher-card-header">
                    ${avatarHTML}
                    <span class="teacher-badge">Giảng viên</span>
                </div>
                <div class="teacher-card-body">
                    <h4 class="teacher-name" title="${name}">${name}</h4>
                    <p class="teacher-email" title="${email}">${email}</p>
                    <div class="teacher-stats-row">
                        <div class="stat-item"><i class="fas fa-star text-yellow"></i> 5.0</div>
                        <div class="stat-item"><i class="fas fa-user-graduate text-blue"></i> Active</div>
                    </div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');

    renderTeacherPaginationInternal(allFetchedTeachers.length, page);
}

/* =========================================
   3. HANDLE ACTIONS (LINK/UNLINK)
   ========================================= */

function openConfirmBar(teacherId, type, teacherName) {
    pendingAction = { teacherId, type, teacherName };
    const bar = document.getElementById('action-confirm-bar');
    const textSpan = document.getElementById('confirm-text');
    const confirmBtn = document.getElementById('btn-confirm-yes');

    if (type === 'link') {
        textSpan.innerHTML = `Đăng ký học giáo viên <b>${teacherName}</b>?`;
        confirmBtn.style.background = "#3b82f6";
        confirmBtn.innerText = "Đăng ký ngay";
    } else {
        textSpan.innerHTML = `Hủy liên kết với <b>${teacherName}</b>?`;
        confirmBtn.style.background = "#ef4444";
        confirmBtn.innerText = "Hủy liên kết";
    }
    bar.classList.add('active');
}

function closeConfirmBar() {
    document.getElementById('action-confirm-bar').classList.remove('active');
    pendingAction = { teacherId: null, type: null, teacherName: '' };
}

async function executeTeacherAction() {
    const { teacherId, type } = pendingAction;
    const studentId = localStorage.getItem('userId');

    if (!teacherId || !type) return;

    // PRE-CHECK LOCAL: Kiểm tra danh sách đã tải về để tránh gọi API thừa
    const isAlreadyLinked = myLinkedTeacherIds.includes(String(teacherId));
    
    if (type === 'link' && isAlreadyLinked) {
        alert("Hệ thống: Bạn đã đăng ký giáo viên này rồi.");
        closeConfirmBar();
        renderTeachersByPage(currentTeacherPage); // Render lại để nút cập nhật
        return;
    }
    if (type === 'unlink' && !isAlreadyLinked) {
        alert("Hệ thống: Bạn chưa đăng ký giáo viên này.");
        closeConfirmBar();
        renderTeachersByPage(currentTeacherPage);
        return;
    }

    // UI Loading
    const confirmBtn = document.getElementById('btn-confirm-yes');
    const originalText = confirmBtn.innerText;
    confirmBtn.innerText = "Đang xử lý...";
    confirmBtn.disabled = true;

    const endpoint = type === 'link' ? '/user/link' : '/user/unlink';
    
    try {
        const response = await authFetch(`${API_URL_LOCAL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify({ studentId, teacherId })
        });

        if (response.ok) {
            updateLocalList(teacherId, type);
        } else {
            // Xử lý lỗi 400 (Self-Healing UI)
            if (response.status === 400) {
                 if(type === 'link') {
                    // Nếu server bảo đã có rồi -> Cập nhật UI thành "Đã đăng ký"
                    updateLocalList(teacherId, 'link');
                    alert("Đã đồng bộ: Bạn đã liên kết với giáo viên này.");
                 } else {
                    const errText = await response.text();
                    alert(`Lỗi: ${errText}`);
                 }
            } else {
                const errText = await response.text();
                alert(`Lỗi: ${errText}`);
            }
        }
    } catch (error) {
        console.error("API Error:", error);
        alert("Lỗi kết nối server.");
    } finally {
        confirmBtn.innerText = originalText;
        confirmBtn.disabled = false;
        closeConfirmBar();
        renderTeachersByPage(currentTeacherPage);
    }
}

/**
 * Cập nhật danh sách ID cục bộ
 */
function updateLocalList(teacherId, type) {
    const idStr = String(teacherId);
    if (type === 'link') {
        if (!myLinkedTeacherIds.includes(idStr)) {
            myLinkedTeacherIds.push(idStr);
        }
    } else {
        myLinkedTeacherIds = myLinkedTeacherIds.filter(id => id !== idStr);
    }
}

// Pagination Logic
function renderTeacherPaginationInternal(totalItems, currentPage) {
    const container = document.getElementById('teacher-pagination');
    if (!container) return; 
    const totalPages = Math.ceil(totalItems / TEACHERS_PER_PAGE);
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changeTeacherPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changeTeacherPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) html += `<span class="dots">...</span>`;
    }
    html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changeTeacherPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

window.changeTeacherPage = function(page) {
    if (page < 1 || page > Math.ceil(allFetchedTeachers.length / TEACHERS_PER_PAGE)) return;
    currentTeacherPage = page;
    renderTeachersByPage(page);
};

window.loadAllTeachers = loadAllTeachers;
window.openConfirmBar = openConfirmBar;
window.closeConfirmBar = closeConfirmBar;
window.executeTeacherAction = executeTeacherAction;