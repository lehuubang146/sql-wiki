document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('sidebar-toggle-btn') || document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuBtn && sidebar) {
        function toggleSidebar() {
            if (window.innerWidth <= 768) {
                // Mobile behavior
                sidebar.classList.toggle('open');
                if (overlay) {
                    if (sidebar.classList.contains('open')) {
                        overlay.style.display = 'block';
                        void overlay.offsetWidth; // Trigger reflow
                        overlay.classList.add('active');
                    } else {
                        overlay.classList.remove('active');
                        setTimeout(() => {
                            overlay.style.display = 'none';
                        }, 300);
                    }
                }
            } else {
                // Desktop behavior
                document.body.classList.toggle('desktop-sidebar-collapsed');
            }
        }

        menuBtn.addEventListener('click', toggleSidebar);
        if (overlay) overlay.addEventListener('click', toggleSidebar);
    }
});
