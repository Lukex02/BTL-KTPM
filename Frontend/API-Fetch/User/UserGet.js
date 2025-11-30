// @ts-nocheck
const USER_API_URL = "http://localhost:3000"; // Cập nhật port server của bạn (3000 hoặc 8080)

/**
 * Hàm cập nhật giao diện với dữ liệu User lấy được
 */
function updateUserUI(user) {
    // 1. Cập nhật Tên và Role ở Profile Card
    const nameElements = document.querySelectorAll('.profile-text h2, .greeting h2');
    const roleElements = document.querySelectorAll('.profile-text p');
    
    // 2. Cập nhật Avatar (Tất cả ảnh avatar trên trang)
    const avatarElements = document.querySelectorAll('.user-avatar, .profile-info img');
    
    // Xử lý dữ liệu hiển thị
    const displayName = user.name || user.username || "User";
    const displayRole = user.role || "Student";
    // Nếu không có ảnh, tạo ảnh giả theo tên
    const displayAvatar = user.img || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

    // Gán dữ liệu vào DOM
    nameElements.forEach(el => {
        // Giữ lại phần chào "Good Morning" nếu có
        if (el.innerText.includes("Good Morning")) {
            el.innerText = `Good Morning, ${displayName}!`;
        } else {
            el.innerText = displayName;
        }
    });

    roleElements.forEach(el => el.innerText = displayRole);
    avatarElements.forEach(img => img.src = displayAvatar);

    // 3. Điền sẵn thông tin vào Form Settings (nếu đang ở tab Settings)
    const inputName = document.querySelector('input[placeholder="First name"]');
    const inputEmail = document.querySelector('input[type="email"]');
    if (inputName) inputName.value = displayName;
    if (inputEmail) inputEmail.value = user.email || "";
}

/**
 * Hàm Fetch API lấy thông tin User
 */
async function fetchUserProfile() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken');

    // Chưa đăng nhập thì thôi
    if (!userId || !token) {
        console.log("Chưa đăng nhập hoặc thiếu thông tin User ID.");
        return;
    }

    try {
        const response = await fetch(`${USER_API_URL}/user/self`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Không thể lấy thông tin người dùng");
        }

        const userData = await response.json();
        
        // Gọi hàm cập nhật UI
        updateUserUI(userData);

    } catch (error) {
        console.error("Lỗi fetch User Profile:", error);
        // Fallback: Nếu API lỗi thì lấy tạm tên từ localStorage (lưu lúc login)
        const localName = localStorage.getItem('username');
        if (localName) {
            document.querySelectorAll('.profile-text h2').forEach(el => el.innerText = localName);
        }
    }
}

// Tự động chạy khi file được load
document.addEventListener('DOMContentLoaded', fetchUserProfile);