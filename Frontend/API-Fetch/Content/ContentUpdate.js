// @ts-nocheck

function openEditContentModal(id) {

    const item = window.allContents.find(c => String(c.id) === String(id));
    if (!item) return;

    document.getElementById('upload-content-form').reset();
    document.getElementById('content-id-hidden').value = item.id;
    document.getElementById('content-name').value = item.name || '';
    document.getElementById('content-type').value = item.type || 'article';
    document.getElementById('content-body').value = item.content || '';
    document.getElementById('content-public').checked = item.isPublic === true;
    document.getElementById('content-tags').value = Array.isArray(item.tag) ? item.tag.join(', ') : (item.tag || '');

    document.querySelector('#upload-content-modal h3').textContent = "Update Content";
    document.querySelector('#upload-content-form button[type="submit"]').textContent = "Update Changes";
    document.getElementById('upload-content-modal').classList.add('show');
}


window.handleUpdateSubmit = async function(e) {
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const msgEl = document.getElementById('content-message');
    const contentId = document.getElementById('content-id-hidden').value;

    btnSubmit.disabled = true; 
    btnSubmit.textContent = "Updating...";
    if(msgEl) msgEl.style.display = 'none';

    const name = document.getElementById('content-name').value;
    const type = document.getElementById('content-type').value;
    const content = document.getElementById('content-body').value;
    const isPublic = document.getElementById('content-public').checked;
    const tagArray = document.getElementById('content-tags').value.split(',').map(t => t.trim()).filter(t => t !== "");

    try {
        const url = `${window.CONTENT_API_URL}/content/update/${contentId}`;
        const response = await authFetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, tag: tagArray, isPublic, content })
        });

        if (response.ok) {
            if(msgEl) { msgEl.textContent = "Cập nhật thành công!"; msgEl.style.display = "block"; msgEl.style.color = "green"; }
            window.loadContents(); 
            setTimeout(() => {
                document.getElementById('upload-content-modal').classList.remove('show');
                btnSubmit.disabled = false;
            }, 1000);
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        if(msgEl) { msgEl.textContent = "Lỗi: " + error.message; msgEl.style.display = "block"; msgEl.style.color = "red"; }
        btnSubmit.disabled = false;
    }
};

window.openEditContentModal = openEditContentModal;