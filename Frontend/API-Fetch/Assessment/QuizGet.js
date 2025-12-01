// @ts-nocheck
/* =========================================
   QUIZ MANAGER: FETCH WITH AUTHOR MAPPING
   Logic: Find Quiz -> Get My Teachers -> Fetch Teacher Details -> Match Quiz ID
   ========================================= */

const QUIZ_API_URL = "http://localhost:3000"; 
const QUIZ_PER_PAGE = 8;

// STATE
let allFetchedQuizzes = [];
let currentQuizPage = 1;
let selectedQuiz = null; 

/**
 * 1. LOAD DATA & MAP TEACHER NAME
 */
async function loadUserQuizzes() {
    const gridContainer = document.getElementById('recent-quiz-grid');
    const paginationContainer = document.getElementById('quiz-pagination');
    
    // Ẩn mục "Newest Quizz" nếu có
    const newestSection = document.getElementById('newest-quiz-grid')?.closest('.section-wrapper');
    if(newestSection) newestSection.style.display = 'none';

    if (!gridContainer) return;

    gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải bài kiểm tra và thông tin giáo viên...</p></div>';

    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            gridContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Vui lòng đăng nhập.</p>';
            return;
        }

        // --- GIAI ĐOẠN 1: Lấy Quiz & Lấy ID Giáo viên của mình ---
        const [quizRes, selfRes] = await Promise.all([
            authFetch(`${QUIZ_API_URL}/assessment/quiz/findByUserId/${userId}`, { method: 'GET' }),
            authFetch(`${QUIZ_API_URL}/user/self`, { method: 'GET' })
        ]);

        if (!quizRes || !quizRes.ok) throw new Error('Failed to fetch quizzes');

        // 1.1 Danh sách Quiz thô
        let rawQuizzes = [];
        const quizData = await quizRes.json();
        if (Array.isArray(quizData)) rawQuizzes = quizData;
        else if (quizData && typeof quizData === 'object') rawQuizzes = [quizData];

        // 1.2 Danh sách ID Giáo viên đã liên kết
        let myTeacherIds = [];
        if (selfRes && selfRes.ok) {
            const selfData = await selfRes.json();
            if (selfData && Array.isArray(selfData.teachersInCharge)) {
                myTeacherIds = selfData.teachersInCharge;
            }
        }

        console.log("My Teacher IDs:", myTeacherIds);

        // --- GIAI ĐOẠN 2: Lấy chi tiết từng Giáo viên (findById) ---
        // Chúng ta cần fetch chi tiết để xem assignedQuizIds của họ
        let teachersDetails = [];
        if (myTeacherIds.length > 0) {
            // Tạo mảng các Promise để gọi API song song cho nhanh
            const detailPromises = myTeacherIds.map(tId => 
                authFetch(`${QUIZ_API_URL}/user/findById/${tId}`, { method: 'GET' })
                    .then(res => res.ok ? res.json() : null) // Nếu lỗi thì trả về null để không crash
                    .catch(err => null)
            );
            
            // Chờ tất cả API trả về
            const results = await Promise.all(detailPromises);
            teachersDetails = results.filter(t => t !== null); // Lọc bỏ các kết quả lỗi
        }

        console.log("Teachers Details fetched:", teachersDetails);

        // --- GIAI ĐOẠN 3: Ánh xạ (Mapping) ---
        // Duyệt từng Quiz, tìm xem nó thuộc về assignedQuizIds của giáo viên nào
        allFetchedQuizzes = rawQuizzes.map(quiz => {
            let authorName = "Giáo viên Hệ thống"; // Mặc định
            
            // Tìm trong danh sách giáo viên đã fetch chi tiết
            const creator = teachersDetails.find(teacher => {
                // Kiểm tra mảng assignedQuizIds của giáo viên
                if (teacher.assignedQuizIds && Array.isArray(teacher.assignedQuizIds)) {
                    // So sánh ID (chuyển về string để an toàn)
                    return teacher.assignedQuizIds.some(qId => String(qId) === String(quiz.id));
                }
                return false;
            });

            if (creator) {
                // Ưu tiên các trường tên có thể có
                authorName = creator.fullname || creator.name || creator.username;
            }

            return {
                ...quiz,
                teacherName: authorName // Lưu kết quả tìm được
            };
        });

        // --- GIAI ĐOẠN 4: Render ---
        currentQuizPage = 1;
        if (allFetchedQuizzes.length === 0) {
            gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;">Bạn chưa có bài kiểm tra nào.</div>';
            if(paginationContainer) paginationContainer.innerHTML = ''; // Ẩn phân trang
            return;
        }

        renderQuizGrid(1);

    } catch (error) {
        console.error('Quiz Load Error:', error);
        gridContainer.innerHTML = '<div style="color:red;text-align:center; grid-column:1/-1;">Lỗi kết nối server.</div>';
    }
}

/**
 * 2. RENDER GRID
 */
function renderQuizGrid(page) {
    const grid = document.getElementById('recent-quiz-grid');
    if (!grid) return;

    const start = (page - 1) * QUIZ_PER_PAGE;
    const end = start + QUIZ_PER_PAGE;
    const pageData = allFetchedQuizzes.slice(start, end);

    grid.innerHTML = pageData.map((quiz, index) => {
        // Ảnh random
        const randomImgUrl = `https://picsum.photos/500/300?random=${quiz.id || index + 50}`;
        const title = quiz.title || "Bài kiểm tra chưa đặt tên";
        
        let desc = quiz.description || "Chưa có mô tả.";
        if (desc.length > 50) desc = desc.substring(0, 50) + "...";
        
        // Category giả lập
        const categories = ["Lập trình", "Thiết kế", "Marketing", "Kinh doanh", "Khoa học"];
        const category = categories[(quiz.id || index) % categories.length];

        // Tên Giáo viên đã tìm được ở trên
        const displayTeacherName = quiz.teacherName;

        return `
            <div class="course-card" style="display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                
                <div class="card-img" style="background-image: url('${randomImgUrl}'); height: 180px; background-size: cover; background-position: center;"></div>
                
                <div class="card-body" style="flex: 1; padding: 15px; padding-bottom: 5px;">
                    <span class="category" style="margin-bottom: 8px; display:inline-block; font-size: 0.75rem; color: #3b82f6; background: #e0f2fe; padding: 4px 10px; border-radius: 20px; font-weight: 600;">
                        ${category}
                    </span>
                    
                    <h4 title="${title}" style="margin-bottom: 5px; font-size: 1.1rem; line-height: 1.4; font-weight: 700; color: #1f2937; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${title}
                    </h4>

                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; color: #4b5563; font-size: 0.85rem; font-weight: 500;">
                        <i class="fas fa-chalkboard-teacher" style="color: #f59e0b;"></i> 
                        <span>${displayTeacherName}</span>
                    </div>

                    <p style="font-size: 0.85rem; color: #9ca3af; line-height: 1.4;">${desc}</p>
                </div>

                <div style="padding: 15px; background: #fff;">
                    <button 
                        class="btn-watch" 
                        style="background-color: #2563eb; color: white; width: 100%; border-radius: 8px; font-weight: 600; border: none; padding: 10px 20px; cursor: pointer; transition: background 0.2s;" 
                        onmouseover="this.style.backgroundColor='#1d4ed8'"
                        onmouseout="this.style.backgroundColor='#2563eb'"
                        onclick="openQuizDetail('${quiz.id}')">
                        Begin Quiz
                    </button>
                </div>
            </div>
        `;
    }).join('');

    renderQuizPagination(allFetchedQuizzes.length, page);
}

/**
 * 3. PAGINATION
 */
function renderQuizPagination(totalItems, currentPage) {
    const container = document.getElementById('quiz-pagination');
    if (!container) return; 
    const wrapper = container.closest('.pagination-wrapper') || container;
    
    const totalPages = Math.ceil(totalItems / QUIZ_PER_PAGE);
    
    // Ẩn nếu chỉ có 1 trang
    if (totalPages <= 1) { 
        container.innerHTML = ''; 
        wrapper.style.display = 'none'; 
        return; 
    }
    
    wrapper.style.display = 'block';
    
    let html = `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changeQuizPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changeQuizPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) html += `<span>...</span>`;
    }
    html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changeQuizPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    
    container.innerHTML = html;
}

window.changeQuizPage = function(page) {
    const totalPages = Math.ceil(allFetchedQuizzes.length / QUIZ_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentQuizPage = page;
    renderQuizGrid(page);
    document.getElementById('recent-quiz-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ... (Giữ nguyên các hàm openQuizDetail, backToQuizList như cũ)
function openQuizDetail(quizId) {
    selectedQuiz = allFetchedQuizzes.find(q => String(q.id) === String(quizId));
    if (!selectedQuiz) return;

    document.getElementById('quiz-detail-title').innerText = selectedQuiz.title;
    document.getElementById('quiz-detail-desc').innerText = selectedQuiz.description || "No description.";
    document.getElementById('quiz-detail-q-count').innerText = selectedQuiz.questions ? selectedQuiz.questions.length : 0;
    
    const detailImg = document.getElementById('quiz-detail-img');
    if(detailImg) detailImg.src = `https://picsum.photos/800/450?random=${selectedQuiz.id}`;

    const btnStart = document.getElementById('btn-start-quiz-action');
    if(btnStart) {
        btnStart.onclick = function() {
            if(typeof startQuizTaking === 'function') startQuizTaking(selectedQuiz); 
        };
    }
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('quiz-detail-content').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToQuizList() {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('quizz-content').classList.add('active');
}

window.loadUserQuizzes = loadUserQuizzes;
window.openQuizDetail = openQuizDetail;
window.backToQuizList = backToQuizList;