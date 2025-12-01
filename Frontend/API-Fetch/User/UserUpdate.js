// @ts-nocheck
/* =========================================
   USER UPDATE: Chỉ chịu trách nhiệm logic
   trong tab "Account Settings"
   ========================================= */

// Đổi tên biến URL để tránh trùng
const SETTINGS_API_URL = "http://localhost:3000/user"; 

function showUpdateMessage(message, type) {
    const msgBox = document.getElementById('update-msg');
    if (!msgBox) return;

    msgBox.textContent = message;
    msgBox.className = 'message-box'; 
    msgBox.classList.add(type);
    msgBox.style.display = 'block';
    setTimeout(() => { msgBox.style.display = 'none'; }, 3000);
}

// 1. HÀM LOAD DỮ LIỆU VÀO FORM (GET)
async function loadSettingsForm() {
    const userId = localStorage.getItem('userId');
    if (!userId || !localStorage.getItem('accessToken')) return;

    try {
        // Gọi API
        const response = await authFetch(`${SETTINGS_API_URL}/self`, {
            method: 'GET'
        });

        if (!response.ok) return; // Lỗi thì im lặng, không làm phiền user

        const data = await response.json();

        // Điền dữ liệu vào các ô Input có ID mới
        const idInput = document.getElementById('user-id');
        const roleInput = document.getElementById('user-role');
        const nameInput = document.getElementById('user-name');
        const usernameInput = document.getElementById('user-username');
        const emailInput = document.getElementById('user-email');

        if (idInput) idInput.value = data.id || userId;
        if (roleInput) roleInput.value = data.role || "Student";
        if (nameInput) nameInput.value = data.name || "";
        if (usernameInput) usernameInput.value = data.username || "";
        if (emailInput) emailInput.value = data.email || "";

    } catch (error) {
        console.error("Lỗi load form settings:", error);
    }
}

// 2. HÀM UPDATE DỮ LIỆU (PUT)
const updateForm = document.getElementById('form-update-user');

if (updateForm) {
    // Load dữ liệu ngay khi tìm thấy form
    loadSettingsForm();

    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = updateForm.querySelector('.btn-save');
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        const updateData = {
            id: document.getElementById('user-id').value,
            role: document.getElementById('user-role').value,
            name: document.getElementById('user-name').value,
            username: document.getElementById('user-username').value,
            email: document.getElementById('user-email').value
        };

        try {
            const response = await authFetch(`${SETTINGS_API_URL}/update`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });

            const responseData = await response.json();

            if (!response.ok) throw new Error(responseData.message || "Failed");

            // Thành công
            if (updateData.username) {
                localStorage.setItem('username', updateData.username);
                // Gọi lại hàm của UserGet.js để cập nhật Header ngay lập tức (nếu muốn)
                if (typeof fetchDashboardProfile === 'function') {
                    fetchDashboardProfile(); 
                }
            }
            showUpdateMessage("Cập nhật thành công!", 'success');

        } catch (error) {
            showUpdateMessage(error.message, 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}