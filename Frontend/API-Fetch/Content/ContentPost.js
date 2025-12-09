// @ts-nocheck

function showUploadContentModal() {
    document.getElementById('upload-content-form').reset();
    document.getElementById('content-id-hidden').value = ""; 
    document.querySelector('#upload-content-modal h3').textContent = "Create New Content";
    const btn = document.querySelector('#upload-content-form button[type="submit"]');
    if(btn) btn.textContent = "Save Content";
    document.getElementById('upload-content-modal').classList.add('show');
}


window.handleCreateSubmit = async function(e) {
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const msgEl = document.getElementById('content-message');

    btnSubmit.disabled = true; 
    btnSubmit.textContent = "Creating...";
    if(msgEl) msgEl.style.display = 'none';

    const name = document.getElementById('content-name').value;
    const type = document.getElementById('content-type').value;
    const content = document.getElementById('content-body').value;
    const isPublic = document.getElementById('content-public').checked;
    const tagsInput = document.getElementById('content-tags').value;
    const tagArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== "");

    try {
        const url = `${window.CONTENT_API_URL}/content/upload`;
        const response = await authFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, tag: tagArray, isPublic, content })
        });

        if (response.ok) {
            if(msgEl) { msgEl.textContent = "Tạo mới thành công!"; msgEl.style.display = "block"; msgEl.style.color = "green"; }
            window.loadContents(); 
            setTimeout(() => {
                document.getElementById('upload-content-modal').classList.remove('show');
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Save Content";
            }, 1000);
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        console.error("Create Error:", error);
        if(msgEl) { msgEl.textContent = "Lỗi: " + error.message; msgEl.style.display = "block"; msgEl.style.color = "red"; }
        btnSubmit.disabled = false;
    }
};

window.showUploadContentModal = showUploadContentModal;