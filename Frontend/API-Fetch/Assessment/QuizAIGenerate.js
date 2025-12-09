// API-Fetch/Assessment/QuizAIGenerate.js
// @ts-nocheck

// Fallback showMessage (force alert cho error/success để test)
function showMessage(id, msg, type = 'info') {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.className = type;
        el.style.display = 'block';  // Force show nếu ẩn
        setTimeout(() => { 
            el.textContent = ''; 
            el.className = ''; 
            el.style.display = 'none'; 
        }, 5000);
    }
    // Always console + alert for visibility
    console.log(`${type.toUpperCase()}: ${msg}`);
    if (type === 'error' || type === 'success') {
        alert(`${type.toUpperCase()}: ${msg}`);  // Force alert để debug
    }
}

/**
 * Hàm gọi API tạo Quiz bằng AI (thêm robust error handling)
 */
async function generateQuizWithAI(topic, type, difficulty, numberOfQuestions) {
    let token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No access token. Please login.');
    }

    const params = new URLSearchParams({
        topic,
        type,
        difficulty,
        numberOfQuestions: numberOfQuestions.toString()
    });
    const url = `${window.API_BASE_URL || 'http://localhost:3000'}/assessment/quiz/ai/gen?${params.toString() || ''}`;
    console.log('AI API URL:', url);  // Debug URL

    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('Response Status:', response.status, response.statusText);  // Debug status

    // Log raw body nếu !ok
    if (!response.ok) {
        let errorBody;
        try {
            const text = await response.text();
            console.log('Error Body:', text);  // Raw response để debug (e.g., HTML 404)
            errorBody = text;
        } catch (e) {
            errorBody = 'Không đọc được body';
        }
        throw new Error(`API Error ${response.status}: ${errorBody.substring(0, 200)}...`);  // Clear message
    }

    // Handle json() fail
    let data;
    try {
        data = await response.json();
    } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Response không phải JSON: ' + await response.text());
    }

    console.log('AI Quiz Data Generated:', data);  // Debug data
    return data;
}

/**
 * Hàm populate quiz data từ AI vào form
 */
function populateQuizFormWithAI(aiQuizData) {
    console.log('Starting populate with:', aiQuizData);

    // Set title & description
    const titleEl = document.getElementById('quiz-title');
    const descEl = document.getElementById('quiz-description');
    if (titleEl) titleEl.value = aiQuizData.title || 'AI Generated Quiz';
    else console.error('quiz-title not found');
    if (descEl) descEl.value = aiQuizData.description || aiQuizData.title || '';
    else console.error('quiz-description not found');

    // Clear & add questions
    const container = document.getElementById('questions-container');
    if (!container) {
        console.error('Questions container not found! Ensure form is shown first.');
        return;
    }
    container.innerHTML = '';
    if (typeof window.questionId !== 'undefined') window.questionId = 0;

    if (aiQuizData.questions && aiQuizData.questions.length > 0) {
        aiQuizData.questions.forEach((q) => {
            // Fallback nếu addQuestion không tồn tại
            if (typeof window.addQuestion === 'function') {
                window.addQuestion();
            } else {
                console.warn('addQuestion not found, skipping question add');
                return;  // Skip nếu không có function
            }
            const group = container.lastChild;
            if (!group) return;

            const typeSelect = group.querySelector('.question-type');
            if (typeSelect) {
                typeSelect.value = q.type || 'multiple-choice';
                if (typeof window.toggleOptions === 'function') window.toggleOptions(typeSelect);
            }

            let baseQuestion = q.question || '';
            if (q.type === 'multiple-choice' && baseQuestion.includes('\n')) {
                const lines = baseQuestion.split('\n');
                baseQuestion = lines[0].trim();

                const options = lines.slice(1)
                    .map(line => line.trim())
                    .filter(line => /^[A-Z]\.\s/.test(line))
                    .map(line => line.substring(3).trim());

                const optsContainer = group.querySelector('.options-container');
                if (optsContainer) {
                    optsContainer.innerHTML = '<h4>Options</h4>';
                    options.forEach((opt, i) => {
                        const optGroup = document.createElement('div');
                        optGroup.className = 'option-group';
                        optGroup.innerHTML = `<input type="text" class="option-text" placeholder="Option ${i + 1}" value="${opt}">`;
                        optsContainer.appendChild(optGroup);
                    });
                    // Re-add Add Option button
                    const addBtn = document.createElement('button');
                    addBtn.type = 'button';
                    addBtn.className = 'add-option';
                    addBtn.textContent = 'Add Option';
                    addBtn.onclick = (e) => { 
                        if (typeof window.addOption === 'function') window.addOption(e.target); 
                    };
                    optsContainer.appendChild(addBtn);
                }
            }

            const qTextEl = group.querySelector('.question-text');
            if (qTextEl) qTextEl.value = baseQuestion;
            const qExpEl = group.querySelector('.question-explanation');
            if (qExpEl) qExpEl.value = q.questionExplanation || '';
            const aExpEl = group.querySelector('.answer-explanation');
            if (aExpEl) aExpEl.value = q.answerExplanation || '';
            const corrEl = group.querySelector('.correct-answer');
            if (corrEl) corrEl.value = q.correctAnswer || '';
        });
        console.log('Populate completed. Questions added:', aiQuizData.questions.length);
    } else {
        console.warn('No questions in AI data');
        showMessage('quiz-message', 'API trả về không có câu hỏi. Kiểm tra console.', 'error');
    }
}

/**
 * Hàm xử lý submit AI (sửa: show form TRƯỚC populate)
 */
async function handleAIGenerateSubmit(e) {
    e.preventDefault();
    console.log('AI Generate triggered!');

    const topicEl = document.getElementById('ai-topic');
    const typeEl = document.getElementById('ai-type');
    const diffEl = document.getElementById('ai-difficulty');
    const numEl = document.getElementById('ai-num-questions');

    if (!topicEl || !typeEl || !diffEl || !numEl) {
        showMessage(null, 'Form elements not found. Check modal HTML.', 'error');  // Null id để force alert
        return;
    }

    const topic = topicEl.value.trim();
    const type = typeEl.value;
    const difficulty = diffEl.value;
    const numberOfQuestions = parseInt(numEl.value) || 1;

    if (!topic || !type || !difficulty || !numberOfQuestions) {
        showMessage('ai-message', 'Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    const loadingEl = document.getElementById('ai-loading');
    if (loadingEl) loadingEl.style.display = 'block';

    try {
        // Show form TRƯỚC để container render
        if (typeof window.showCreateQuizForm === 'function') {
            window.showCreateQuizForm();
            console.log('Form shown before populate');
        } else {
            throw new Error('showCreateQuizForm not found! Check QuizCreate.js load order.');
        }

        // Sau đó fetch và populate
        const aiQuizData = await generateQuizWithAI(topic, type, difficulty, numberOfQuestions);
        if (loadingEl) loadingEl.style.display = 'none';

        populateQuizFormWithAI(aiQuizData);

        // Tắt modal
        const aiModal = document.getElementById('ai-generate-modal');
        if (aiModal) aiModal.style.display = 'none';

        showMessage('quiz-message', `Đã tạo thành công ${numberOfQuestions} câu hỏi bằng AI! Kiểm tra step Questions.`, 'success');
    } catch (error) {
        console.error('AI Error Full:', error);  // Debug full error
        if (loadingEl) loadingEl.style.display = 'none';
        showMessage('ai-message', 'Lỗi: ' + error.message, 'error');
    }
}

// Modal functions (giữ nguyên)
function showAIGenerateModal() {
    const modal = document.getElementById('ai-generate-modal');
    if (modal) {
        modal.style.display = 'flex';
        const form = document.getElementById('ai-generate-form');
        if (form) form.reset();
        console.log('AI Modal shown');
    } else {
        alert('Modal chưa thêm vào HTML! Thêm code modal vào teacher.html.');
    }
}

function hideAIGenerateModal() {
    const modal = document.getElementById('ai-generate-modal');
    if (modal) modal.style.display = 'none';
}

// Event listener (giữ nguyên)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachAIEvent);
} else {
    attachAIEvent();
}
function attachAIEvent() {
    const aiForm = document.getElementById('ai-generate-form');
    if (aiForm) {
        aiForm.addEventListener('submit', handleAIGenerateSubmit);
        console.log('AI Form event attached');
    } else {
        console.warn('AI Form not found - add HTML first');
    }
}