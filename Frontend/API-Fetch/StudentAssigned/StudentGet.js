let myStudents = [];
async function loadMyStudents() {
    const loading = document.getElementById('students-loading');
    const empty = document.getElementById('students-empty');
    const list = document.getElementById('students-list');
    const dashboardstudentlist = document.getElementById('dashboard-students-list');
    loading.style.display = 'block';
    empty.style.display = 'none';
    list.innerHTML = '';
    dashboardstudentlist.innerHTML = '';
    try {
        const teacherId = localStorage.getItem('userId');
        if (!teacherId) {
            throw new Error('Không tìm thấy ID giáo viên. Vui lòng đăng nhập lại.');
        }

        myStudents = await getMyStudentsAPI(teacherId);

        loading.style.display = 'none';

        if (!myStudents || myStudents.length === 0) {
            empty.style.display = 'block';
            return;
        }

        // Render list với style mới giống hình (không dùng ảnh thật, dùng placeholder màu)
        list.innerHTML = myStudents.map(student => `
            <div style="
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                min-width: 200px;
                width: auto;
                text-align: center;
                overflow: hidden;
            ">
                <div style="padding: 15px;">
                    <h4>${student.name || student.username}</h4>
                    <p>@${student.username || student.id}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <i class="fas fa-envelope"></i> ${student.email || 'Chưa có email'}
                            </p>
                    <p style="margin: 5px 0 10px; color: #666; font-size: 0.9rem;">
                        Student
                    </p>
                    <button style="
                        background: #1A64F0;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        width: 100%;
                        font-size: 0.95rem;
                    "  onclick="goToMyStudentsTab()">
                        Contact
                    </button>
                </div>
            </div>
        `).join('');
        dashboardstudentlist.innerHTML = myStudents.map(student => `
            <div style="
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                min-width: 200px;
                width: auto;
                text-align: center;
                overflow: hidden;
            ">
                <div style="padding: 15px;">
                    <h4>${student.name || student.username}</h4>
                    <p>@${student.username || student.id}</p>
                    <p style="margin: 5px 0; color: #666; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <i class="fas fa-envelope"></i> ${student.email || 'Chưa có email'}
                            </p>
                    <p style="margin: 5px 0 10px; color: #666; font-size: 0.9rem;">
                        Student
                    </p>
                    <button style="
                        background: #1A64F0;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        width: 100%;
                        font-size: 0.95rem;
                    "  onclick="goToMyStudentsTab()">
                        Contact
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        loading.style.display = 'none';
        list.innerHTML = `
            <div style="text-align:center; padding:40px; color:#e74c3c;">
                <p>⚠️ ${error.message}</p>
                <button onclick="loadMyStudents()" style="margin-top:10px; padding:8px 16px; background:#1A64F0; color:white; border:none; border-radius:8px; cursor:pointer;">Thử lại</button>
            </div>
        `;
    }
}