// @ts-nocheck
/* =========================================
   QUIZ MANAGER: FETCH, MAP AUTHOR & RENDER
   ========================================= */

// Đảm bảo URL này khớp với backend của bạn
const QUIZ_API_URL = "http://localhost:3000"; 
const QUIZ_PER_PAGE = 8;

// STATE
let allFetchedQuizzes = [];
let currentQuizPage = 1;
let selectedQuiz = null; 

/**
 * 1. LOAD DATA: FETCH QUIZZES & MAP TEACHER NAME
 */
async function loadUserQuizzes() {
    const gridContainer = document.getElementById('recent-quiz-grid');
    const paginationContainer = document.getElementById('quiz-pagination');
    
    // Ẩn mục "Newest Quizz" nếu có (để tránh trùng lặp giao diện)
    const newestSection = document.getElementById('newest-quiz-grid')?.closest('.section-wrapper');
    if(newestSection) newestSection.style.display = 'none';

    if (!gridContainer) return;

    // Loading UI
    gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải dữ liệu bài kiểm tra...</p></div>';

    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            gridContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Vui lòng đăng nhập để xem bài kiểm tra.</p>';
            return;
        }

        // --- GIAI ĐOẠN 1: GỌI API SONG SONG ---
        // 1. Lấy danh sách Quiz của học sinh
        // 2. Lấy thông tin bản thân (user/self) để biết đang follow giáo viên nào
        const [quizRes, selfRes] = await Promise.all([
            authFetch(`${QUIZ_API_URL}/assessment/quiz/findByUserId/${userId}`, { method: 'GET' }),
            authFetch(`${QUIZ_API_URL}/user/self`, { method: 'GET' })
        ]);

        if (!quizRes || !quizRes.ok) throw new Error('Failed to fetch quizzes');

        // Xử lý dữ liệu Quiz thô
        let rawQuizzes = [];
        const quizData = await quizRes.json();
        if (Array.isArray(quizData)) rawQuizzes = quizData;
        else if (quizData && typeof quizData === 'object') rawQuizzes = [quizData];

        // Xử lý dữ liệu User Self -> Lấy danh sách ID giáo viên
        let myTeacherIds = [];
        if (selfRes && selfRes.ok) {
            const selfData = await selfRes.json();
            if (selfData && Array.isArray(selfData.teachersInCharge)) {
                myTeacherIds = selfData.teachersInCharge;
            }
        }
        console.log("My Teacher IDs:", myTeacherIds);

        // --- GIAI ĐOẠN 2: LẤY CHI TIẾT GIÁO VIÊN ---
        // Cần gọi API findById cho từng giáo viên để lấy được assignedQuizIds
        let teachersDetails = [];
        if (myTeacherIds.length > 0) {
            // Tạo mảng Promise để fetch song song
            const detailPromises = myTeacherIds.map(tId => 
                authFetch(`${QUIZ_API_URL}/user/findById/${tId}`, { method: 'GET' })
                    .then(res => res.ok ? res.json() : null)
                    .catch(err => null)
            );
            
            const results = await Promise.all(detailPromises);
            teachersDetails = results.filter(t => t !== null);
        }
        console.log("Teachers Details:", teachersDetails);

        // --- GIAI ĐOẠN 3: ÁNH XẠ (MAPPING) ---
        // Duyệt từng Quiz, tìm xem nó thuộc về giáo viên nào
        allFetchedQuizzes = rawQuizzes.map(quiz => {
            let authorName = "Giáo viên Hệ thống"; // Mặc định nếu không tìm thấy
            
            // Tìm trong danh sách giáo viên chi tiết
            const creator = teachersDetails.find(teacher => {
                if (teacher.assignedQuizIds && Array.isArray(teacher.assignedQuizIds)) {
                    // So sánh ID (chuyển về string để an toàn)
                    return teacher.assignedQuizIds.some(qId => String(qId) === String(quiz.id));
                }
                return false;
            });

            if (creator) {
                // Ưu tiên fullname, nếu không có thì lấy name hoặc username
                authorName = creator.fullname || creator.name || creator.username;
            }

            return {
                ...quiz,
                teacherName: authorName // Gắn thêm trường này vào object quiz
            };
        });

        // --- GIAI ĐOẠN 4: RENDER ---
        currentQuizPage = 1;
        
        if (allFetchedQuizzes.length === 0) {
            gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;">Bạn chưa có bài kiểm tra nào.</div>';
            // Ẩn phân trang nếu không có dữ liệu
            if(paginationContainer) {
                const wrapper = paginationContainer.closest('.pagination-wrapper');
                if(wrapper) wrapper.style.display = 'none';
            }
            return;
        }

        renderQuizGrid(1);

    } catch (error) {
        console.error('Quiz Load Error:', error);
        gridContainer.innerHTML = '<div style="color:red;text-align:center; grid-column:1/-1;">Lỗi kết nối server.</div>';
    }
}

/**
 * 2. RENDER GRID (Giao diện đẹp + Tên giáo viên)
 */
function renderQuizGrid(page) {
    const grid = document.getElementById('recent-quiz-grid');
    if (!grid) return;

    const start = (page - 1) * QUIZ_PER_PAGE;
    const end = start + QUIZ_PER_PAGE;
    const pageData = allFetchedQuizzes.slice(start, end);

    grid.innerHTML = pageData.map((quiz, index) => {
        // 1. Ảnh Random đẹp từ Picsum
        // Dùng quiz.id hoặc index để cố định ảnh, không bị đổi khi reload
        const randomImgUrl = `https://picsum.photos/500/300?random=${quiz.id || index + 100}`;

        // 2. Xử lý text
        const title = quiz.title || "Bài kiểm tra chưa đặt tên";
        let desc = quiz.description || "Chưa có mô tả.";
        if (desc.length > 55) desc = desc.substring(0, 55) + "...";
        
        // 3. Category giả lập (để UI đỡ trống)
        const categories = ["Lập trình", "Thiết kế", "Marketing", "Kinh doanh", "Ngoại ngữ"];
        const category = categories[(index) % categories.length];

        // 4. Tên Giáo viên (Lấy từ kết quả map ở trên)
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
 * 3. PAGINATION (Tự ẩn nếu ít trang)
 */
function renderQuizPagination(totalItems, currentPage) {
    const container = document.getElementById('quiz-pagination');
    if (!container) return; 
    
    // Tìm thẻ wrapper bao ngoài để ẩn/hiện cả cục
    const wrapper = container.closest('.pagination-wrapper') || container;
    
    const totalPages = Math.ceil(totalItems / QUIZ_PER_PAGE);
    
    // Nếu chỉ có 1 trang -> Ẩn hoàn toàn
    if (totalPages <= 1) { 
        container.innerHTML = ''; 
        if(wrapper) wrapper.style.display = 'none'; 
        return; 
    }
    
    // Nếu có nhiều trang -> Hiện lại
    if(wrapper) wrapper.style.display = 'block';
    
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

/**
 * 4. OPEN DETAIL & BACK (Logic chuyển tab)
 */
function openQuizDetail(quizId) {
    selectedQuiz = allFetchedQuizzes.find(q => String(q.id) === String(quizId));

    if (!selectedQuiz) {
        alert("Không tìm thấy dữ liệu bài kiểm tra.");
        return;
    }

    // --- THÊM DÒNG NÀY: Ẩn bảng kết quả cũ đi ---
    const miniBox = document.getElementById('mini-result-box');
    if (miniBox) miniBox.style.display = 'none';

    // Điền thông tin vào trang chi tiết
    document.getElementById('quiz-detail-title').innerText = selectedQuiz.title;
    document.getElementById('quiz-detail-desc').innerText = selectedQuiz.description || "No description available.";
    
    const qCount = selectedQuiz.questions ? selectedQuiz.questions.length : 0;
    document.getElementById('quiz-detail-q-count').innerText = qCount;

    // Ảnh chi tiết
    const detailImg = document.getElementById('quiz-detail-img');
    if(detailImg) detailImg.src = `https://picsum.photos/800/450?random=${selectedQuiz.id}`;

    // Nút Start
    const btnStart = document.getElementById('btn-start-quiz-action');
    if(btnStart) {
        btnStart.onclick = function() {
            // Kiểm tra hàm startQuizTaking từ script.js
            if(typeof startQuizTaking === 'function') {
                startQuizTaking(selectedQuiz); 
            } else {
                alert("Chức năng làm bài chưa sẵn sàng.");
            }
        };
    }

    // Chuyển Tab
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('quiz-detail-content').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToQuizList() {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('quizz-content').classList.add('active');
}

// Expose functions globally
window.loadUserQuizzes = loadUserQuizzes;
window.openQuizDetail = openQuizDetail;
window.backToQuizList = backToQuizList;