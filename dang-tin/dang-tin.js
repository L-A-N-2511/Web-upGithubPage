/* ==========================================================
   TẬP TIN: dang-tin.js
   CHỨC NĂNG: Gửi tin đăng lên Backend (Cần Token)
   ========================================================== */

const API_URL = (typeof CONFIG !== 'undefined') ? `${CONFIG.API_BASE_URL}/posts` : "http://localhost:3000/api/posts";

document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    setupImagePreview();
    setupLocationAPI();
    handleFormSubmit();
});

// 1. KIỂM TRA QUYỀN
function checkAuth() {
    const token = localStorage.getItem('user_token');
    if (!token) {
        alert("Bạn cần đăng nhập để đăng tin!");
        window.location.href = "../dangnhap-dangky/login.html";
    }
}

// 2. XEM TRƯỚC ẢNH
function setupImagePreview() {
    const fileInput = document.getElementById('real-file-input');
    const previewContainer = document.getElementById('image-preview-container');

    if (fileInput) {
        fileInput.addEventListener('change', function (event) {
            previewContainer.innerHTML = "";
            const files = event.target.files;
            if (files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('preview-img');
                    previewContainer.appendChild(img);
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// 3. API ĐỊA CHÍNH (ESGOO)
async function setupLocationAPI() {
    const citySelect = document.getElementById('post-city');
    const districtSelect = document.getElementById('post-district');
    const wardSelect = document.getElementById('post-ward');

    if (!citySelect) return;

    try {
        const res = await fetch('https://esgoo.net/api-tinhthanh/1/0.htm');
        const data = await res.json();
        if (data.error === 0) {
            data.data.forEach(city => citySelect.appendChild(new Option(city.full_name, city.id)));
        }
        citySelect.addEventListener('change', async function () {
            districtSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';
            if (!this.value) return;
            const res = await fetch(`https://esgoo.net/api-tinhthanh/2/${this.value}.htm`);
            const data = await res.json();
            if (data.error === 0) data.data.forEach(d => districtSelect.appendChild(new Option(d.full_name, d.id)));
        });
        districtSelect.addEventListener('change', async function () {
            wardSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
            if (!this.value) return;
            const res = await fetch(`https://esgoo.net/api-tinhthanh/3/${this.value}.htm`);
            const data = await res.json();
            if (data.error === 0) data.data.forEach(w => wardSelect.appendChild(new Option(w.full_name, w.id)));
        });
    } catch (e) { console.error(e); }
}

// 4. GỬI TIN LÊN SERVER (SỬA ĐOẠN NÀY)
function handleFormSubmit() {
    const postForm = document.querySelector('.form-content');

    if (postForm) {
        postForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Lấy dữ liệu
            const title = document.getElementById('title').value;
            const price = document.getElementById('price').value;
            const area = document.getElementById('area').value;
            const street = document.getElementById('post-street').value;
            const desc = document.getElementById('description').value;

            const citySel = document.getElementById('post-city');
            const distSel = document.getElementById('post-district');
            const wardSel = document.getElementById('post-ward');

            if (!citySel.value || !distSel.value || !wardSel.value) {
                alert("Vui lòng chọn đầy đủ địa chỉ!"); return;
            }

            const city = citySel.options[citySel.selectedIndex].text;
            const district = distSel.options[distSel.selectedIndex].text;
            const ward = wardSel.options[wardSel.selectedIndex].text;
            const fullAddress = `${street}, ${ward}, ${district}, ${city}`;

            const previewImg = document.querySelector('.preview-img');
            const imageSrc = previewImg ? previewImg.src : '';

            // Chuẩn bị dữ liệu
            const postData = {
                title, price: Number(price), area: Number(area),
                description: desc, address: fullAddress,
                location_city: city, location_district: district, location_ward: ward,
                image: imageSrc
            };

            const token = localStorage.getItem('user_token');

            try {
                // --- GỌI API THAY VÌ LƯU LOCALSTORAGE ---
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(postData)
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Đăng tin thành công lên Server!');
                    window.location.href = "../index.html";
                } else {
                    alert('Lỗi: ' + (data.message || 'Không thể đăng tin'));
                }
            } catch (error) {
                console.error(error);
                alert('Lỗi kết nối Server!');
            }
        });
    }
}