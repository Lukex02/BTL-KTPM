// @ts-nocheck

// Hàm hiển thị thông báo
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `message-box ${type}`;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

/* ===========================
   1. XỬ LÝ ĐĂNG KÝ
   =========================== */
const signupForm = document.getElementById('form-signup');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm-pass').value;
        const btn = signupForm.querySelector('.btn-submit');

        if (password !== confirmPass) {
            showMessage('signup-msg', "Mật khẩu xác nhận không khớp!", 'error');
            return;
        }

        const originalText = btn.innerText;
        btn.innerText = "Creating...";
        btn.disabled = true;

        try {
            // Gọi API (Dùng fetch thường vì chưa cần token)
            const response = await fetch(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role: "Student" })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Đăng ký thất bại");

            showMessage('signup-msg', "Đăng ký thành công! Vui lòng đăng nhập.", 'success');
            signupForm.reset();
            setTimeout(() => {
                document.querySelector('.container').classList.remove('sign-up-mode');
            }, 1500);

        } catch (error) {
            showMessage('signup-msg', error.message, 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

/* ===========================
   2. XỬ LÝ ĐĂNG NHẬP
   =========================== */
const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const selectedRoleElement = document.querySelector('input[name="user_role"]:checked');
        const selectedRole = selectedRoleElement ? selectedRoleElement.value : "Student";
        
        const btn = loginForm.querySelector('.btn-submit');
        const originalText = btn.innerText;
        btn.innerText = "Logging in...";
        btn.disabled = true;

        try {
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Sai tài khoản hoặc mật khẩu");

            // --- LƯU TOKEN & THÔNG TIN ---
            if (data.access_token) localStorage.setItem('accessToken', data.access_token);
            if (data.refresh_token) localStorage.setItem('refreshToken', data.refresh_token);

            // Giải mã lấy ID
            const decoded = parseJwt(data.access_token);
            const userId = decoded.id || decoded.userId || decoded.sub;
            if (userId) localStorage.setItem('userId', userId);

            localStorage.setItem('username', username);
            localStorage.setItem('role', selectedRole);

            showMessage('login-msg', "Đăng nhập thành công!", 'success');

            setTimeout(() => {
                if (selectedRole.toLowerCase() === 'instructor') {
                    window.location.href = "teacher.html";
                } else {
                    window.location.href = "Index.html";
                }
            }, 1000);

        } catch (error) {
            showMessage('login-msg', error.message, 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}