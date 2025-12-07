async function editQuiz(quizId) {
    try {
        const quiz = await getQuizByIdAPI(quizId);
        showCreateQuizForm();  // Show form (resets to create, but we'll override)
        document.getElementById('quiz-form-title').textContent = 'Edit Quiz';
        document.getElementById('quiz-id').value = quiz.id;
        document.getElementById('quiz-title').value = quiz.title;
        document.getElementById('quiz-description').value = quiz.description;
        document.getElementById('publish-button').textContent = 'Update Quiz';

        const assignedIds = quiz.assignee ? quiz.assignee.map(a => a.id || a.userId) : [];  // Điều chỉnh field ID nếu khác

        // Populate select chỉ với students chưa assign
        populateAssignSelect(assignedIds);

        // Hiển thị current assigned students
        const currentAssigned = document.getElementById('current-assigned');
        const assignedNames = document.getElementById('current-assigned-names');
        if (quiz.assignee && quiz.assignee.length > 0) {
            currentAssigned.style.display = 'block';
            assignedNames.textContent = quiz.assignee.map(a => `${a.name || a.username} (@${a.username || a.userId})`).join(', ');
        } else {
            currentAssigned.style.display = 'none';
            assignedNames.textContent = '';
        }

        // Clear existing questions
        const container = document.getElementById('questions-container');
        container.innerHTML = '';
        questionId = 0;

        // Populate questions (giữ nguyên code cũ)
        quiz.questions.forEach(q => {
            addQuestion();  // Creates a new question group and increments questionId
            const group = container.lastChild;  // Get the newly added group

            let baseQuestion = q.question;
            const typeSelect = group.querySelector('.question-type');
            typeSelect.value = q.type;
            toggleOptions(typeSelect);

            if (q.type === 'multiple-choice') {
                // Parse embedded options (format: "Question\nA. Opt1\nB. Opt2...")
                const lines = q.question.split('\n');
                baseQuestion = lines[0];
                const options = lines.slice(1).map(line => line.substring(3).trim());  // Remove "A. " (3 chars: letter + . + space)

                // Clear default option and rebuild
                const optsContainer = group.querySelector('.options-container');
                optsContainer.innerHTML = '<h4>Options</h4>';  // Reset options
                options.forEach((opt, i) => {
                    const optGroup = document.createElement('div');
                    optGroup.className = 'option-group';
                    optGroup.innerHTML = `<input type="text" class="option-text" placeholder="Option ${i + 1}" value="${opt}">`;
                    optsContainer.appendChild(optGroup);
                });
                // Re-append the "Add Option" button (it gets removed by innerHTML reset)
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.className = 'add-option';
                addBtn.textContent = 'Add Option';
                addBtn.onclick = function() { addOption(this); };
                optsContainer.appendChild(addBtn);
            }

            group.querySelector('.question-text').value = baseQuestion;
            group.querySelector('.question-explanation').value = q.questionExplanation || '';
            group.querySelector('.answer-explanation').value = q.answerExplanation || '';
            group.querySelector('.correct-answer').value = q.correctAnswer || '';
        });
    } catch (error) {
        alert('Error loading quiz for edit: ' + error.message);
    }
} 
       let questionId = 1;
        function addQuestion() {
            questionId++;
            const container = document.getElementById('questions-container');
            const newQuestion = document.createElement('div');
            newQuestion.className = 'question-group';
            newQuestion.innerHTML = `
                <h3>Question ${questionId}</h3>
                <input type="text" class="question-text" placeholder="Question" required>
                <select class="question-type" required onchange="toggleOptions(this)">
                    <option value="">Select Type</option>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="multiple-choice">Multiple Choice</option>
                </select>
                <div class="options-container" style="display: none;">
                    <h4>Options</h4>
                    <div class="option-group">
                        <input type="text" class="option-text" placeholder="Option 1" >
                    </div>
                    <button type="button" class="add-option" onclick="addOption(this)">Add Option</button>
                </div>
                <textarea class="question-explanation" placeholder="Question Explanation (optional)"></textarea>
                <textarea class="answer-explanation" placeholder="Answer Explanation (optional)"></textarea>
                <input type="text" class="correct-answer" placeholder="Correct Answer (optional)">
            `;
            container.appendChild(newQuestion);
        }

        // Hàm toggle options dựa trên type
        function toggleOptions(select) {
            const optionsContainer = select.parentElement.querySelector('.options-container');
            if (select.value === 'multiple-choice') {
                optionsContainer.style.display = 'block';
            } else {
                optionsContainer.style.display = 'none';
            }
        }

        // Hàm add dynamic option cho multiple-choice
        function addOption(button) {
            const optionsContainer = button.parentElement;
            const optionGroups = optionsContainer.querySelectorAll('.option-group');
            const newOption = document.createElement('div');
            newOption.className = 'option-group';
            newOption.innerHTML = `
                <input type="text" class="option-text" placeholder="Option ${optionGroups.length + 1}" >
            `;
            button.before(newOption);
        }