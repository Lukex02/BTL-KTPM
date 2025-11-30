// @ts-nocheck
const API_BASE_URL = "http://localhost:3000"; // Lưu ý: localhost thường là http, không phải https
const AUTH_API_URL = `${API_BASE_URL}/auth`;

/* ===========================
   HELPER: HIỂN THỊ THÔNG BÁO
   =========================== */
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    // type là 'error' (đỏ) hoặc 'success' (xanh)
    el.className = `message-box ${type}`; 
    el.style.display = 'block';
    
    // Tự ẩn sau 3s
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

/* ===========================
   1. XỬ LÝ ĐĂNG KÝ (REGISTER)
   =========================== */
const signupForm = document.getElementById('form-signup');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Ngăn reload trang

        // Lấy dữ liệu từ form
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm-pass').value;
        const btn = signupForm.querySelector('.btn-submit');

        // 1. Validate Client-side
        if (password !== confirmPass) {
            showMessage('signup-msg', "Mật khẩu xác nhận không khớp!", 'error');
            return;
        }

        // 2. Hiệu ứng Loading
        const originalText = btn.innerText;
        btn.innerText = "Creating...";
        btn.disabled = true;

        try {
            // 3. Gọi API Đăng ký
            // Role mặc định là "Student" như bạn yêu cầu
            const response = await fetch(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username, 
                    password: password,
                    role: "Student" 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đăng ký thất bại");
            }

            // 4. Thành công
            showMessage('signup-msg', "Đăng ký thành công! Vui lòng đăng nhập.", 'success');
            signupForm.reset(); // Xóa trắng form
            
            // Tự động chuyển sang màn hình Login sau 1.5s
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
   2. XỬ LÝ ĐĂNG NHẬP (LOGIN)
   =========================== */
const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Ngăn reload trang

        // Lấy dữ liệu
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        // Lấy role người dùng chọn từ Radio button
        const selectedRoleElement = document.querySelector('input[name="login_role"]:checked');
        const selectedRole = selectedRoleElement ? selectedRoleElement.value : "Student";
        
        const btn = loginForm.querySelector('.btn-submit');
        const originalText = btn.innerText;
        btn.innerText = "Logging in...";
        btn.disabled = true;

        try {
            // 1. Gọi API Login
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Sai tài khoản hoặc mật khẩu");
            }

            // 2. Lưu Token và Thông tin User
            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
            }
            localStorage.setItem('username', username);
            localStorage.setItem('role', selectedRole); // Lưu role để sau này dùng

            showMessage('login-msg', "Đăng nhập thành công!", 'success');

            // 3. Chuyển hướng dựa trên Role đã chọn
            setTimeout(() => {
                if (selectedRole === 'Instructor') {
                    window.location.href = "instructor.html";
                } else {
                    // Student hoặc Admin về trang chính
                    window.location.href = "index.html";
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