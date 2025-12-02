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
function renderContentGrid() {
    const gridContainer = document.querySelector('.resource-grid');
    if (!gridContainer) return;

    if (allContents.length === 0) {
        gridContainer.innerHTML = '<div style="grid-column:1/-1;text-align:center; color:#666;">Chưa có tài liệu nào.</div>';
        return;
    }

    gridContainer.innerHTML = allContents.map(item => {
        // Xác định icon dựa trên loại file (nếu có trường type hoặc đuôi file)
        // Giả sử item.type hoặc item.name có chứa đuôi file
        const fileType = item.type || (item.name ? item.name.split('.').pop() : 'file');
        let iconClass = 'fas fa-file';
        let iconColorClass = 'doc'; // class CSS màu sắc

        if (fileType.includes('pdf')) { iconClass = 'fas fa-file-pdf'; iconColorClass = 'pdf'; }
        else if (fileType.includes('word') || fileType.includes('doc')) { iconClass = 'fas fa-file-word'; iconColorClass = 'doc'; }
        else if (fileType.includes('excel') || fileType.includes('sheet')) { iconClass = 'fas fa-file-excel'; iconColorClass = 'xls'; }
        else if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) { iconClass = 'fas fa-image'; iconColorClass = 'fig'; }
        else if (fileType.includes('video') || fileType.includes('mp4')) { iconClass = 'fas fa-video'; iconColorClass = 'fig'; }

        // Format ngày tháng
        const dateStr = item.createdAt || item.updatedAt || new Date().toISOString();
        const formattedDate = new Date(dateStr).toLocaleDateString('vi-VN');

        // Size giả lập nếu API không có
        const size = item.size ? item.size : 'Unknown size';

        return `
            <div class="res-card">
                <div class="res-icon ${iconColorClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="res-info">
                    <h4 title="${item.name}">${item.name || 'Untitled Resource'}</h4>
                    <p>
                        ${size} • ${formattedDate} 
                        ${item.tag ? `• <span style="background:#eee; padding:2px 6px; border-radius:4px; font-size:0.7em;">${item.tag}</span>` : ''}
                    </p>
                </div>
                <div class="res-actions">
                    <button class="btn-icon-small" onclick="viewContent('${item.id}', '${item.content || '#'}')" title="View/Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon-small delete-btn" onclick="deleteContent('${item.id}')" title="Delete" style="color: #e74c3c;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
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

/**
 * 4. DELETE CONTENT (Placeholder cho chức năng xóa)
 */
async function deleteContent(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này không?")) return;

    // TODO: Gọi API xóa thực tế (nếu có)
    // const res = await authFetch(`${CONTENT_API_URL}/content/delete/${id}`, { method: 'DELETE' });
    
    alert("Chức năng xóa đang được phát triển (API chưa cung cấp).");
    
    // Giả lập xóa trên giao diện
    // allContents = allContents.filter(item => item.id !== id);
    // renderContentGrid();
}

// Hàm khởi tạo để gọi từ HTML
function initContentManager() {
    loadContents();
}

// Expose functions globally
window.loadContents = loadContents;
window.initContentManager = initContentManager;
window.deleteContent = deleteContent;