// @ts-nocheck
/* =========================================
   USER GET: Chỉ chịu trách nhiệm hiển thị 
   thông tin chung (Header, Banner, Welcome)
   ========================================= */

// Đổi tên biến để không trùng với file kia
const DASHBOARD_API_URL = "http://localhost:3000"; 

/**
 * Hàm cập nhật giao diện Dashboard/Header
 */
function updateDashboardUI(user) {
    // 1. Cập nhật Tên hiển thị
    // Tìm tất cả chỗ nào cần hiện tên (Header, Banner chào mừng)
    const nameElements = document.querySelectorAll('#display-name, .greeting h2, .profile-text h2');
    
    // 2. Cập nhật Role
    const roleElements = document.querySelectorAll('#display-role, .profile-text p');
    
    // 3. Cập nhật Avatar (Header & Profile Card)
    const avatarElements = document.querySelectorAll('.user-avatar, #header-avatar, #profile-card-avatar'); 
    
    // Xử lý dữ liệu
    const displayName = user.name || user.username || "Student";
    const displayRole = user.role || "Student";
    // Avatar: Nếu không có ảnh thật thì tạo ảnh placeholder theo tên
    const displayAvatar = user.img || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e65ff&color=fff`;

    // --- GÁN DỮ LIỆU VÀO HTML ---
    
    // Gán Tên
    nameElements.forEach(el => {
        if (el.innerText.includes("Good Morning")) {
            el.innerText = `Good Morning, ${displayName}!`;
        } else {
            el.innerText = displayName;
        }
    });

    // Gán Role
    roleElements.forEach(el => el.innerText = displayRole);
    
    // Gán Avatar
    avatarElements.forEach(img => {
        if(img.tagName === 'IMG') img.src = displayAvatar;
    });

    // LƯU Ý: Đã xóa phần điền Form Settings ở đây để tránh xung đột với UserUpdate.js
}

/**
 * Hàm gọi API lấy thông tin (Dùng authFetch cho an toàn)
 */
async function fetchDashboardProfile() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) return; // Chưa login thì thôi

    try {
        // Dùng authFetch thay vì fetch thường để tự động xử lý token hết hạn
        // Giả sử API lấy info là /user/self hoặc /user/{id}
        // Ở đây dùng endpoint giống UserUpdate cho đồng bộ
        const response = await authFetch(`${DASHBOARD_API_URL}/user/self`, {
            method: 'GET'
        });

        if (!response.ok) throw new Error("Không lấy được thông tin dashboard");

        const userData = await response.json();
        
        // Cập nhật UI
        updateDashboardUI(userData);

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        // Fallback: Lấy tạm tên từ localStorage nếu API lỗi
        const localName = localStorage.getItem('username');
        if (localName) {
            document.querySelectorAll('#display-name').forEach(el => el.innerText = localName);
        }
    }
}

// Chạy ngay khi file được load
document.addEventListener('DOMContentLoaded', fetchDashboardProfile);