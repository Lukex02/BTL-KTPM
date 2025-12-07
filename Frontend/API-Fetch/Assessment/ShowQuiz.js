async function fetchAndRenderQuizzes() {
    const grid = document.getElementById('quiz-manager-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    const userId = localStorage.getItem('userId');
    if (!userId) {
        grid.innerHTML = '<p>Error: Please login to view quizzes.</p>';
        return;
    }

    try {
        let quizSummaries = await getQuizzesByUserIdAPI(userId);
        if (quizSummaries && quizSummaries.length > 0) {
            // Fetch full details cho mỗi quiz để lấy assignee
            const quizzes = await Promise.all(quizSummaries.map(async (summary) => {
                try {
                    return await getQuizByIdAPI(summary.id);
                } catch (err) {
                    console.error(`Error fetching details for quiz ${summary.id}:`, err);
                    return { ...summary, assignee: [] };  // Fallback nếu lỗi
                }
            }));

            grid.innerHTML = quizzes.map(quiz => `
                <div class="quiz-manage-card">
                    <div class="q-info">
                        <h4>${quiz.title}</h4>
                        <p>${quiz.description}</p>
                        <p>Assigned to: ${quiz.assignee && quiz.assignee.length > 0 ? quiz.assignee.map(a => a.username).join(', ') : 'None'}</p>
                    </div>
                    <button class="btn-outline" onclick="editQuiz('${quiz.id}')">Edit</button>
                    <button type="button" class="btn-outlines" onclick="deleteQuiz('${quiz.id}')">Delete</button>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<p>No quizzes found.</p>';
        }
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        grid.innerHTML = '<p>Error loading quizzes. Please try again later.</p>';
    }
}