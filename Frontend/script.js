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
   2. QUIZ TAKING ENGINE (REAL DATA)
   ========================================= */

let currentActiveQuiz = null;   // Lưu trữ bài quiz đang làm
let userAnswers = {};           // Lưu câu trả lời: { questionIndex: "answer" }

// Hàm bắt đầu làm bài (Được gọi từ QuizGet.js với dữ liệu thật)
function startQuizTaking(quizData) {
    if (!quizData || !quizData.questions) {
        alert("Dữ liệu bài kiểm tra bị lỗi hoặc không có câu hỏi.");
        return;
    }

    currentActiveQuiz = quizData;
    userAnswers = {}; // Reset câu trả lời

    // Cập nhật Header UI
    const titleEl = document.querySelector('#quiz-taking-content h2');
    const subTextEl = document.querySelector('#quiz-taking-content .sub-text');
    
    if(titleEl) titleEl.innerText = quizData.title;
    // Nếu có tên giáo viên thì hiện, không thì ẩn
    if(subTextEl) subTextEl.innerText = quizData.teacherName ? `Teacher: ${quizData.teacherName}` : 'Self Practice';

    // Reset Timer (Giả sử mặc định 45 phút hoặc lấy từ data nếu có)
    const timerEl = document.getElementById('timer');
    if(timerEl) timerEl.innerText = "45:00"; 

    // Chuyển Tab
    document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
    document.getElementById('quiz-taking-content').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render câu hỏi
    renderQuestions();
}

function renderQuestions() {
    const questionsContainer = document.getElementById('questions-container');
    const navContainer = document.getElementById('question-nav-grid');
    
    if(!questionsContainer || !navContainer) return;

    questionsContainer.innerHTML = '';
    navContainer.innerHTML = '';

    const questions = currentActiveQuiz.questions;

    questions.forEach((q, index) => {
        const qNum = index + 1; // Số thứ tự câu hỏi (1, 2, 3...)

        // 1. Xử lý nội dung câu hỏi và đáp án
        // Dựa vào logic tạo quiz: Multiple choice được lưu dạng "Câu hỏi\nA. Opt1\nB. Opt2..."
        let questionText = q.question;
        let optionsHtml = '';

        if (q.type === 'multiple-choice') {
            // Tách câu hỏi và đáp án dựa trên xuống dòng
            const parts = q.question.split('\n');
            const mainQuestion = parts[0]; 
            const options = parts.slice(1); // Các dòng còn lại là đáp án (A..., B...)

            questionText = mainQuestion; // Hiển thị câu hỏi chính

            // Render các nút bấm trắc nghiệm
            if (options.length > 0) {
                optionsHtml = `<div class="options-group" id="options-group-${index}">
                    ${options.map((opt, optIdx) => {
                        // Xử lý cắt bỏ "A. " để lấy nội dung nếu cần, ở đây giữ nguyên cho giống đề
                        return `<button class="option-btn" onclick="selectAnswer(${index}, '${opt.replace(/'/g, "\\'")}', this)">${opt}</button>`;
                    }).join('')}
                </div>`;
            }
        } else {
            // Trường hợp Text hoặc Number (Tự luận)
            optionsHtml = `<div class="input-answer-group">
                <input type="${q.type === 'number' ? 'number' : 'text'}" 
                       class="form-control" 
                       placeholder="Type your answer here..." 
                       onchange="inputTextAnswer(${index}, this.value)">
            </div>`;
        }

        // 2. Tạo HTML cho khối câu hỏi
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';
        qBlock.id = `q-block-${qNum}`;
        qBlock.innerHTML = `
            <div class="question-meta">
                <span>Question ${qNum}</span>
                <span style="font-size: 0.8rem; color: #666; font-weight: normal;">Type: ${q.type}</span>
            </div>
            <p class="question-text" style="white-space: pre-line;">${questionText}</p>
            ${optionsHtml}
        `;
        questionsContainer.appendChild(qBlock);

        // 3. Tạo nút điều hướng bên phải
        const navItem = document.createElement('div');
        navItem.className = 'nav-item';
        navItem.id = `nav-item-${index}`;
        navItem.innerText = qNum;
        navItem.onclick = () => scrollToQuestion(qNum);
        navContainer.appendChild(navItem);
    });
}

// Xử lý khi chọn trắc nghiệm
function selectAnswer(qIdx, answerValue, btnElement) {
    // 1. Lưu đáp án
    userAnswers[qIdx] = answerValue;

    // 2. Update UI (Highligh nút được chọn)
    const group = document.getElementById(`options-group-${qIdx}`);
    if (group) {
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btnElement.classList.add('selected');
    }

    // 3. Update Sidebar (Đánh dấu đã làm)
    const navItem = document.getElementById(`nav-item-${qIdx}`);
    if (navItem) navItem.classList.add('answered');
}

// Xử lý khi nhập tự luận
function inputTextAnswer(qIdx, value) {
    const navItem = document.getElementById(`nav-item-${qIdx}`);
    
    if (value && value.trim() !== "") {
        userAnswers[qIdx] = value;
        if (navItem) navItem.classList.add('answered');
    } else {
        delete userAnswers[qIdx];
        if (navItem) navItem.classList.remove('answered');
    }
}

function scrollToQuestion(qNum) {
    const el = document.getElementById(`q-block-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// /* =========================================
//    3. SUBMIT QUIZ LOGIC (SHOW RESULT IN DETAIL PAGE)
//    ========================================= */

// async function submitQuiz() {
//     if (!currentActiveQuiz) return;
//     const studentId = localStorage.getItem('userId');
    
//     if (!studentId) {
//         alert("Bạn cần đăng nhập để nộp bài.");
//         return;
//     }

//     const totalQ = currentActiveQuiz.questions.length;
//     const answeredCount = Object.keys(userAnswers).length;

//     if (!confirm(`Bạn có chắc chắn muốn nộp bài?\nĐã làm: ${answeredCount}/${totalQ} câu.`)) {
//         return;
//     }

//     const submitBtn = document.querySelector('.btn-submit');
//     const originalText = submitBtn ? submitBtn.innerText : 'Submit';
//     if (submitBtn) {
//         submitBtn.innerText = "Đang chấm điểm...";
//         submitBtn.disabled = true;
//     }

//     try {
//         const answersPayload = currentActiveQuiz.questions.map((q, index) => {
//             return {
//                 question: q.question, 
//                 answer: userAnswers[index] || "" 
//             };
//         });

//         const payload = {
//             quizId: currentActiveQuiz.id,
//             studentId: studentId,
//             answers: answersPayload
//         };

//         const response = await authFetch(`http://localhost:3000/assessment/result/ai/grade`, {
//             method: 'POST',
//             body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//             const errText = await response.text();
//             throw new Error(errText || "Lỗi khi chấm điểm");
//         }

//         const result = await response.json();
//         console.log("Grading Result:", result);

//         // --- THAY ĐỔI Ở ĐÂY: Hiển thị kết quả trên trang chi tiết ---
//         showQuizResultOnDetail(result);

//     } catch (error) {
//         console.error("Submit Error:", error);
//         alert(`Có lỗi xảy ra: ${error.message}`);
//     } finally {
//         if (submitBtn) {
//             submitBtn.innerText = originalText;
//             submitBtn.disabled = false;
//         }
//     }
// }

/**
 * Hàm mới: Quay về trang chi tiết và hiện bảng điểm
 */
function showQuizResultOnDetail(result) {
    // 1. Chuyển Tab về trang chi tiết
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('quiz-detail-content').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Điền dữ liệu vào Mini Box
    const resultBox = document.getElementById('mini-result-box');
    const scoreEl = document.getElementById('mini-score');
    const feedbackEl = document.getElementById('mini-feedback');

    if (resultBox && scoreEl && feedbackEl) {
        // Hiện box
        resultBox.style.display = 'block';

        // Gán điểm
        scoreEl.innerText = result.rating !== undefined ? result.rating : "N/A";

        // Gán feedback
        feedbackEl.innerText = result.comment || result.message || "No feedback available.";
        
        // Thêm hiệu ứng nhấp nháy nhẹ để người dùng chú ý
        resultBox.style.animation = "fadeIn 0.5s ease-in-out";
    }
}

/* =========================================
   3. SUBMIT QUIZ LOGIC (LOCAL GRADING & SCORING)
   ========================================= */

// Hàm tạo MongoDB ObjectId giả (24 ký tự hex) để vượt qua validation của Server
function generateMongoId() {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
}

async function submitQuiz() {
    if (!currentActiveQuiz) return;
    const studentId = localStorage.getItem('userId');
    if (!studentId) { alert("Bạn cần đăng nhập."); return; }

    const totalQ = currentActiveQuiz.questions.length;
    const answeredCount = Object.keys(userAnswers).length;

    if (!confirm(`Bạn có chắc chắn muốn nộp bài?\nĐã làm: ${answeredCount}/${totalQ} câu.`)) return;

    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn ? submitBtn.innerText : 'Submit';
    if (submitBtn) {
        submitBtn.innerText = "Đang xử lý...";
        submitBtn.disabled = true;
    }

    setTimeout(async () => {
        try {
            // 1. TÍNH ĐIỂM
            let correctCount = 0;
            currentActiveQuiz.questions.forEach((q, index) => {
                const userAns = userAnswers[index];
                const correctAns = q.correctAnswer;
                if (userAns && correctAns) {
                    const u = userAns.trim().toLowerCase();
                    const c = correctAns.trim().toLowerCase();
                    if (u.includes(c) || c.includes(u)) correctCount++;
                }
            });

            let rawScore = (correctCount / totalQ) * 10;
            let finalScore = Math.round(rawScore); 
            const feedbackText = finalScore >= 5 
                ? `Làm tốt lắm! Bạn đúng ${correctCount}/${totalQ} câu.` 
                : `Cần cố gắng hơn. Bạn đúng ${correctCount}/${totalQ} câu.`;

            // 2. TẠO NGÀY (dd/MM/yyyy) - Định dạng chuỗi ngày chuẩn
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0'); 
            const yyyy = today.getFullYear();
            const dateString = `${dd}/${mm}/${yyyy}`; 

            // 3. CHUẨN BỊ PAYLOAD (Đã fix ID và Date)
            const savePayload = {
                studentId: studentId,
                quizId: currentActiveQuiz.id,
                rating: finalScore,
                comment: feedbackText,
            };

            console.log("Payload chuẩn bị gửi:", JSON.stringify(savePayload, null, 2));

            // 4. GỌI API
            const response = await authFetch(`http://localhost:3000/assessment/result/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload)
            });

            if (response.ok) {
                console.log("Lưu thành công!");
            } else {
                const errText = await response.text();
                console.warn(`Lưu thất bại (Code ${response.status}):`, errText);
            }

            // 5. HIỂN THỊ KẾT QUẢ
            const resultToDisplay = { 
                rating: finalScore, 
                comment: feedbackText 
            }; 
            showQuizResultOnDetail(resultToDisplay);

        } catch (error) {
            console.error("Lỗi:", error);
            alert("Có lỗi khi nộp bài.");
        } finally {
            if (submitBtn) {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        }
    }, 800);
}

/**
 * Hàm ẩn bảng kết quả (gắn vào nút "Đóng kết quả")
 */
function hideResultBox() {
    const resultBox = document.getElementById('quiz-result-box');
    if (resultBox) {
        resultBox.style.display = 'none';
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

// Hàm chuyển đổi các bước (Step) trong form tạo Quiz
function switchQuizStep(stepId) {
    // 1. Xử lý UI nút bấm (Tab headers)
    // Xóa class active ở tất cả các nút step
    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Thêm class active cho nút tương ứng với stepId
    // Tìm nút có onclick chứa stepId tương ứng
    const activeBtn = document.querySelector(`.step-btn[onclick*="'${stepId}'"]`);
    if(activeBtn) {
        activeBtn.classList.add('active');
    }

    // 2. Xử lý hiển thị nội dung (Tab content)
    // Ẩn tất cả các step-content
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Hiện step-content được chọn
    const targetContent = document.getElementById('step-' + stepId);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // 3. Cập nhật thanh Progress Bar (Tùy chọn cho đẹp)
    const progressFill = document.getElementById('quiz-progress-fill');
    if (progressFill) {
        let width = '33%';
        if (stepId === 'basic') width = '33%';
        else if (stepId === 'question') width = '66%';
        else if (stepId === 'publish') width = '100%';
        progressFill.style.width = width;
    }
}