// @ts-nocheck
const contactsData = [
    { id: 1, name: "Jane Cooper", msg: "Yeah sure, tell me zafor", time: "just now", online: true, active: true, img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" },
    { id: 2, name: "Jenny Wilson", msg: "Thank you so much, sir", time: "2 d", online: false, active: false, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" },
    { id: 3, name: "Marvin McKinney", msg: "You're Welcome", time: "1 m", online: false, active: false, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64" },
    { id: 4, name: "Eleanor Pena", msg: "Thank you so much, sir", time: "1 m", online: true, active: false, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64" },
    { id: 5, name: "Ronald Richards", msg: "Sorry, I can't help you", time: "2 m", online: false, active: false, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64" },
    { id: 6, name: "Kathryn Murphy", msg: "new message", time: "2 m", online: true, active: false, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" },
];

// Hàm Render danh sách liên hệ
function renderContactList() {
    const container = document.getElementById('contact-list');
    if (!container) return;

    container.innerHTML = contactsData.map(contact => `
        <div class="contact-item ${contact.active ? 'active' : ''}" onclick="selectContact(${contact.id})">
            <div class="contact-avatar">
                <img src="${contact.img}" alt="${contact.name}">
                <span class="status-dot ${contact.online ? 'online' : ''}"></span>
            </div>
            <div class="contact-info">
                <div class="contact-top">
                    <span class="contact-name">${contact.name}</span>
                    <span class="contact-time">${contact.time}</span>
                </div>
                <p class="contact-preview">${contact.msg}</p>
            </div>
        </div>
    `).join('');
}

// Hàm chọn liên hệ (Demo đổi class active)
function selectContact(id) {
    const items = document.querySelectorAll('.contact-item');
    items.forEach(item => item.classList.remove('active'));
    // Trong thực tế, bạn sẽ load lại nội dung chat ở đây
    // Ở bản demo này, ta chỉ đổi màu background của item được click
    event.currentTarget.classList.add('active');
}

// Hàm gửi tin nhắn
function sendMessage() {
    const input = document.getElementById('msg-input');
    const chatBody = document.getElementById('chat-body');
    const text = input.value.trim();

    if (text) {
        // Tạo HTML cho tin nhắn mới
        const newMsg = `
            <div class="message sent">
                <div class="msg-content">
                    <div class="bubble">${text}</div>
                </div>
            </div>
        `;
        
        // Thêm vào chat body
        chatBody.insertAdjacentHTML('beforeend', newMsg);
        
        // Xóa input
        input.value = '';
        
        // Cuộn xuống cuối
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderContactList();
});