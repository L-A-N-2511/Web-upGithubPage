const API_URL = (typeof CONFIG !== 'undefined') ? `${CONFIG.API_BASE_URL}/posts` : "http://localhost:3000/api/posts";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMyPosts();
});

// 1. Kiểm tra đăng nhập
function checkAuth() {
    const token = localStorage.getItem('user_token');
    if (!token) {
        alert("Vui lòng đăng nhập để quản lý tin!");
        window.location.href = "dangnhap-dangky/login.html";
    }
}

// 2. Tải danh sách bài đăng của tôi
async function loadMyPosts() {
    const token = localStorage.getItem('user_token');
    const grid = document.getElementById('my-room-list');
    
    try {
        const res = await fetch(`${API_URL}/my-posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
            renderMyPosts(data.data);
        } else {
            grid.innerHTML = `<p class="empty-notify">Lỗi: ${data.message}</p>`;
        }
    } catch (error) {
        grid.innerHTML = `<p class="empty-notify">Lỗi kết nối server!</p>`;
    }
}

// 3. Hiển thị ra màn hình
function renderMyPosts(posts) {
    const grid = document.getElementById('my-room-list');
    grid.innerHTML = '';

    if (!posts || posts.length === 0) {
        grid.innerHTML = '<div class="empty-notify"><h3>Bạn chưa có tin đăng nào!</h3></div>';
        return;
    }

    posts.forEach(post => {
        const price = new Intl.NumberFormat('vi-VN').format(post.price);
        const imgSrc = post.image || 'https://via.placeholder.com/300';

        const html = `
            <div class="room-item" id="post-${post._id}">
                <div class="room-image">
                    <img src="${imgSrc}" alt="Ảnh">
                    <span class="price-tag">${price} đ/tháng</span>
                </div>
                <div class="room-info">
                    <h3 class="room-title">${post.title}</h3>
                    <div class="room-meta">
                        <span>📍 ${post.location_district}</span>
                    </div>
                    <button class="btn-delete" onclick="handleDelete('${post._id}')">
                        🗑️ Xóa bài viết
                    </button>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    });
}

// 4. Xử lý sự kiện Xóa
async function handleDelete(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) return;

    const token = localStorage.getItem('user_token');
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();

        if (res.ok) {
            alert("Đã xóa thành công!");
            document.getElementById(`post-${id}`).remove(); // Xóa trên giao diện luôn
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Lỗi kết nối!");
    }
}