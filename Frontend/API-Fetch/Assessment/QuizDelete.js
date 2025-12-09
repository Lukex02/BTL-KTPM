        // Hàm xử lý xóa quiz
        async function deleteQuiz(quizId) {
            if (!confirm('Are you sure wanna delete this quiz?')) {
                return;  // Hủy nếu không confirm
            }

            try {
                const result = await deleteQuizAPI(quizId);
                alert(result.message || 'Quiz deleted successfully!');  // Hiển thị message từ API
                fetchAndRenderQuizzes();  // Refresh danh sách quizzes
            } catch (error) {
                alert('Error deleting quiz: ' + error.message);
            }
        }