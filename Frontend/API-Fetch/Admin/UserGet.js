// @ts-nocheck
/* =========================================
   USER GET: QUẢN LÝ TOÀN BỘ HỆ THỐNG (User, Dashboard, Quiz)
   ========================================= */

const ADMIN_API_URL = "http://localhost:3000";

async function fetchSystemUsers() {
    const userId = localStorage.getItem('userId');
    if (!userId) return; 

    try {
        // 1. Lấy tất cả User
        const response = await authFetch(`${ADMIN_API_URL}/user/getAll`, { method: 'GET' });
        if (!response.ok) throw new Error("Load user failed");
        const allUsers = await response.json();

        // 2. Phân loại Student & Teacher
        const students = allUsers.filter(u => u.role && u.role.toLowerCase() === 'student');
        const teachers = allUsers.filter(u => u.role && u.role.toLowerCase() === 'teacher');
        
        // 3. Cập nhật UI User
        updateStudentTable(students);
        updateTeacherGrid(teachers);

        // 4. LẤY TOÀN BỘ QUIZ CỦA HỆ THỐNG (KÈM TÊN TÁC GIẢ)
        // Bước này quan trọng: Lấy Quiz của từng GV và gộp lại
        const allSystemQuizzes = await fetchAllQuizzesFromTeachers(teachers);

        // 5. Cập nhật Dashboard (Dùng dữ liệu vừa lấy)
        updateDashboardStats(students.length, teachers.length, allSystemQuizzes.length);

        // 6. Cập nhật Tab Quiz Management
        renderQuizManagementTab(allSystemQuizzes);

    } catch (error) {
        console.error("System Error:", error);
    }
}

/* ===========================
   LOGIC TỔNG HỢP QUIZ
   =========================== */
async function fetchAllQuizzesFromTeachers(teachers) {
    // Tạo danh sách các Promise gọi API song song
    const promises = teachers.map(teacher => 
        authFetch(`${ADMIN_API_URL}/assessment/quiz/findByUserId/${teacher.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(quizzes => {
                // QUAN TRỌNG: Gắn tên giáo viên vào từng quiz để hiển thị
                const authorName = teacher.name || teacher.username || 'Unknown Teacher';
                return quizzes.map(q => ({ ...q, authorName: authorName, authorId: teacher.id }));
            })
            .catch(() => []) // Nếu lỗi 1 người thì bỏ qua, không chết cả app
    );

    // Chờ tất cả trả về và làm phẳng mảng (Flat)
    const results = await Promise.all(promises);
    return results.flat(); 
}

/* ===========================
   RENDER GIAO DIỆN
   =========================== */

// 1. Render Tab Quiz Management
function renderQuizManagementTab(quizzes) {
    const container = document.getElementById('system-quiz-list');
    if (!container) return;
    
    container.innerHTML = '';

    if (quizzes.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">No quizzes found in system.</p>';
        return;
    }

    quizzes.forEach(quiz => {
        const qCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
        
        // HTML hiển thị từng dòng Quiz (Giống mẫu của bạn)
        const item = `
            <div class="quiz-list-item">
                <div class="q-info">
                    <h4>${escapeHtml(quiz.title)}</h4>
                    <p>
                        Created by: <strong>${escapeHtml(quiz.authorName)}</strong> | 
                        Questions: ${qCount} | 
                        Type: ${quiz.type || 'Standard'}
                    </p>
                </div>
                <div class="q-actions">
                    <button class="btn-icon" onclick="viewDetail('${quiz.authorId}', 'teacher', '${encodeURIComponent(quiz.authorName)}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit" onclick="alert('Edit feature coming soon')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-icon delete" onclick="alert('Delete feature coming soon')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', item);
    });
}

// 2. Render Dashboard Stats
function updateDashboardStats(stCount, teCount, quizCount) {
    const sSt = document.getElementById('stat-student');
    const sTe = document.getElementById('stat-teacher');
    const sQu = document.getElementById('stat-quiz');
    
    if (sSt) sSt.innerText = stCount.toLocaleString();
    if (sTe) sTe.innerText = teCount.toLocaleString();
    if (sQu) sQu.innerText = quizCount.toLocaleString();
}

// 3. Render Student Table (Giữ nguyên)
function updateStudentTable(users) {
    const tbody = document.querySelector('#students .data-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const displayName = user.name || user.username;
        const row = `
            <tr>
                <td>#${user.id.substring(0,6)}</td>
                <td><div class="user-cell"><img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random" class="avatar-sm">${displayName}</div></td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="badge active">Active</span></td>
                <td><button class="btn-sm" onclick="viewDetail('${user.id}', 'student', '${encodeURIComponent(displayName)}')">View Detail</button></td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// 4. Render Teacher Grid (Giữ nguyên)
function updateTeacherGrid(users) {
    const grid = document.querySelector('#teachers .teacher-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    users.forEach(user => {
        const name = user.name || user.username;
        const qCount = user.assignedQuizIds ? user.assignedQuizIds.length : 0;
        grid.insertAdjacentHTML('beforeend', `
            <div class="teacher-card">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c7d2fe&color=3730a3">
                <h4>${name}</h4>
                <p>Teacher</p>
                <div class="t-stats"><div><strong>${user.assignedContentIds?.length||0}</strong> Content</div><div><strong>${qCount}</strong> Quizzes</div></div>
                <button class="btn-block" onclick="viewDetail('${user.id}', 'teacher', '${encodeURIComponent(name)}')">View Profile</button>
            </div>
        `);
    });
}

/* ===========================
   MODAL & UTILS
   =========================== */
async function viewDetail(uid, type, uNameEncoded) {
    const uName = decodeURIComponent(uNameEncoded);
    const modal = document.getElementById('detailModal');
    const list = document.getElementById('user-quiz-list');
    const head = document.getElementById('modal-user-info');
    
    if(!modal) return;
    
    head.innerHTML = `<img src="https://ui-avatars.com/api/?name=${uNameEncoded}&background=random" class="avatar-md"><div><h2 style="margin:0">${uName}</h2><p style="margin:0;color:#666">ID: ${uid}</p></div>`;
    list.innerHTML = '<p style="text-align:center">Loading...</p>';
    modal.style.display = 'flex';

    try {
        const res = await authFetch(`${ADMIN_API_URL}/assessment/quiz/findByUserId/${uid}`);
        const data = res.ok ? await res.json() : [];
        
        list.innerHTML = data.length ? '' : '<p style="text-align:center">No quizzes.</p>';
        
        data.forEach((q, i) => {
            const qHtml = q.questions?.map((xq, xi) => `<div class="q-item"><strong>Q${xi+1}: ${escapeHtml(xq.question)}</strong><span class="q-correct">Ans: ${escapeHtml(xq.correctAnswer)}</span></div>`).join('') || '';
            
            list.insertAdjacentHTML('beforeend', `
                <div class="quiz-detail-card">
                    <div class="quiz-meta"><span class="badge" style="background:#e0e7ff;color:#4338ca">${q.type||'Quiz'}</span><span>ID: ${q.id.substring(0,6)}</span></div>
                    <h4>${escapeHtml(q.title)}</h4>
                    <div class="quiz-desc">${escapeHtml(q.description||'')}</div>
                    <button class="btn-toggle-q" onclick="toggleQ('q-${i}')">View Questions</button>
                    <div id="q-${i}" class="question-dropdown">${qHtml}</div>
                </div>
            `);
        });
    } catch(e) { list.innerHTML = 'Error loading data'; }
}

function toggleQ(id) {
    const el = document.getElementById(id);
    if(el) { el.style.display = el.style.display==='none'?'block':'none'; el.classList.toggle('active'); }
}

function escapeHtml(text) { return text ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : ""; }

function setupLogout() {
    const btn = document.querySelector('.logout-btn');
    if(btn) btn.addEventListener('click', e => { 
        e.preventDefault(); 
        if(confirm("Sign out?")) { localStorage.clear(); window.location.href = 'login.html'; } 
    });
}

document.addEventListener('DOMContentLoaded', () => { fetchSystemUsers(); setupLogout(); });