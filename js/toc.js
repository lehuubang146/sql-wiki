document.addEventListener('DOMContentLoaded', () => {
    const tocContainer = document.getElementById('toc-container');
    const mainContent = document.querySelector('.main-content');
    
    if (!tocContainer || !mainContent) return;

    // Ẩn TOC trên các trang công cụ (Sandbox, Thi thử, Xếp hình, Chat)
    const url = window.location.href;
    const isToolPage = url.includes('page=sandbox') || url.includes('sandbox.html') ||
                       url.includes('page=mock_exam') || url.includes('mock_exam.html') ||
                       url.includes('page=visual_builder') || url.includes('visual_builder.html') ||
                       url.includes('page=chat') || url.includes('chat.html');
                       
    if (isToolPage) {
        tocContainer.style.display = 'none';
        return;
    }

    // Lấy tất cả h2, h3 trong main-content (trừ h2 của search/error)
    const headings = mainContent.querySelectorAll('h2:not(.error-page h2), h3');
    if (headings.length === 0) {
        tocContainer.style.display = 'none';
        return; // Nếu trang không có heading nào thì ẩn và không render TOC
    }

    let tocHTML = '<div class="toc-header">Mục lục nội dung</div><ul class="toc-list">';
    const existingIds = new Set();
    
    headings.forEach((heading, index) => {
        // Tạo ID nếu thẻ heading chưa có
        if (!heading.id) {
            // Chuyển tiếng Việt có dấu thành không dấu làm ID
            let slug = heading.innerText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            if(!slug) slug = 'section-' + index;
            
            // Đảm bảo slug là duy nhất
            let uniqueSlug = slug;
            let counter = 2;
            while (existingIds.has(uniqueSlug) || document.getElementById(uniqueSlug)) {
                uniqueSlug = slug + '-' + counter;
                counter++;
            }
            slug = uniqueSlug;
            heading.id = slug;
        }
        
        existingIds.add(heading.id);

        const level = heading.tagName.toLowerCase() === 'h2' ? 1 : 2;
        tocHTML += `<li class="toc-level-${level}"><a href="#${heading.id}">${heading.innerText}</a></li>`;
    });

    tocHTML += '</ul>';
    tocContainer.innerHTML = tocHTML;

    // CSS Scrollspy - Làm sáng mục lục đang xem
    const tocLinks = tocContainer.querySelectorAll('a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        headings.forEach(heading => {
            const headingTop = heading.offsetTop - 150; // offset 150px từ top
            if (scrollY >= headingTop) {
                current = heading.getAttribute('id');
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current && current !== '') {
                link.classList.add('active');
            }
        });
    });
    
    // Trigger scroll 1 lần để active mục đầu tiên
    window.dispatchEvent(new Event('scroll'));
});
