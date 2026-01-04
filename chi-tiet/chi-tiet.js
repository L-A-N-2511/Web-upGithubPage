document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. LẤY ID TỪ URL (Ví dụ: chi-tiet.html?id=12345)
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        alert("Bài đăng không tồn tại!");
        window.location.href = "../index.html";
        return;
    }

    // 2. LẤY API URL TỪ CONFIG
    // Lưu ý: Vì đang ở thư mục con nên phải dùng biến CONFIG toàn cục (đã nhúng ở HTML)
    const API_URL = (typeof CONFIG !== 'undefined') ? `${CONFIG.API_BASE_URL}/posts` : "http://localhost:3000/api/posts";

    try {
        // 3. GỌI API LẤY CHI TIẾT
        const res = await fetch(`${API_URL}/${postId}`);
        const data = await res.json();

        if (res.ok) {
            renderDetail(data.data);
        } else {
            document.querySelector('.detail-main').innerHTML = `<h3>Lỗi: ${data.message}</h3>`;
        }
    } catch (error) {
        console.error(error);
        document.querySelector('.detail-main').innerHTML = `<h3>Không thể kết nối đến Server!</h3>`;
    }
});

// HÀM HIỂN THỊ DỮ LIỆU
function renderDetail(post) {
    // 1. Tiêu đề & Thông tin cơ bản
    document.title = post.title; // Đổi tên tab trình duyệt
    document.getElementById('d-title').textContent = post.title;
    
    const price = new Intl.NumberFormat('vi-VN').format(post.price);
    document.getElementById('d-price').textContent = `${price} đ/tháng`;
    document.getElementById('d-area').textContent = `${post.area} m²`;
    document.getElementById('d-address').textContent = post.address;
    
    // Xử lý xuống dòng cho mô tả
    document.getElementById('d-desc').textContent = post.description || "Chưa có mô tả chi tiết.";

    // 2. Hình ảnh (Nếu không có thì dùng ảnh mặc định)
    const imgEl = document.getElementById('d-image');
    if (post.image && post.image.length > 50) {
        imgEl.src = post.image;
    } else {
        imgEl.src = "https://via.placeholder.com/600x400?text=No+Image";
    }

    // 3. Thông tin người liên hệ (User)
    if (post.user) {
        document.getElementById('d-username').textContent = post.user.username || "Ẩn danh";
        
        // SĐT
        const phone = post.user.phone || "09xxxxxxxxx";
        document.getElementById('d-phone').textContent = phone;
        
        // Gán link gọi điện
        document.getElementById('btn-call').href = `tel:${phone}`;
        
        // Gán link Zalo (https://zalo.me/sdt)
        const btnZalo = document.getElementById('btn-zalo');
        if (post.user.phone) {
            btnZalo.href = `https://zalo.me/${post.user.phone}`;
        } else {
            btnZalo.style.display = 'none'; // Ẩn nút Zalo nếu không có sđt
        }
    }
}