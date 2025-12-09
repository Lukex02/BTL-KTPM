function showAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    modal.classList.add('show');
    loadAvailableStudents();
    document.getElementById('student-search').value = ''; // Reset search
}

function hideAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    modal.classList.remove('show');
}
// Load available students (all trừ myStudents)
async function loadAvailableStudents() {
    const loading = document.getElementById('add-students-loading');
    const empty = document.getElementById('add-students-empty');
    const list = document.getElementById('available-students-list');

    loading.style.display = 'block';
    empty.style.display = 'none';
    list.innerHTML = '';

    try {
        const allStudents = await getAllStudentsAPI();

        // Filter loại trừ myStudents (so sánh bằng id)
        const myStudentIds = new Set(myStudents.map(s => s.id));
        const available = allStudents.filter(s => !myStudentIds.has(s.id));

        loading.style.display = 'none';

        if (available.length === 0) {
            empty.style.display = 'block';
            return;
        }

        // Render list với nút Assign
        list.innerHTML = available.map(student => `
            <div class="student-card" style="margin-bottom:20px">
                <div class="info">
                    <h4>${student.name || student.username}</h4>
                    <p>@${student.username || student.id}</p>
                   <p style="margin: 5px 0; color: #666; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                <i class="fas fa-envelope"></i> ${student.email || 'Chưa có email'}
                            </p>
                </div>
                <div class="avatar">${student.name ? student.name.charAt(0).toUpperCase() : 'S'}</div>
                <div class="actions">
                    <button class="btn-small btn-success" onclick="assignStudent('${student.id}')">Assign</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        loading.style.display = 'none';
        list.innerHTML = `
            <div style="text-align:center; padding:40px; color:#e74c3c;">
                <p>⚠️ ${error.message}</p>
                <button onclick="loadAvailableStudents()" style="margin-top:10px; padding:8px 16px; background:#1A64F0; color:white; border:none; border-radius:8px; cursor:pointer;">Thử lại</button>
            </div>
        `;
    }
}
function populateAssignStudentDropdown() {
            const select = document.getElementById('assign-student');
            select.innerHTML = '<option value="">-- Select a student --</option>'; // Reset

            if (myStudents && myStudents.length > 0) {
                myStudents.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name || 'Chưa đặt tên'} (@${student.username || student.id})`;
                    select.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No students available";
                option.disabled = true;
                select.appendChild(option);
            }
        }
        async function populateAssignSelect(assignedIds = []) {
            try {
                const teacherId = localStorage.getItem('userId');
                const students = await getMyStudentsAPI(teacherId);  // Lấy tất cả myStudents

                // Filter chỉ giữ students chưa assign (không có ID trong assignedIds)
                const availableStudents = students.filter(student => !assignedIds.includes(student.id));

                const select = document.getElementById('assign-student');
                select.innerHTML = '<option value="">-- Select a student --</option>';  // Reset

                availableStudents.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name || student.username} (@${student.username || student.id})`;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error populating assign select:', error);
                // Optional: Hiển thị lỗi trong UI nếu cần
            }
        }


// Hàm filter students theo search
function filterStudents() {
    const search = document.getElementById('student-search').value.toLowerCase();
    const cards = document.querySelectorAll('#available-students-list .student-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const username = card.querySelector('p:nth-child(2)').textContent.toLowerCase();
        const email = card.querySelector('p:nth-child(3)').textContent.toLowerCase();
        
        if (name.includes(search) || username.includes(search) || email.includes(search)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}
// Hàm assign student
async function assignStudent(studentId) {
    try {
        const teacherId = localStorage.getItem('userId');
        await assignStudentAPI(teacherId, studentId);
        
        // Refresh lists
        loadMyStudents();
        loadAvailableStudents();
        
        // Optional: show success message
        alert('Đã giao học sinh thành công!');
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}