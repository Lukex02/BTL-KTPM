// @ts-nocheck

/* =========================================
   1. GLOBAL NAVIGATION (CHUYỂN TAB)
   ========================================= */
function switchTab(button, tabName) {
    // 1. Loại bỏ active ở tất cả các nút nav
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // 2. Thêm active cho nút vừa bấm hoặc nút Quiz (nếu gọi gián tiếp)
    if (button) {
        button.classList.add('active');
    } else if (tabName === 'quizz') {
        const quizBtn = document.getElementById('btn-quiz');
        if (quizBtn) quizBtn.classList.add('active');
    }

    // 3. Ẩn tất cả tab nội dung
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
    
    // 4. Hiện tab content mục tiêu
    const target = document.getElementById(tabName + '-content');
    if(target) target.classList.add('active');
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================
   2. QUIZ LIST & PAGINATION
   ========================================= */
const ITEMS_PER_PAGE = 8;
let currentQuizPage = 1;

// Tự động tạo 32 bài quiz giả lập
const allQuizData = Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    title: `Bài kiểm tra số ${i + 1} - Lập trình Python`,
    cat: i % 2 === 0 ? "Coding" : "Design",
    img: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500&q=80`,
    status: i < 5 ? 'finished' : (i < 12 ? 'progress' : 'start'),
    percent: Math.floor(Math.random() * 100)
}));

// Hàm render Quiz theo trang
function renderQuizByPage(page) {
    const grid = document.getElementById('newest-quiz-grid');
    if (!grid) return;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageData = allQuizData.slice(start, end);

    grid.innerHTML = pageData.map(q => {
        let btnHTML = `<button class="btn-watch" onclick="openQuizDetail()">Begin Quiz</button>`;
        if (q.status === 'progress') btnHTML = `<button class="btn-watch btn-secondary">Resume <span class="percent">${q.percent}%</span></button>`;
        if (q.status === 'finished') btnHTML = `<button class="btn-watch btn-secondary">Review <span class="percent success">100%</span></button>`;

        return `
        <div class="course-card">
            <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=500')"></div>
            <div class="card-body"><span class="category">${q.cat}</span><h4>${q.title}</h4><div class="divider"></div></div>
            ${btnHTML}
        </div>`;
    }).join('');

    // Vẽ phân trang cho Quiz
    renderQuizPagination(allQuizData.length, page);
}

// Hàm vẽ nút phân trang riêng cho Quiz
function renderQuizPagination(totalItems, currentPage) {
    const container = document.getElementById('quiz-pagination');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    let html = '';

    // Nút Prev
    html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changeQuizPage(${currentPage - 1})"><i class="fas fa-arrow-left"></i></button>`;

    // Nút số
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changeQuizPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button class="page-btn disabled">...</button>`;
        }
    }

    // Nút Next
    html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changeQuizPage(${currentPage + 1})"><i class="fas fa-arrow-right"></i></button>`;

    container.innerHTML = html;
}

// Hàm global chuyển trang Quiz
window.changeQuizPage = function(page) {
    const totalPages = Math.ceil(allQuizData.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentQuizPage = page;
    renderQuizByPage(page);
    document.getElementById('newest-quiz-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
    renderQuizByPage(1);
    
    // Render phần Recent (Lấy 4 bài cuối)
    const recentGrid = document.getElementById('recent-quiz-grid');
    if(recentGrid) {
        const recentData = allQuizData.slice(-4).reverse();
        recentGrid.innerHTML = recentData.map(q => `
            <div class="course-card">
                <div class="card-img" style="background-image: url('https://images.unsplash.com/photo-1507842072343-583f20270319?w=500')"></div>
                <div class="card-body"><span class="category">${q.cat}</span><h4>${q.title}</h4><div class="divider"></div></div>
                <button class="btn-watch" onclick="openQuizDetail()">Begin Quiz</button>
            </div>
        `).join('');
    }
});

/* =========================================
   3. QUIZ DETAIL VIEW & BACK
   ========================================= */
function openQuizDetail() {
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
    document.getElementById('quiz-detail-content').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToQuizList() {
    switchTab(null, 'quizz');
}

/* =========================================
   4. QUIZ TAKING ENGINE (LÀM BÀI)
   ========================================= */
const totalQuestions = 18;
const dummyQuestionText = "You see a non-familiar face in the access-controlled areas of our office, the person does not have the MGL ID/Visitor/Staff/Vendor tag with him. What would you do?";
const dummyOptions = [
    "A. None of my business, let some body else take care of it",
    "B. Ask the person to leave the facility",
    "C. Escort the person to the security and raise a security incident",
    "D. Raise a security incident and go back doing your work"
];

// Hàm bắt đầu làm bài
function startQuizTaking() {
    // Chuyển Tab
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
    document.getElementById('quiz-taking-content').classList.add('active');
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render nội dung câu hỏi và sidebar
    renderQuestions();
}

function renderQuestions() {
    const questionsContainer = document.getElementById('questions-container');
    const navContainer = document.getElementById('question-nav-grid');
    
    if(!questionsContainer || !navContainer) return;

    questionsContainer.innerHTML = '';
    navContainer.innerHTML = '';

    for (let i = 1; i <= totalQuestions; i++) {
        // --- 1. Tạo Khối Câu Hỏi (Cột Trái) ---
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';
        qBlock.id = `q-block-${i}`; // ID để cuộn tới
        
        qBlock.innerHTML = `
            <div class="question-meta">
                <span>5 points</span>
                <span>Question ${i}</span>
            </div>
            <p class="question-text">${dummyQuestionText}</p>
            <div class="options-group" id="options-group-${i}">
                ${dummyOptions.map((opt, idx) => `
                    <button class="option-btn" onclick="selectAnswer(${i}, ${idx})">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        `;
        questionsContainer.appendChild(qBlock);

        // --- 2. Tạo Ô Số Sidebar (Cột Phải) ---
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.id = `nav-item-${i}`; // ID để đổi màu
        navItem.innerText = i;
        navItem.onclick = () => scrollToQuestion(i); // Click cuộn tới câu hỏi
        navContainer.appendChild(navItem);
    }
}

// Hàm Xử Lý Khi Chọn Đáp Án
function selectAnswer(questionIndex, optionIndex) {
    // 1. Highlight nút đáp án vừa chọn (Tô xanh đậm nút option)
    const group = document.getElementById(`options-group-${questionIndex}`);
    const allBtns = group.querySelectorAll('.option-btn');
    
    // Xóa class selected cũ
    allBtns.forEach(btn => btn.classList.remove('selected'));
    // Thêm class selected vào nút mới bấm
    allBtns[optionIndex].classList.add('selected');

    // 2. Highlight ô số bên sidebar (Tô xanh đậm ô số)
    const navItem = document.getElementById(`nav-item-${questionIndex}`);
    if (navItem) {
        navItem.classList.add('answered');
    }
}

// Hàm Cuộn Mượt Tới Câu Hỏi
function scrollToQuestion(index) {
    const el = document.getElementById(`q-block-${index}`);
    if (el) {
        // Cuộn sao cho câu hỏi nằm giữa màn hình
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // (Tùy chọn) Highlight nháy nhẹ câu hỏi để người dùng dễ thấy
        el.style.border = "2px solid #1A44C6";
        setTimeout(() => el.style.border = "1px solid #E9EAF0", 1500);
    }
}

function submitQuiz() {
    const count = document.querySelectorAll('.nav-item.answered').length;
    if(confirm(`Bạn đã trả lời ${count}/${totalQuestions} câu. Bạn có chắc chắn muốn nộp bài không?`)) {
        alert("Nộp bài thành công!");
        backToQuizList();
    }
}

// ... các hàm cũ (previewImage, togglePassword...) giữ nguyên ...

// --- HÀM XỬ LÝ ĐĂNG XUẤT ---
function handleLogout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        
        // 1. Thay đổi Header: Xóa Avatar, hiện nút Login
        const userArea = document.getElementById('header-user-area');
        if (userArea) {
            // Chú ý: href="login.html" trỏ đến file đăng nhập của bạn
            userArea.innerHTML = `<a href="login.html" class="btn-login-header">Login / Sign Up</a>`;
        }

        // 2. Ẩn nội dung Dashboard chính đi (Giả lập đã thoát)
        const mainContainer = document.querySelector('.main-container');
        if(mainContainer) {
            mainContainer.innerHTML = `
                <div style="text-align:center; padding: 100px 20px;">
                    <h2 style="color: #1A64F0; margin-bottom: 20px;">Bạn đã đăng xuất thành công!</h2>
                    <p style="color: #6E7485;">Vui lòng bấm vào nút <strong>Login / Sign Up</strong> trên góc phải để đăng nhập lại.</p>
                </div>
            `;
        }

        // 3. Cuộn lên đầu trang
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- LOGIC QUẢN LÝ FORM QUIZ ---
    
    function showCreateQuizForm() {
        document.getElementById('quiz-list-view').style.display = 'none';
        document.getElementById('quiz-form-view').style.display = 'block';
        // Reset về bước 1 mỗi khi mở
        switchQuizStep('basic');
    }

    function hideCreateQuizForm() {
        document.getElementById('quiz-form-view').style.display = 'none';
        document.getElementById('quiz-list-view').style.display = 'block';
    }

    function switchQuizStep(stepName) {
        // 1. Cập nhật nút Tab
        document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('active'));
        // Tìm nút tương ứng để active (dựa vào onclick)
        const targetBtn = document.querySelector(`.step-btn[onclick*="${stepName}"]`);
        if(targetBtn) targetBtn.classList.add('active');

        // 2. Cập nhật Nội dung
        document.querySelectorAll('.step-content').forEach(content => content.classList.remove('active'));
        document.getElementById('step-' + stepName).classList.add('active');

        // 3. Cập nhật Progress Bar
        const bar = document.getElementById('quiz-progress-fill');
        if(stepName === 'basic') bar.style.width = '33%';
        else if(stepName === 'question') bar.style.width = '66%';
        else if(stepName === 'publish') bar.style.width = '100%';
    }