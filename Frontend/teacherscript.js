function switchTab(btn, id) {
            // Active button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            if(btn) btn.classList.add('active');

            // Show content
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            document.getElementById(id + '-content').classList.add('active');
            if (id === 'my-students-content') {
                loadMyStudents();
            }
            // Nếu là tab Quiz Manager, fetch quizzes
            if (id === 'create-quiz') {
                fetchAndRenderQuizzes();
            }
            if (id === 'inst-settings') {
                loadProfileData();
            }
        }


        // 3. HÀM CHUYỂN TAB KHI BẤM "SEE MORE"
        function goToMyStudentsTab() {
            // Tìm nút tab "My Students" trên sidebar
            // (Selector tìm thẻ a có chứa onclick chứa chữ 'my-students')
            const myStudentBtn = document.querySelector('.sidebar a[onclick*="my-students"]');
            
            if (myStudentBtn) {
                // Kích hoạt sự kiện click vào nút đó -> Nó sẽ tự gọi hàm switchTab
                myStudentBtn.click();
            }
        }
        
        function showMessage(elementId, message, type) {
            const el = document.getElementById(elementId);
            if (!el) return;
            el.textContent = message;
            el.className = `message-box ${type}`;
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 3000);
        }

        // Gọi fetch quizzes khi load page nếu tab Quiz đang active (optional)
        if (document.querySelector('#create-quiz-content').classList.contains('active')) {
            fetchAndRenderQuizzes();
        }
    document.addEventListener('DOMContentLoaded', function() {
    // Load students cho preview trên dashboard luôn
    loadMyStudents();
    loadUserGreeting();
    // Nếu đang ở tab quiz thì load quiz
    if (document.getElementById('create-quiz-content').classList.contains('active')) {
        fetchAndRenderQuizzes();
    }
});
setInterval(async () => {

    await refreshAccessToken();  // Refresh mỗi 14 phút

}, 14 * 60 * 1000);