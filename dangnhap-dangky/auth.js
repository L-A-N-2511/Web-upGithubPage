/* ==========================================================
   TẬP TIN: auth.js
   CHỨC NĂNG: Xử lý Đăng nhập, Đăng ký và Thông báo (Toast)
   ========================================================== */

// Lấy link API từ config.js
const API_BASE = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : "http://localhost:3000/api";
const AUTH_URL = `${API_BASE}/auth`;

// --- 1. MODULE THÔNG BÁO (TOAST) ---
let toastBox = document.getElementById('toast-box');
if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.id = 'toast-box';
    document.body.appendChild(toastBox);
}

function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    let icon = '';
    if (type === 'success') icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    else icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';

    toast.innerHTML = `<i>${icon}</i><div class="toast-msg">${message}</div>`;
    toastBox.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
}

// --- 2. XỬ LÝ ĐĂNG KÝ (GỌI API RENDER) ---
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPass = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPass) return showToast('Mật khẩu xác nhận không khớp!', 'error');

        try {
            showToast('Đang kết nối Server...', 'warning'); // Báo cho user biết đang chạy
            
            const res = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, phone, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Đăng ký thành công -> Lưu token
                localStorage.setItem('user_token', data.token);
                localStorage.setItem('current_username', data.username);
                
                showToast('Đăng ký thành công! Đang vào trang chủ...', 'success');
                setTimeout(() => { window.location.href = "../index.html"; }, 1500);
            } else {
                showToast(data.message || 'Đăng ký thất bại', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Lỗi kết nối Server Render!', 'error');
        }
    });
}

// --- 3. XỬ LÝ ĐĂNG NHẬP (GỌI API RENDER) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            showToast('Đang đăng nhập...', 'warning');

            const res = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('user_token', data.token);
                localStorage.setItem('current_username', data.username);
                localStorage.setItem('user_logged_in', 'true'); // Lưu cờ đăng nhập

                showToast('Đăng nhập thành công!', 'success');
                setTimeout(() => { window.location.href = "../index.html"; }, 1000);
            } else {
                showToast(data.message || 'Sai thông tin đăng nhập', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Lỗi kết nối Server Render!', 'error');
        }
    });
}