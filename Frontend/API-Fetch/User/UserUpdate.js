// @ts-nocheck
/* =========================================
   USER UPDATE: Chỉ chịu trách nhiệm logic
   trong tab "Account Settings"
   ========================================= */

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


async function loadSettingsForm() {
    const userId = localStorage.getItem('userId');
    if (!userId || !localStorage.getItem('accessToken')) return;

    try {
        const response = await authFetch(`${SETTINGS_API_URL}/self`, {
            method: 'GET'
        });

        if (!response.ok) return; // Lỗi thì im lặng, không làm phiền user

        const data = await response.json();

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


// 1. HÀM LOAD DỮ LIỆU VÀO FORM (GET)
async function loadSettingsForm() {
    const userId = localStorage.getItem('userId');
    if (!userId || !localStorage.getItem('accessToken')) return;

    try {
        const response = await authFetch(`${SETTINGS_API_URL}/self`, {
            method: 'GET'
        });

        if (!response.ok) return; 

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


//-------------------------------- UPDATE PASSWORD ---------------------------------//

document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('form-change-password');

    if (!passwordForm) return;

    // 1. XỬ LÝ ẨN/HIỆN MẬT KHẨU (Eye Icon)
    passwordForm.querySelectorAll('.toggle-pass').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = "password";
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // 2. XỬ LÝ SUBMIT FORM
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPass = document.getElementById('current-pass').value;
        const newPass = document.getElementById('new-pass').value;
        const confirmPass = document.getElementById('confirm-pass').value;
        const btn = passwordForm.querySelector('.btn-save');
        const msgBox = document.getElementById('password-msg');

        if (newPass !== confirmPass) {
            showUpdateMessage("Mật khẩu xác nhận không khớp!", "error");
            return;
        }
        if (newPass.length < 6) {
            showUpdateMessage("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showUpdateMessage("Lỗi phiên đăng nhập. Hãy đăng nhập lại.", "error");
            return;
        }

        const originalText = btn.innerText;
        btn.innerText = "Updating...";
        btn.disabled = true;

        try {
            const response = await authFetch(`${SETTINGS_API_URL}/changePassword`, {
                method: 'PUT',
                body: JSON.stringify({
                    userId: userId,
                    oldPassword: currentPass,
                    newPassword: newPass,
                    confirmNewPassword: confirmPass
                })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đổi mật khẩu thất bại");
            }

            showUpdateMessage("Đổi mật khẩu thành công!", "success");

        } catch (error) {
            console.error(error);
            showUpdateMessage(error.message || "Lỗi kết nối server", "error");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});