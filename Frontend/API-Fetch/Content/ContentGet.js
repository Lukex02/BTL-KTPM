// @ts-nocheck
/* =========================================
   CONTENT MANAGER: FETCH & RENDER RESOURCES
   API: /content/get (Params: tag, type, fromDate, toDate)
   ========================================= */

// Đảm bảo URL này khớp với biến toàn cục hoặc import từ auth.js
// Nếu đã có biến toàn cục API_BASE_URL thì dùng luôn
const CONTENT_API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : "http://localhost:3000";

// STATE
let allContents = [];

/**
 * 1. LOAD DATA: Lấy danh sách Content (Có thể lọc)
 * @param {Object} filters - Các tham số lọc: { tag, type, fromDate, toDate }
 */
async function loadContents(filters = {}) {
    const gridContainer = document.querySelector('.resource-grid');
    if (!gridContainer) return;

    // Loading UI
    gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải tài liệu...</p></div>';

    try {
        // Xây dựng URL với Query Params
        const url = new URL(`${CONTENT_API_URL}/content/get`);
        if (filters.tag) url.searchParams.append('tag', filters.tag);
        if (filters.type) url.searchParams.append('type', filters.type);
        if (filters.fromDate) url.searchParams.append('fromDate', filters.fromDate);
        if (filters.toDate) url.searchParams.append('toDate', filters.toDate);

        console.log("Fetching Content URL:", url.toString());

        const response = await authFetch(url.toString(), {
            method: 'GET'
        });

        if (!response.ok) throw new Error('Failed to fetch content');

        const data = await response.json();
        
        // Kiểm tra dữ liệu trả về
        if (Array.isArray(data)) {
            allContents = data;
        } else if (data && typeof data === 'object') {
            // Trường hợp API trả về object có chứa mảng (ví dụ data.content hoặc data.result)
            allContents = data.content || data.result || [data]; 
        } else {
            allContents = [];
        }

        renderContentGrid();

    } catch (error) {
        console.error('Content Load Error:', error);
        gridContainer.innerHTML = '<div style="color:red;text-align:center; grid-column:1/-1;">Lỗi tải dữ liệu tài nguyên.</div>';
    }
}

/**
 * 2. RENDER GRID: Hiển thị danh sách tài nguyên
 */
// TÌM VÀ THAY THẾ TOÀN BỘ HÀM renderContentGrid BẰNG ĐOẠN NÀY
function renderContentGrid() {
    const gridContainer = document.querySelector('.resource-grid');
    if (!gridContainer) return;

    if (allContents.length === 0) {
        gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center; color:#666;">Chưa có tài liệu nào.</div>';
        return;
    }

    gridContainer.innerHTML = allContents.map(item => {
        const fileType = item.type || 'file';
        let iconClass = 'fas fa-file';
        let iconColorClass = 'doc';

        if (fileType.includes('pdf')) { iconClass = 'fas fa-file-pdf'; iconColorClass = 'pdf'; }
        else if (fileType.includes('image')) { iconClass = 'fas fa-image'; iconColorClass = 'fig'; }
        else if (fileType.includes('video')) { iconClass = 'fas fa-video'; iconColorClass = 'fig'; }

        const dateStr = item.createdAt || new Date().toISOString();
        const formattedDate = new Date(dateStr).toLocaleDateString('vi-VN');

        return `
            <div class="res-card">
                <div class="res-icon ${iconColorClass}"><i class="${iconClass}"></i></div>
                <div class="res-info">
                    <h4 title="${item.name}">${item.name || 'Untitled'}</h4>
                    <p>${formattedDate} ${item.tag && item.tag.length ? `• <span class="tag-badge">${item.tag}</span>` : ''}</p>
                </div>
                <div class="res-actions">
                    <button class="btn-icon-small" onclick="openViewModal('${item.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    <button class="btn-icon-small" onclick="openEditContentModal('${item.id}')" title="Edit" style="color: #f59e0b;">
                        <i class="fas fa-edit"></i>
                    </button>

                    <button class="btn-icon-small delete-btn" onclick="deleteContent('${item.id}')" title="Delete" style="color: #e74c3c;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openEditContentModal(id) {
    // 1. Tìm content trong danh sách đã tải về
    const contentItem = allContents.find(c => String(c.id) === String(id));
    if (!contentItem) return;

    // 2. Điền dữ liệu vào Form
    document.getElementById('content-id-hidden').value = contentItem.id; // Gán ID vào input ẩn
    document.getElementById('content-name').value = contentItem.name || '';
    document.getElementById('content-type').value = contentItem.type || 'article';
    document.getElementById('content-body').value = contentItem.content || '';
    
    // Xử lý Tags (Mảng -> Chuỗi ngăn cách dấu phẩy)
    // API trả về mảng ["A", "B"], ta cần hiển thị "A, B"
    if (Array.isArray(contentItem.tag)) {
        document.getElementById('content-tags').value = contentItem.tag.join(', ');
    } else {
        document.getElementById('content-tags').value = contentItem.tag || '';
    }

    // Xử lý Public Checkbox
    document.getElementById('content-public').checked = contentItem.isPublic === true;

    // 3. Đổi tiêu đề Modal và Nút bấm cho hợp ngữ cảnh
    document.querySelector('#upload-content-modal h3').textContent = "Update Content";
    document.querySelector('#upload-content-form button[type="submit"]').textContent = "Update Changes";

    // 4. Mở Modal
    document.getElementById('upload-content-modal').classList.add('show');
}

/* =========================================
   4. HANDLE FORM SUBMIT (CREATE & UPDATE)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const contentForm = document.getElementById('upload-content-form');
    
    if (contentForm) {
        // Gỡ bỏ sự kiện cũ (nếu có) để tránh bị gọi 2 lần
        const newForm = contentForm.cloneNode(true);
        contentForm.parentNode.replaceChild(newForm, contentForm);
        
        // Gán sự kiện submit mới
        newForm.addEventListener('submit', handleContentSubmit);
    }
});

async function handleContentSubmit(e) {
    e.preventDefault(); // Chặn reload trang

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const msgEl = document.getElementById('content-message'); // Đảm bảo bạn có thẻ div này trong modal để hiện thông báo
    const contentId = document.getElementById('content-id-hidden').value; // Lấy ID từ input ẩn

    // UI Loading
    if(btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Đang xử lý...";
    }
    if(msgEl) msgEl.style.display = 'none';

    // 1. Thu thập dữ liệu từ Form
    const name = document.getElementById('content-name').value;
    const type = document.getElementById('content-type').value;
    const content = document.getElementById('content-body').value;
    const isPublic = document.getElementById('content-public').checked;
    const tagsInput = document.getElementById('content-tags').value;
    
    // Xử lý Tag: "A, B" -> ["A", "B"]
    const tagArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== "");

    const payload = {
        name,
        type,
        tag: tagArray,
        isPublic,
        content
    };

    try {
        let url, method, successMsg;

        // 2. Quyết định gọi API nào (Dựa vào ID ẩn)
        if (contentId) {
            // === UPDATE MODE (PUT) ===
            // API: /content/update/{resourceId}
            url = `${CONTENT_API_URL}/content/update/${contentId}`;
            method = 'PUT';
            successMsg = "Cập nhật tài liệu thành công!";
        } else {
            // === CREATE MODE (POST) ===
            // API: /content/upload
            url = `${CONTENT_API_URL}/content/upload`;
            method = 'POST';
            successMsg = "Tạo tài liệu mới thành công!";
        }

        console.log(`Sending ${method} to ${url}`, payload);

        // 3. Gọi API
        const response = await authFetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Thông báo thành công
            if(msgEl) {
                msgEl.textContent = successMsg;
                msgEl.style.color = "green";
                msgEl.style.display = "block";
            }
            
            // Reload danh sách để thấy thay đổi ngay
            loadContents(); 

            // Đóng modal sau 1 giây
            setTimeout(() => {
                if(typeof hideUploadContentModal === 'function') hideUploadContentModal();
                // Reset form và nút bấm
                if(btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Lưu lại";
                }
            }, 1000);
        } else {
            const errText = await response.text();
            throw new Error(errText);
        }

    } catch (error) {
        console.error("Submit Error:", error);
        if(msgEl) {
            msgEl.textContent = "Lỗi: " + error.message;
            msgEl.style.color = "red";
            msgEl.style.display = "block";
        }
        if(btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Thử lại";
        }
    }
}

// Thêm đoạn này vào hàm showUploadContentModal của bạn
function showUploadContentModal() {
    // ... code hiện modal cũ ...
    
    // QUAN TRỌNG: Reset form và ID ẩn về rỗng để chuyển sang chế độ "Tạo mới"
    document.getElementById('upload-content-form').reset();
    document.getElementById('content-id-hidden').value = ""; 
    
    // Đổi lại tiêu đề
    document.querySelector('#upload-content-modal h3').textContent = "Create New Content";
    const btn = document.querySelector('#upload-content-form button[type="submit"]');
    if(btn) btn.textContent = "Save Content";
}

/**
 * 3. VIEW / DOWNLOAD CONTENT
 */
function viewContent(id, contentUrl) {
    if (contentUrl && contentUrl !== '#') {
        window.open(contentUrl, '_blank');
    } else {
        alert("Link tài liệu không khả dụng.");
    }
}

async function deleteContent(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này không? Hành động này không thể hoàn tác.")) return;

    try {
        // Gọi API DELETE theo đúng tài liệu
        const response = await authFetch(`http://localhost:3000/content/delete/${id}`, { 
            method: 'DELETE' 
        });

        if (response.ok) {
            alert("Đã xóa tài liệu thành công!");
            // Reload lại danh sách sau khi xóa
            loadContents();
        } else {
            const errText = await response.text();
            alert("Lỗi khi xóa: " + errText);
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Lỗi kết nối server.");
    }
}

// 1. Hàm Mở Modal Xem Chi Tiết
function openViewModal(id) {
    const item = allContents.find(c => String(c.id) === String(id));
    if (!item) return;

    document.getElementById('view-name').innerText = item.name || 'No Name';
    document.getElementById('view-type').innerText = (item.type || 'Generic').toUpperCase();
    document.getElementById('view-body').innerText = item.content || 'No description.';
    
    // Xử lý hiển thị Public/Private
    const publicEl = document.getElementById('view-public');
    if(item.isPublic) {
        publicEl.innerHTML = '<i class="fas fa-globe" style="color:green"></i> Public';
    } else {
        publicEl.innerHTML = '<i class="fas fa-lock" style="color:red"></i> Private';
    }

    // Xử lý Tags
    const tagsContainer = document.getElementById('view-tags');
    if (item.tag && Array.isArray(item.tag) && item.tag.length > 0) {
        tagsContainer.innerHTML = item.tag.map(t => 
            `<span style="background:#f3f4f6; padding:2px 8px; border-radius:10px; font-size:12px; border:1px solid #ddd;">#${t}</span>`
        ).join('');
    } else {
        tagsContainer.innerHTML = '<span style="color:#999; font-style:italic">No tags</span>';
    }

    document.getElementById('view-content-modal').classList.add('show');
}

function hideViewContentModal() {
    document.getElementById('view-content-modal').classList.remove('show');
}

// 2. Hàm Mở Modal Sửa (Cập nhật để điền ID ẩn)
function openEditContentModal(id) {
    const item = allContents.find(c => String(c.id) === String(id));
    if (!item) return;

    // Reset form trước
    document.getElementById('upload-content-form').reset();
    
    // QUAN TRỌNG: Gán ID vào input ẩn
    document.getElementById('content-id-hidden').value = item.id;
    
    // Điền dữ liệu cũ vào form
    document.getElementById('content-name').value = item.name || '';
    document.getElementById('content-type').value = item.type || 'article';
    document.getElementById('content-body').value = item.content || '';
    document.getElementById('content-public').checked = item.isPublic === true;
    
    if (Array.isArray(item.tag)) document.getElementById('content-tags').value = item.tag.join(', ');
    else document.getElementById('content-tags').value = item.tag || '';

    // Đổi tên nút bấm và tiêu đề
    document.querySelector('#upload-content-modal h3').textContent = "Update Content";
    document.querySelector('#upload-content-form button[type="submit"]').textContent = "Update Changes";
    
    document.getElementById('upload-content-modal').classList.add('show');
}

/* === LOGIC SUBMIT FORM (FIX LỖI UPDATE BIẾN MẤT) === */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-content-form');
    // Clone form để xóa các event listener cũ tránh bị lặp
    if (form) {
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', handleContentSubmit);
    }
});

async function handleContentSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const msgEl = document.getElementById('content-message');
    
    // Lấy ID từ input ẩn để biết là Sửa hay Tạo mới
    const contentId = document.getElementById('content-id-hidden').value;

    btn.disabled = true;
    btn.innerText = "Processing...";
    if(msgEl) msgEl.style.display = 'none';

    // Lấy dữ liệu form
    const tagsStr = document.getElementById('content-tags').value;
    const tagArray = tagsStr.split(',').map(t => t.trim()).filter(t => t !== "");

    const payload = {
        name: document.getElementById('content-name').value,
        type: document.getElementById('content-type').value,
        tag: tagArray,
        isPublic: document.getElementById('content-public').checked,
        content: document.getElementById('content-body').value
    };

    try {
        let url, method;

        if (contentId) {
            // UPDATE
            url = `${CONTENT_API_URL}/content/update/${contentId}`;
            method = 'PUT';
        } else {
            // CREATE
            url = `${CONTENT_API_URL}/content/upload`;
            method = 'POST';
        }

        const response = await authFetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            if(msgEl) {
                msgEl.innerText = "Thành công!";
                msgEl.style.color = "green"; 
                msgEl.style.display = "block";
            }
            
            // --- FIX LỖI Ở ĐÂY ---
            // Gọi loadContents({}) với object rỗng để XÓA BỘ LỌC CŨ
            // Điều này đảm bảo bài viết vừa sửa sẽ hiện ra, không bị ẩn đi do lệch filter
            await loadContents({}); 

            setTimeout(() => {
                // Đóng modal
                document.getElementById('upload-content-modal').classList.remove('show');
                btn.disabled = false;
                btn.innerText = "Save Content";
            }, 1000);
        } else {
            throw new Error(await response.text());
        }
    } catch (error) {
        console.error("Error:", error);
        if(msgEl) {
            msgEl.innerText = "Lỗi: " + error.message;
            msgEl.style.color = "red";
            msgEl.style.display = "block";
        }
        btn.disabled = false;
        btn.innerText = "Thử lại";
    }
}

// Hàm khởi tạo để gọi từ HTML
function initContentManager() {
    loadContents();
}

// Expose functions globally
window.loadContents = loadContents;
window.initContentManager = initContentManager;
window.deleteContent = deleteContent;