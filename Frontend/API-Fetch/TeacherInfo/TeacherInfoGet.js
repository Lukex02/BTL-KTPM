async function loadProfileData() {
    const msgEl = document.getElementById('profile-message');
    if (!msgEl) return;  // If not in settings tab, skip

    msgEl.textContent = '';
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            msgEl.textContent = 'User ID not found. Please login again.';
            msgEl.style.color = '#e74c3c';
            return;
        }

        const user = await getUserByIdAPI(userId);
        
        document.getElementById('profile-username').value = user.username || '';
        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';

    } catch (err) {
        msgEl.textContent = err.message || 'Failed to load profile data';
        msgEl.style.color = '#e74c3c';
    }
}
async function loadUserGreeting() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.warn('User ID not found. Greeting will remain default.');
            return;
        }

        const user = await getUserByIdAPI(userId);
        const greetingH2 = document.querySelector('.greeting h2');
        if (greetingH2 && user.name) {
            greetingH2.textContent = `Good Morning, ${user.name}!`;
        } else if (greetingH2 && user.username) {
            // Fallback to username if name is not set
            greetingH2.textContent = `Good Morning, ${user.username}!`;
        }
    } catch (err) {
        console.error('Error loading user greeting:', err);
    }
}