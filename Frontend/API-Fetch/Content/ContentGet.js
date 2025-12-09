
// @ts-nocheck
window.CONTENT_API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : "http://localhost:3000";
window.allContents = [];


async function loadContents(filters = {}) {
    const gridContainer = document.querySelector('.resource-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải tài liệu...</p></div>';

    try {
        const url = new URL(`${window.CONTENT_API_URL}/content/get`);
        if (filters.tag) url.searchParams.append('tag', filters.tag);
        
        const response = await authFetch(url.toString(), { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch content');
        const data = await response.json();
        
        window.allContents = Array.isArray(data) ? data : (data.content || data.result || []);
        renderContentGrid();
    } catch (error) {
        console.error('Content Load Error:', error);
        gridContainer.innerHTML = '<div style="color:red;text-align:center; grid-column:1/-1;">Lỗi tải dữ liệu.</div>';
    }
}


function renderContentGrid() {
    const gridContainer = document.querySelector('.resource-grid');
    if (!gridContainer) return;

    if (window.allContents.length === 0) {
        gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center; color:#666;">Chưa có tài liệu nào.</div>';
        return;
    }

    gridContainer.innerHTML = window.allContents.map(item => {

        const fileType = (item.type || 'file').toLowerCase();
        let iconClass = 'fas fa-file-alt'; 
        let colorClass = 'doc';          

        if (fileType.includes('pdf')) { 
            iconClass = 'fas fa-file-pdf'; 
            colorClass = 'pdf';
        } else if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) { 
            iconClass = 'fas fa-image'; 
            colorClass = 'img'; 
        } else if (fileType.includes('video') || fileType.includes('mp4')) { 
            iconClass = 'fas fa-video'; 
            colorClass = 'vid'; 
        }

        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Mới';

        return `
            <div class="res-card">
                <div class="res-icon ${colorClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="res-info">
                    <h4 title="${item.name}">${item.name || 'Không tên'}</h4>
                    <p>${dateStr} ${item.tag && item.tag.length ? `• <span class="tag-badge">${item.tag}</span>` : ''}</p>
                </div>
                <div class="res-actions">
                    <button class="btn-icon-small view" onclick="openViewModal('${item.id}')" title="Xem">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon-small edit" onclick="openEditContentModal('${item.id}')" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-small delete" onclick="deleteContent('${item.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


window.openViewModal = function(id) {
    const item = window.allContents.find(c => String(c.id) === String(id));
    if (!item) return;

    const nameEl = document.getElementById('view-name');
    const typeEl = document.getElementById('view-type');
    const bodyEl = document.getElementById('view-body');
    const publicEl = document.getElementById('view-public');
    const tagsEl = document.getElementById('view-tags');

    if(nameEl) nameEl.innerText = item.name || 'No Name';
    if(typeEl) typeEl.innerText = (item.type || 'Generic').toUpperCase();
    if(bodyEl) bodyEl.innerText = item.content || 'No content description.';
    
    if(publicEl) {
        publicEl.innerHTML = item.isPublic 
            ? '<i class="fas fa-globe" style="color:green"></i> Public' 
            : '<i class="fas fa-lock" style="color:red"></i> Private';
    }

    if (tagsEl) {
        if (item.tag && Array.isArray(item.tag) && item.tag.length > 0) {
            tagsEl.innerHTML = item.tag.map(t => `<span class="tag-pill">#${t}</span>`).join(' ');
        } else {
            tagsEl.innerHTML = '<span style="color:#999; font-style:italic">No tags</span>';
        }
    }

    const modal = document.getElementById('view-content-modal');
    if(modal) modal.classList.add('show');
}

window.hideViewContentModal = function() {
    const modal = document.getElementById('view-content-modal');
    if(modal) modal.classList.remove('show');
}

// 4. ROUTER CHO FORM
document.addEventListener('DOMContentLoaded', () => {
    const contentForm = document.getElementById('upload-content-form');
    if (contentForm) {
        const newForm = contentForm.cloneNode(true);
        contentForm.parentNode.replaceChild(newForm, contentForm);
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('content-id-hidden').value;
            if (id) {
                if (window.handleUpdateSubmit) await window.handleUpdateSubmit(e);
            } else {
                if (window.handleCreateSubmit) await window.handleCreateSubmit(e);
            }
        });
    }
    loadContents();
});

function hideUploadContentModal() {
    const modal = document.getElementById('upload-content-modal');
    if (modal) {
        modal.classList.remove('show');
        
        const form = document.getElementById('upload-content-form');
        if(form) form.reset();
        document.getElementById('content-id-hidden').value = ""; 
    }
}


window.hideUploadContentModal = hideUploadContentModal;
window.loadContents = loadContents;