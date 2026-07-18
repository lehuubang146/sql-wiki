document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('erd-canvas');
    if (!canvas) return; // Only run on ERD page

    const svg = document.getElementById('erd-lines');
    const tables = document.querySelectorAll('.erd-table');

    // Define relationships (from -> to)
    const relationships = [
        { from: 'DMKHOA', to: 'DMNGANH' },
        { from: 'DMNGANH', to: 'DMLOP' },
        { from: 'DMNGANH', to: 'DMHOCPHAN' },
        { from: 'DMLOP', to: 'SINHVIEN' },
        { from: 'SINHVIEN', to: 'DIEMHP' },
        { from: 'DMHOCPHAN', to: 'DIEMHP' },
        { from: 'KHACHHANG', to: 'HOADON' },
        { from: 'HOADON', to: 'CHITIETHD' },
        { from: 'HANGHOA', to: 'CHITIETHD' }
    ];

    let paths = [];

    // Initialize SVG paths
    relationships.forEach(rel => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'erd-path');
        path.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(path);
        paths.push({ ...rel, path });
    });

    // Draw all lines
    const drawLines = () => {
        const canvasRect = canvas.getBoundingClientRect();
        
        let maxR = canvas.clientWidth;
        let maxB = canvas.clientHeight;

        tables.forEach(t => {
            if (t.style.display !== 'none') {
                const left = parseFloat(t.style.left) || 0;
                const top = parseFloat(t.style.top) || 0;
                const right = left + t.offsetWidth;
                const bottom = top + t.offsetHeight;
                if (right > maxR) maxR = right;
                if (bottom > maxB) maxB = bottom;
            }
        });

        paths.forEach(rel => {
            const el1 = document.getElementById(rel.from);
            const el2 = document.getElementById(rel.to);
            if (!el1 || !el2 || el1.style.display === 'none' || el2.style.display === 'none') {
                rel.path.style.display = 'none';
                return;
            }
            rel.path.style.display = '';

            // Since the tables and the SVG are inside the same zoomed container (erd-zoom-wrapper),
            // offsetLeft/Top perfectly maps to the SVG coordinate space and ignores transform scale!
            const c1 = {
                x: el1.offsetLeft + el1.offsetWidth / 2,
                y: el1.offsetTop + el1.offsetHeight / 2
            };
            const c2 = {
                x: el2.offsetLeft + el2.offsetWidth / 2,
                y: el2.offsetTop + el2.offsetHeight / 2
            };
            
            // For edge calculation, we also need width/height
            const r1 = { width: el1.offsetWidth, height: el1.offsetHeight };
            const r2 = { width: el2.offsetWidth, height: el2.offsetHeight };

            // Determine which edges to connect
            let p1 = { x: c1.x, y: c1.y };
            let p2 = { x: c2.x, y: c2.y };
            
            // Simple edge attachment logic
            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Connect Left-Right
                p1.x = dx > 0 ? c1.x + r1.width / 2 : c1.x - r1.width / 2;
                p2.x = dx > 0 ? c2.x - r2.width / 2 : c2.x + r2.width / 2;
            } else {
                // Connect Top-Bottom
                p1.y = dy > 0 ? c1.y + r1.height / 2 : c1.y - r1.height / 2;
                p2.y = dy > 0 ? c2.y - r2.height / 2 : c2.y + r2.height / 2;
            }

            // Smooth Bezier Curve
            let d = '';
            if (Math.abs(dx) > Math.abs(dy)) {
                const cx = (p1.x + p2.x) / 2;
                d = `M ${p1.x} ${p1.y} C ${cx} ${p1.y}, ${cx} ${p2.y}, ${p2.x} ${p2.y}`;
            } else {
                const cy = (p1.y + p2.y) / 2;
                d = `M ${p1.x} ${p1.y} C ${p1.x} ${cy}, ${p2.x} ${cy}, ${p2.x} ${p2.y}`;
            }

            rel.path.setAttribute('d', d);
        });

        // Apply dynamic sizing to wrapper to enable scrolling
        const layoutWrapper = document.getElementById('erd-layout-wrapper');
        const zoomWrapper = document.getElementById('erd-zoom-wrapper');
        if (layoutWrapper && zoomWrapper) {
            // Add padding so tables don't stick to the edge
            const paddedWidth = maxR + 100;
            const paddedHeight = maxB + 100;
            const scale = window.erdScale || 1;
            
            // Layout wrapper gets the physically scaled size so the scroll container works perfectly!
            layoutWrapper.style.width = (paddedWidth * scale) + 'px';
            layoutWrapper.style.height = (paddedHeight * scale) + 'px';
            
            // Zoom wrapper gets the unscaled size
            zoomWrapper.style.width = paddedWidth + 'px';
            zoomWrapper.style.height = paddedHeight + 'px';
            
            // Update SVG to match
            svg.style.width = paddedWidth + 'px';
            svg.style.height = paddedHeight + 'px';
        }
    };
    
    // Expose for tab switching
    window.erdDrawLines = drawLines;

    // Initial draw
    setTimeout(drawLines, 100);

    // Redraw on scroll to keep lines aligned (if needed)
    canvas.addEventListener('scroll', drawLines);
    window.addEventListener('resize', drawLines);

    window.erdScale = 1;

    // Draggable Logic
    let activeTable = null;
    let isPanning = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;
    let scrollStartX = 0, scrollStartY = 0;

    tables.forEach(table => {
        table.addEventListener('mousedown', (e) => {
            tables.forEach(t => t.style.zIndex = '10');
            table.style.zIndex = '20';
            
            activeTable = table;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseFloat(table.style.left) || 0;
            startTop = parseFloat(table.style.top) || 0;
            e.stopPropagation(); // Prevent panning
        });

        table.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) return; // ignore multi-touch
            
            tables.forEach(t => t.style.zIndex = '10');
            table.style.zIndex = '20';
            
            activeTable = table;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startLeft = parseFloat(table.style.left) || 0;
            startTop = parseFloat(table.style.top) || 0;
            
            e.stopPropagation(); // Prevent panning
            e.preventDefault();
        }, { passive: false });
    });

    // Canvas Panning (Mouse)
    canvas.addEventListener('mousedown', (e) => {
        if (e.target.closest('.erd-table') || e.target.closest('.erd-tabs') || e.target.closest('.erd-zoom-controls')) return;
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollStartX = canvas.scrollLeft;
        scrollStartY = canvas.scrollTop;
        canvas.style.cursor = 'grabbing';
    });

    // Canvas Panning (Touch)
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) return;
        if (e.target.closest('.erd-table') || e.target.closest('.erd-tabs') || e.target.closest('.erd-zoom-controls')) return;
        isPanning = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        scrollStartX = canvas.scrollLeft;
        scrollStartY = canvas.scrollTop;
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            canvas.scrollLeft = scrollStartX - (e.clientX - startX);
            canvas.scrollTop = scrollStartY - (e.clientY - startY);
            return;
        }
        
        if (!activeTable) return;
        
        const scale = window.erdScale || 1;
        const dx = (e.clientX - startX) / scale;
        const dy = (e.clientY - startY) / scale;

        let newLeft = startLeft + dx;
        let newTop = startTop + dy;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;

        activeTable.style.left = newLeft + 'px';
        activeTable.style.top = newTop + 'px';
        
        drawLines();
    });

    document.addEventListener('touchmove', (e) => {
        if (isPanning) {
            canvas.scrollLeft = scrollStartX - (e.touches[0].clientX - startX);
            canvas.scrollTop = scrollStartY - (e.touches[0].clientY - startY);
            e.preventDefault(); // Stop native pull-to-refresh
            return;
        }
        
        if (!activeTable) return;
        
        const scale = window.erdScale || 1;
        const dx = (e.touches[0].clientX - startX) / scale;
        const dy = (e.touches[0].clientY - startY) / scale;

        let newLeft = startLeft + dx;
        let newTop = startTop + dy;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;

        activeTable.style.left = newLeft + 'px';
        activeTable.style.top = newTop + 'px';
        
        drawLines();
        e.preventDefault(); // Stop native scrolling
    }, { passive: false });

    document.addEventListener('mouseup', () => {
        activeTable = null;
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'default';
        }
    });
    
    document.addEventListener('touchend', () => {
        activeTable = null;
        isPanning = false;
    });

});
