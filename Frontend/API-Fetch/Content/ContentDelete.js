// @ts-nocheck
async function deleteContent(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này không? Hành động này không thể hoàn tác.")) return;

    try {
        const response = await authFetch(`${window.CONTENT_API_URL}/content/delete/${id}`, { 
            method: 'DELETE' 
        });

        if (response.ok) {
            alert("Đã xóa tài liệu thành công!");
            window.loadContents(); 
        } else {
            const errText = await response.text();
            alert("Lỗi khi xóa: " + errText);
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Lỗi kết nối server.");
    }
}

window.deleteContent = deleteContent;