// @ts-nocheck

/* =========================================
   TEACHER RENDER & PAGINATION LOGIC
   ========================================= */

const TEACHERS_PER_PAGE = 8;
let currentTeacherPage = 1;

// 1. DATA GIẢ
const baseTeachers = [
    { name: "Wade Warren", role: "Digital Product Designer", rate: "5.0", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
    { name: "Bessie Cooper", role: "Senior Developer", rate: "4.9", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
    { name: "Floyd Miles", role: "UI/UX Designer", rate: "4.8", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
    { name: "Ronald Richards", role: "Lead Developer", rate: "4.5", img: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80" }
];

const allTeachersData = Array.from({ length: 32 }, (_, i) => {
    const template = baseTeachers[i % 4];
    return {
        ...template,
        id: i + 1,
        name: `${template.name} (${i + 1})`, 
        students: Math.floor(Math.random() * 500000).toLocaleString()
    };
});

// 2. RENDER TEACHER LIST (Cập nhật cấu trúc HTML chuẩn CSS)
function renderTeachersByPage(page) {
    const grid = document.getElementById('all-teacher-grid');
    if (!grid) return;

    const start = (page - 1) * TEACHERS_PER_PAGE;
    const end = start + TEACHERS_PER_PAGE;
    const pageData = allTeachersData.slice(start, end);

    grid.innerHTML = pageData.map(t => `
        <div class="teacher-card">
            <div class="teacher-img-wrapper">
                <img src="${t.img}" alt="${t.name}">
            </div>
            
            <div class="teacher-content">
                <h4 class="teacher-name">${t.name}</h4>
                <p class="teacher-role">${t.role}</p>
                <div class="teacher-stats">
                    <span class="rating"><i class="fas fa-star"></i> ${t.rate}</span>
                    <span>${t.students} students</span>
                </div>
                <button class="btn-msg">Send Message</button>
            </div>
        </div>
    `).join('');

    // Vẽ phân trang
    renderTeacherPaginationInternal(allTeachersData.length, page);
}

// 3. VẼ NÚT PHÂN TRANG
function renderTeacherPaginationInternal(totalItems, currentPage) {
    const container = document.getElementById('teacher-pagination');
    if (!container) return; 

    const totalPages = Math.ceil(totalItems / TEACHERS_PER_PAGE);
    let html = '';

    html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changeTeacherPage(${currentPage - 1})"><i class="fas fa-arrow-left"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changeTeacherPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button class="page-btn disabled">...</button>`;
        }
    }

    html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changeTeacherPage(${currentPage + 1})"><i class="fas fa-arrow-right"></i></button>`;

    container.innerHTML = html;
}

// 4. SỰ KIỆN CLICK
window.changeTeacherPage = function(page) {
    const totalPages = Math.ceil(allTeachersData.length / TEACHERS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    
    currentTeacherPage = page;
    renderTeachersByPage(page);
    document.getElementById('all-teacher-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// 5. RENDER BEST TEACHER (Cũng cập nhật cấu trúc chuẩn)
function renderBestTeachers() {
    const grid = document.getElementById('best-teacher-grid');
    if (!grid) return;

    const bestData = allTeachersData.slice(0, 4);
    grid.innerHTML = bestData.map(t => `
        <div class="teacher-card">
            <div class="teacher-img-wrapper">
                <img src="${t.img}" alt="${t.name}">
            </div>
            <div class="teacher-content">
                <h4 class="teacher-name">${t.name}</h4>
                <p class="teacher-role">${t.role}</p>
                <div class="teacher-stats">
                    <span class="rating"><i class="fas fa-star"></i> ${t.rate}</span>
                    <span>${t.students} students</span>
                </div>
                <button class="btn-msg">Send Message</button>
            </div>
        </div>
    `).join('');
}

// 6. KHỞI TẠO
document.addEventListener('DOMContentLoaded', () => {
    renderBestTeachers();
    renderTeachersByPage(1);
});