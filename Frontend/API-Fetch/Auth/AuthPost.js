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
   HELPER: GIẢI MÃ TOKEN (ĐỂ LẤY USER ID)
   =========================== */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
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

            if (!response.ok) {
                throw new Error(data.message || "Sai tài khoản hoặc mật khẩu");
            }

            // --- LƯU THÔNG TIN 
            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
                
                // 1. Giải mã Token để lấy User ID thật
                const decoded = parseJwt(data.access_token);
                
                // 2. Tìm ID trong payload (thường là 'sub', 'id', 'userId' hoặc 'user_id')
                // Bạn hãy kiểm tra log này để xem chính xác ID tên là gì
                console.log("Decoded Token:", decoded); 
                
                const userId = decoded.id || decoded.userId || decoded.sub || decoded.user_id;
                
                if (userId) {
                    localStorage.setItem('userId', userId);
                } else {
                    console.error("Không tìm thấy User ID trong Token!");
                }
            }

            localStorage.setItem('username', username);
            localStorage.setItem('role', selectedRole);

            showMessage('login-msg', "Đăng nhập thành công! Đang chuyển hướng...", 'success');

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

/**
 * HÀM TẠO HEADER XÁC THỰC
 * Dùng hàm này trong mọi lệnh fetch cần bảo mật
 */
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    
    // Nếu không có token -> Chưa đăng nhập -> Đá về Login
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Quan trọng nhất
    };
}

/**
 * HÀM KIỂM TRA LỖI 401 (Hết hạn phiên)
 */
function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem('accessToken');
        window.location.href = 'login.html';
        return true; // Có lỗi
    }
    return false; // Không lỗi
}