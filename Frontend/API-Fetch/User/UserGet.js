// @ts-nocheck
/* =========================================
   USER GET: Chỉ chịu trách nhiệm hiển thị 
   thông tin chung (Header, Banner, Welcome)
   ========================================= */


const DASHBOARD_API_URL = "http://localhost:3000"; 

function updateDashboardUI(user) {
    const nameElements = document.querySelectorAll('#display-name, .greeting h2, .profile-text h2');
    const roleElements = document.querySelectorAll('#display-role, .profile-text p');
    const avatarElements = document.querySelectorAll('.user-avatar, #header-avatar, #profile-card-avatar'); 

    const displayName = user.name || user.username || "Student";
    const displayRole = user.role || "Student";
 
    const displayAvatar = user.img || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e65ff&color=fff`;
    
    nameElements.forEach(el => {
        if (el.innerText.includes("Good Morning")) {
            el.innerText = `Good Morning, ${displayName}!`;
        } else {
            el.innerText = displayName;
        }
    });

    roleElements.forEach(el => el.innerText = displayRole);

    avatarElements.forEach(img => {
        if(img.tagName === 'IMG') img.src = displayAvatar;
    });
}

/**
 * Hàm gọi API lấy thông tin
 */
async function fetchDashboardProfile() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) return;

    try {
        const response = await authFetch(`${DASHBOARD_API_URL}/user/self`, {
            method: 'GET'
        });

        if (!response.ok) throw new Error("Không lấy được thông tin dashboard");

        const userData = await response.json();
        
        updateDashboardUI(userData);

    } catch (error) {
        console.error("Dashboard Load Error:", error);
        const localName = localStorage.getItem('username');
        if (localName) {
            document.querySelectorAll('#display-name').forEach(el => el.innerText = localName);
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchDashboardProfile);