// @ts-nocheck

/* =========================================
   1. GLOBAL NAVIGATION (CHUYỂN TAB)
   ========================================= */
function switchTab(button, tabName) {
    // 1. Loại bỏ active cũ
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // 2. Active nút hiện tại
    if (button) {
        button.classList.add('active');
    } else if (tabName === 'quizz') {
        const quizBtn = document.getElementById('btn-quiz');
        if (quizBtn) quizBtn.classList.add('active');
    }

    // 3. Ẩn/Hiện Tab Content
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(tabName + '-content');
    if(target) target.classList.add('active');
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================
   (ĐÃ XÓA PHẦN QUIZ LIST & PAGINATION GIẢ)
   Phần này giờ sẽ do API-Fetch/Quiz/QuizGet.js đảm nhiệm
   ========================================= */


/* =========================================
   2. QUIZ TAKING ENGINE (LÀM BÀI)
   (Giữ lại phần này nếu bạn muốn demo giao diện làm bài)
   ========================================= */
const totalQuestions = 18;
const dummyQuestionText = "You see a non-familiar face in the access-controlled areas of our office...";
const dummyOptions = [
    "A. None of my business...",
    "B. Ask the person to leave...",
    "C. Escort the person to security...",
    "D. Raise a security incident..."
];

// Hàm bắt đầu làm bài (Được gọi từ QuizGet.js)
function startQuizTaking() {
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
    document.getElementById('quiz-taking-content').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderQuestions();
}

function renderQuestions() {
    const questionsContainer = document.getElementById('questions-container');
    const navContainer = document.getElementById('question-nav-grid');
    if(!questionsContainer || !navContainer) return;

    questionsContainer.innerHTML = '';
    navContainer.innerHTML = '';

    for (let i = 1; i <= totalQuestions; i++) {
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';
        qBlock.id = `q-block-${i}`;
        qBlock.innerHTML = `
            <div class="question-meta"><span>5 points</span><span>Question ${i}</span></div>
            <p class="question-text">${dummyQuestionText}</p>
            <div class="options-group" id="options-group-${i}">
                ${dummyOptions.map((opt, idx) => `<button class="option-btn" onclick="selectAnswer(${i}, ${idx})">${opt}</button>`).join('')}
            </div>
        `;
        questionsContainer.appendChild(qBlock);

        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.id = `nav-item-${i}`;
        navItem.innerText = i;
        navItem.onclick = () => scrollToQuestion(i);
        navContainer.appendChild(navItem);
    }
}

function selectAnswer(qIdx, oIdx) {
    const group = document.getElementById(`options-group-${qIdx}`);
    group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    group.querySelectorAll('.option-btn')[oIdx].classList.add('selected');
    
    const navItem = document.getElementById(`nav-item-${qIdx}`);
    if (navItem) navItem.classList.add('answered');
}

function scrollToQuestion(index) {
    const el = document.getElementById(`q-block-${index}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function submitQuiz() {
    const count = document.querySelectorAll('.nav-item.answered').length;
    if(confirm(`Nộp bài? (${count}/${totalQuestions} câu đã làm)`)) {
        alert("Nộp bài thành công!");
        // Quay về danh sách (Gọi hàm từ QuizGet.js)
        if(typeof backToQuizList === 'function') backToQuizList();
    }
}

/* =========================================
   3. SETTINGS & LOGOUT LOGIC (Giữ nguyên)
   ========================================= */
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function(){ document.getElementById('preview-img').src = reader.result; };
    reader.readAsDataURL(event.target.files[0]);
}

function handleLogout() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        // Xóa token
        localStorage.clear();
        window.location.href = 'login.html'; // Redirect về login
    }
}

// Event Listeners cho nút toggle password
document.querySelectorAll('.toggle-pass').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
        const input = this.previousElementSibling;
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});