function showCreateQuizForm() {
            document.getElementById('quiz-list-view').style.display = 'none';
            document.getElementById('quiz-form-view').style.display = 'block';
            document.getElementById('quiz-form-title').textContent = 'Create New Quiz';  // Reset to create mode
            document.getElementById('quiz-id').value = '';  // Clear quizId for create
            // Optional: Reset form fields if needed
            document.getElementById('create-quiz-form').reset();
            const container = document.getElementById('questions-container');
            container.innerHTML = '';  // Clear questions
            questionId = 0;
            addQuestion();  // Add default first question

            // Added: Reset steps to start at Basic Information
            document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
            document.getElementById('step-basic').classList.add('active');
            document.querySelectorAll('.step-btn').forEach(el => el.classList.remove('active'));
            document.querySelector('.step-btn[onclick="switchQuizStep(\'basic\')"]').classList.add('active');  // Activate Basic button
            const currentAssigned = document.getElementById('current-assigned');
            const assignedNames = document.getElementById('current-assigned-names');
            if (currentAssigned) {
                currentAssigned.style.display = 'none';
            }
            if (assignedNames) {
                assignedNames.textContent = '';
            }
            populateAssignSelect();
        }
        function hideCreateQuizForm() {
            document.getElementById('quiz-form-view').style.display = 'none';
            document.getElementById('quiz-list-view').style.display = 'block';
            document.getElementById('quiz-form-title').textContent = 'Create New Quiz';  // Reset title
            document.getElementById('quiz-id').value = '';  // Clear quizId
            // Optional: Reset form
            document.getElementById('create-quiz-form').reset();
            const container = document.getElementById('questions-container');
            container.innerHTML = '';
            questionId = 0;
            fetchAndRenderQuizzes();  // Refresh list on back
        }
const createQuizForm = document.getElementById('create-quiz-form');
if (createQuizForm) {
    createQuizForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Submit event triggered!');
        const userId = localStorage.getItem('userId');
        if (!userId) {
            showMessage('quiz-message', 'User ID not found. Please login again.', 'error');
            return;
        }

        // Thu thập data (giữ nguyên)
        const title = document.getElementById('quiz-title').value;
        const description = document.getElementById('quiz-description').value;
        const questions = [];
        const questionGroups = document.querySelectorAll('.question-group');
        questionGroups.forEach((group, index) => {
            const type = group.querySelector('.question-type').value;
            let questionText = group.querySelector('.question-text').value;  // Start with base question
            const questionObj = {
                id: index + 1,
                question: questionText,  // Will update if multiple-choice
                type: type,
                questionExplanation: group.querySelector('.question-explanation').value || '',
                answerExplanation: group.querySelector('.answer-explanation').value || '',
                correctAnswer: group.querySelector('.correct-answer').value || ''
            };

            if (type === 'multiple-choice') {
                const options = [];
                group.querySelectorAll('.option-text').forEach(opt => {
                    if (opt.value) options.push(opt.value);
                });
                // Embed options into question string (e.g., "What is...? A. Opt1 B. Opt2")
                questionObj.question += '\n' + options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n');
                // Assume correctAnswer is a letter like "A" or index like "1"
            }

            questions.push(questionObj);
        });

        const quizId = document.getElementById('quiz-id').value;
        let quizData;
        let result;
        const selectedStudentId = document.getElementById('assign-student').value;

        if (quizId) {
            // Update quiz
            quizData = {
                quizId,  // Add for update (matches API spec)
                title,
                description,
                questions
            };
            console.log('Quiz Update Data to Send:', JSON.stringify(quizData, null, 2));
            result = await updateQuizAPI(quizId, quizData);
            showMessage('quiz-message', 'Quiz updated successfully!', 'success');

            // Assign thêm student nếu có select
            if (selectedStudentId) {
                await assignQuizToUserAPI(quizId, selectedStudentId);
                showMessage('quiz-message', 'Additional student assigned successfully!', 'success');
            }
        } else {
            // Create quiz (giữ nguyên)
            const beforeQuizzes = await getQuizzesByUserIdAPI(userId);
            console.log('Before Quizzes:', beforeQuizzes);
            quizData = {
                userId,  // Keep for create
                title,
                description,
                questions
            };
            console.log('Quiz Create Data to Send:', JSON.stringify(quizData, null, 2));
            result = await createQuizAPI(quizData);
            console.log(result);
            showMessage('quiz-message', 'Quiz created successfully!', 'success');
            await new Promise(resolve => setTimeout(resolve, 1000));
            const afterQuizzes = await getQuizzesByUserIdAPI(userId);
            console.log('After Quizzes:', afterQuizzes);
            const newQuiz = afterQuizzes.find(q => !beforeQuizzes.some(b => b.id === q.id));
            if (!newQuiz) {
                showMessage('quiz-message', 'Could not find newly created quiz. Please check the list.', 'error');
                return;
            }

            console.log('New Quiz ID:', newQuiz.id);  // Log để confirm
            if (selectedStudentId) {
                await assignQuizToUserAPI(newQuiz.id, selectedStudentId); // Assign cho create
                showMessage('quiz-message', 'Quiz assigned to student successfully!', 'success');
            }
        }
        console.log(result);
        createQuizForm.reset();  // Reset form
        document.getElementById('quiz-id').value = '';  // Clear to prevent issues on next create
        // Refresh quizzes list
        fetchAndRenderQuizzes();
        setTimeout(() => {
            hideCreateQuizForm();
        }, 2000);
    });
}
