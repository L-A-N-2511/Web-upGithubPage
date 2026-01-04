/* ==========================================================
   TẬP TIN: home.js
   CHỨC NĂNG: Lấy dữ liệu từ Server và Tìm kiếm
   ========================================================== */

const API_URL = (typeof CONFIG !== 'undefined') ? `${CONFIG.API_BASE_URL}/posts` : "http://localhost:3000/api/posts";

document.addEventListener('DOMContentLoaded', function() {
    
    checkLoginStatus();
    loadSearchLocations();
    fetchPosts(); // Gọi hàm lấy tin mới

});

// 1. KIỂM TRA ĐĂNG NHẬP
function checkLoginStatus() {
    const navMenu = document.getElementById('nav-menu');
    const username = localStorage.getItem('current_username');
    const token = localStorage.getItem('user_token');

    if (token && username) {
        navMenu.innerHTML = `
            <li class="user-info"><span class="welcome-text">Xin chào, <b>${username}</b></span></li>
            <li><a href="#" id="btn-logout" class="btn-logout">Đăng xuất</a></li>
            <li><a href="dang-tin/dang-tin.html" class="btn-rent">Cho thuê</a></li>
        `;
        document.getElementById('btn-logout').addEventListener('click', (e) => {
            e.preventDefault(); // Chặn hành vi mặc định
            localStorage.removeItem('user_token');
            localStorage.removeItem('current_username');
            localStorage.removeItem('user_logged_in');
            window.location.reload();
        });
    }
}

// 2. API ĐỊA CHÍNH (ESGOO)
async function loadSearchLocations() {
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    if (!citySelect) return;

    try {
        const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
        const data = await res.json();
        if (data.error === 0) {
            data.data.forEach(city => citySelect.appendChild(new Option(city.full_name, city.id)));
        }
        citySelect.addEventListener('change', async function() {
            districtSelect.innerHTML = '<option value="">Tất cả Quận/Huyện</option>';
            if (!this.value) return;
            const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${this.value}.htm`);
            const data = await res.json();
            if (data.error === 0) data.data.forEach(d => districtSelect.appendChild(new Option(d.full_name, d.id)));
        });
        districtSelect.addEventListener('change', async function() {
            wardSelect.innerHTML = '<option value="">Tất cả Phường/Xã</option>';
            if (!this.value) return;
            const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${this.value}.htm`);
            const data = await res.json();
            if (data.error === 0) data.data.forEach(w => wardSelect.appendChild(new Option(w.full_name, w.id)));
        });
    } catch (e) { console.error(e); }
}

// 3. LẤY TIN TỪ SERVER (HÀM MỚI)
async function fetchPosts(filterQuery = "") {
    const roomGrid = document.getElementById('room-list');
    roomGrid.innerHTML = '<p style="text-align:center; width:100%">Đang tải dữ liệu...</p>';

    try {
        // Gọi API: URL + Query (ví dụ ?city=Hà Nội)
        const res = await fetch(`${API_URL}${filterQuery}`);
        const data = await res.json();

        if (res.ok) {
            renderPosts(data.data); // data.data là mảng bài đăng từ Server
        } else {
            roomGrid.innerHTML = '<p style="text-align:center; width:100%">Lỗi tải dữ liệu.</p>';
        }
    } catch (error) {
        console.error("Lỗi:", error);
        roomGrid.innerHTML = '<p style="text-align:center; width:100%">Không kết nối được Server.</p>';
    }
}

// 4. VẼ GIAO DIỆN
function renderPosts(posts) {
    const roomGrid = document.getElementById('room-list');
    roomGrid.innerHTML = '';

    if (!posts || posts.length === 0) {
        roomGrid.innerHTML = '<p style="text-align:center; width: 100%; grid-column: 1/-1; color: #666; margin-top: 20px;">Chưa có tin đăng nào phù hợp.</p>';
        return;
    }

    posts.forEach(post => {
        const price = new Intl.NumberFormat('vi-VN').format(post.price);
        // Kiểm tra ảnh, nếu không có dùng ảnh mặc định
        const imgSrc = (post.image && post.image.length > 100) ? post.image : 'https://via.placeholder.com/300x200?text=No+Image';

        const html = `
            <div class="room-item">
                <div class="room-image">
                    <img src="${imgSrc}" alt="Ảnh phòng trọ">
                    <span class="price-tag">${price} đ/tháng</span>
                </div>
                <div class="room-info">
                    <h3 class="room-title">${post.title}</h3>
                    <div class="room-meta">
                        <span>📐 ${post.area}m²</span>
                        <span>📍 ${post.location_district || ''}, ${post.location_city || ''}</span>
                    </div>
                    <button class="btn-detail" onclick="alert('Xem chi tiết: ${post.title}')">Xem chi tiết</button>
                </div>
            </div>
        `;
        roomGrid.insertAdjacentHTML('beforeend', html);
    });
}

// 5. XỬ LÝ NÚT TÌM KIẾM
const btnSearch = document.getElementById('btn-search-trigger');
if (btnSearch) {
    btnSearch.addEventListener('click', function() {
        const citySelect = document.getElementById('city');
        const districtSelect = document.getElementById('district');
        const wardSelect = document.getElementById('ward');

        // Lấy Text hiển thị (Vì Database lưu tên Tỉnh, không lưu ID)
        const sCity = citySelect.value ? citySelect.options[citySelect.selectedIndex].text : '';
        const sDist = districtSelect.value ? districtSelect.options[districtSelect.selectedIndex].text : '';
        const sWard = wardSelect.value ? wardSelect.options[wardSelect.selectedIndex].text : '';

        // Tạo Query String gửi lên Server
        let query = "?";
        if (sCity) query += `city=${encodeURIComponent(sCity)}&`;
        if (sDist) query += `district=${encodeURIComponent(sDist)}&`;
        if (sWard) query += `ward=${encodeURIComponent(sWard)}`;

        console.log("Đang tìm với query:", query);
        fetchPosts(query); // Gọi lại API với bộ lọc
    });
}