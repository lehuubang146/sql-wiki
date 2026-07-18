/**
 * Progress Tracking & Gamification System
 */

const TOTAL_LESSONS = 10; // Số lượng bài học dự kiến (queries, procedures, triggers, v.v.)
const STORAGE_KEY = 'sql_wiki_progress';

// Lấy danh sách các bài đã hoàn thành
function getCompletedLessons() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// Lưu/Hủy lưu bài đã hoàn thành
function markComplete(lessonId, btnElement) {
    let completed = getCompletedLessons();
    const isCompleted = completed.includes(lessonId);

    if (!isCompleted) {
        completed.push(lessonId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
        
        // Đổi trạng thái nút thành "Đã hoàn thành"
        if (btnElement) {
            btnElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ✅ Đã hoàn thành (Bấm để hủy)';
            btnElement.classList.add('completed');
            btnElement.style.background = 'rgba(16, 185, 129, 0.2)';
            btnElement.style.color = '#10b981';
            btnElement.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        }
    } else {
        // Bỏ đánh dấu hoàn thành
        completed = completed.filter(id => id !== lessonId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
        
        // Trả lại trạng thái ban đầu
        if (btnElement) {
            btnElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Đánh dấu Hoàn thành';
            btnElement.classList.remove('completed');
            btnElement.style.background = '';
            btnElement.style.color = '';
            btnElement.style.borderColor = '';
        }
    }
    
    // Cập nhật progress bar toàn cục nếu có
    updateProgressBar();
    
    // Chúc mừng nếu 100%
    if (completed.length >= TOTAL_LESSONS && !isCompleted) {
        showConfetti();
    }
}

// Cập nhật thanh tiến trình
function updateProgressBar() {
    const completed = getCompletedLessons();
    let percentage = Math.min(100, Math.round((completed.length / TOTAL_LESSONS) * 100));
    
    const fillElements = document.querySelectorAll('.progress-bar-fill');
    const textElements = document.querySelectorAll('.progress-text');
    
    fillElements.forEach(el => {
        el.style.width = percentage + '%';
    });
    
    textElements.forEach(el => {
        el.innerText = percentage + '%';
    });

    const badgeEl = document.getElementById('user-badge');
    if (badgeEl) {
        if (percentage < 30) badgeEl.innerText = "Tân binh SQL";
        else if (percentage < 70) badgeEl.innerText = "Thợ săn Database";
        else if (percentage < 100) badgeEl.innerText = "Chuyên gia Truy vấn";
        else badgeEl.innerText = "🏆 Master SQL";
    }
}

// Hiển thị hiệu ứng chúc mừng đơn giản
function showConfetti() {
    // Nếu có thư viện canvas-confetti thì chạy, ở đây tạo hiệu ứng CSS đơn giản
    alert("🎉 CHÚC MỪNG! Bạn đã hoàn thành 100% khoá học SQL Server! Chúc bạn đạt điểm cao trong kỳ thi sắp tới!");
}

// Khởi tạo UI khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    updateProgressBar();
    
    // Tự động vô hiệu hoá nút hoàn thành nếu bài này đã học
    const currentPageId = document.body.dataset.pageId;
    if (currentPageId) {
        const completed = getCompletedLessons();
        if (completed.includes(currentPageId)) {
            const btn = document.getElementById('mark-complete-btn');
            if (btn) {
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ✅ Đã hoàn thành (Bấm để hủy)';
                btn.classList.add('completed');
                btn.style.background = 'rgba(16, 185, 129, 0.2)';
                btn.style.color = '#10b981';
                btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            }
        }
    }
});
