document.addEventListener('DOMContentLoaded', () => {
    // 1. Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + A: Toggle AI Chat
        if (e.altKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            const aiBtn = document.getElementById('ai-chat-toggle');
            if (aiBtn) aiBtn.click();
        }
        
        // Navigation: Arrow Left/Right to go to Prev/Next link in sidebar
        // Note: Don't trigger if user is typing in an input or textarea
        const activeTag = document.activeElement.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const currentActive = document.querySelector('.sidebar-nav a.active');
            if (currentActive) {
                const links = Array.from(document.querySelectorAll('.sidebar-nav a'));
                const currentIndex = links.indexOf(currentActive);
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    window.location.href = links[currentIndex - 1].href;
                } else if (e.key === 'ArrowRight' && currentIndex < links.length - 1) {
                    window.location.href = links[currentIndex + 1].href;
                }
            }
        }
    });

    // 2. Progress Tracking
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get('page') || 'home';
    
    // Load completed pages
    let completedPages = JSON.parse(localStorage.getItem('completed_pages') || '[]');
    
    // Render checkmarks in sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        const pageMatch = href.match(/page=([^&]+)/);
        if (pageMatch) {
            const pageName = pageMatch[1];
            if (completedPages.includes(pageName)) {
                // Add checkmark icon
                const checkIcon = document.createElement('span');
                checkIcon.innerHTML = ' <svg style="display:inline-block; vertical-align:middle; color:#10b981;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                link.appendChild(checkIcon);
            }
        }
    });

    // Mark as complete button logic
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn) {
        // If already completed, update button UI
        if (completedPages.includes(currentPage)) {
            markCompleteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã hoàn thành';
            markCompleteBtn.classList.add('completed');
        }

        markCompleteBtn.addEventListener('click', () => {
            if (!completedPages.includes(currentPage)) {
                completedPages.push(currentPage);
                localStorage.setItem('completed_pages', JSON.stringify(completedPages));
                markCompleteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã hoàn thành';
                markCompleteBtn.classList.add('completed');
                
                // Reload to show checkmark in sidebar (or we could just inject it dynamically)
                window.location.reload();
            } else {
                // Optional: Allow un-marking
                completedPages = completedPages.filter(p => p !== currentPage);
                localStorage.setItem('completed_pages', JSON.stringify(completedPages));
                markCompleteBtn.innerHTML = 'Đánh dấu hoàn thành bài học';
                markCompleteBtn.classList.remove('completed');
                window.location.reload();
            }
        });
    }
});
