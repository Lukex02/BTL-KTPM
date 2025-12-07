document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('profile-username').value;
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const msgEl = document.getElementById('profile-message');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        msgEl.textContent = 'User ID not found. Please login again.';
        msgEl.style.color = '#e74c3c';
        return;
    }

    const payload = {
        id: userId,
        username,
        role: 'Teacher',  // Giả sử role không thay đổi, hoặc lấy từ current user nếu cần
        name,
        email
    };

    try {
        msgEl.textContent = 'Updating...';
        msgEl.style.color = '#1A64F0';

        await updateUserAPI(payload);

        msgEl.textContent = 'Profile updated successfully!';
        msgEl.style.color = '#27ae60';

        // Optional: Update greeting
        document.querySelector('.greeting h2').textContent = `Good Morning, ${name}!`;

        setTimeout(() => {
            msgEl.textContent = '';
            const dashboardBtn = document.querySelector('.tab-btn[onclick*="\'inst-dashboard\'"]');
            if (dashboardBtn) {
                switchTab(dashboardBtn, 'inst-dashboard');
            }
        }, 1000);

    } catch (err) {
        msgEl.textContent = err.message || 'Something went wrong';
        msgEl.style.color = '#e74c3c';
    }
});
// Dropdown Avatar
const avatarWrapper = document.getElementById('avatar-wrapper');
const userDropdown = document.getElementById('user-dropdown');

avatarWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
});

// Đóng dropdown khi click ngoài
document.addEventListener('click', () => {
    userDropdown.classList.remove('show');
});

// Modal functions
function showChangePasswordModal() {
    document.getElementById('change-password-modal').classList.add('show');
    userDropdown.classList.remove('show'); // đóng dropdown
    document.getElementById('change-password-form').reset();
    document.getElementById('password-message').textContent = '';
}

function hideChangePasswordModal() {
    document.getElementById('change-password-modal').classList.remove('show');
}
// Submit form
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const msgEl = document.getElementById('password-message');

    if (newPassword !== confirmPassword) {
        msgEl.textContent = 'New passwords do not match!';
        msgEl.style.color = '#e74c3c';
        return;
    }

    try {
        msgEl.textContent = 'Updating...';
        msgEl.style.color = '#1A64F0';

        await changePasswordAPI(oldPassword, newPassword, confirmPassword);

        msgEl.textContent = 'Password changed successfully!';
        msgEl.style.color = '#27ae60';

        setTimeout(() => {
            hideChangePasswordModal();
        }, 1500);

    } catch (err) {
        msgEl.textContent = err.message || 'Something went wrong';
        msgEl.style.color = '#e74c3c';
    }
});