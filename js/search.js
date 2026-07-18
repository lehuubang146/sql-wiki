document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('open-search-btn');
    const modal = document.getElementById('search-modal');
    const backdrop = document.getElementById('search-backdrop');
    const closeBtn = document.getElementById('close-search-btn');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');

    let searchData = [
        // Các trang tĩnh lý thuyết và chức năng
        { id: 'theory_overview', category: 'Tổng Quan', question: 'Tổng Quan 2 Hệ Thống CSDL', sql: 'Các bảng cốt lõi: KHACHHANG, HANGHOA, HOADON, CHITIETHD, DMKHOA, DMNGANH, DMLOP, SINHVIEN, DMHOCPHAN, DIEMHP', page: 'overview', hash: '' },
        { id: 'theory_diagram', category: 'Tổng Quan', question: 'Sơ đồ ERD (Interactive)', sql: 'Sơ đồ tương tác kéo thả của QLSV và Quản Lý Bán Hàng', page: 'diagram', hash: '' },
        { id: 'theory_tables', category: 'Lý Thuyết', question: 'Khởi tạo Bảng & Ràng Buộc (Constraints)', sql: 'CREATE TABLE, Ràng buộc CHECK, PRIMARY KEY, FOREIGN KEY, UNIQUE, DEFAULT, Dữ liệu mẫu', page: 'tables', hash: '' },
        { id: 'theory_func', category: 'Lý Thuyết', question: 'Hàm (Functions) và Con trỏ (Cursors) trong SQL', sql: 'Scalar Function, Table-valued Function, CURSOR, FETCH NEXT', page: 'functions_cursors', hash: '' },
        { id: 'theory_tran', category: 'Lý Thuyết', question: 'Giao tác (Transaction) và Bảo mật', sql: 'BEGIN TRAN, COMMIT, ROLLBACK, Tính chất ACID, GRANT, REVOKE, DENY', page: 'transactions', hash: '' },
        { id: 'theory_proc', category: 'Lý Thuyết', question: 'Stored Procedures (Thủ tục lưu trữ)', sql: 'CREATE PROCEDURE, Tham số đầu vào, Tham số đầu ra', page: 'procedures', hash: '' },
        { id: 'theory_trig', category: 'Lý Thuyết', question: 'Triggers (Bẫy lỗi)', sql: 'FOR INSERT, UPDATE, DELETE, Bảng Inserted, Bảng Deleted', page: 'triggers', hash: '' },
        { id: 'theory_view', category: 'Lý Thuyết', question: 'Views (Khung nhìn)', sql: 'Bảng ảo, Bảo mật dữ liệu cấp cột', page: 'views', hash: '' },
        { id: 'theory_queries', category: 'Lý Thuyết', question: 'Truy vấn cơ bản (SELECT)', sql: 'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY', page: 'queries', hash: '' },
        { id: 'tool_chat', category: 'Công Cụ', question: 'Trợ Lý AI Chat', sql: 'Hỏi đáp AI, giải thích lỗi SQL, tạo dữ liệu mẫu, hướng dẫn học SQL Server', page: 'chat', hash: '' },
        { id: 'tool_sandbox', category: 'Công Cụ', question: 'Trình Biên Dịch SQL Trực Tiếp (Sandbox)', sql: 'Chạy thử câu lệnh SQL, tương tác với bảng ảo trực tiếp trên trình duyệt', page: 'sandbox', hash: '' },
        { id: 'tool_visual', category: 'Công Cụ', question: 'Xếp Hình Truy Vấn (Visual Builder)', sql: 'Lắp ráp câu lệnh SQL bằng cách chọn khối lệnh', page: 'visual_builder', hash: '' },
        { id: 'tool_mock', category: 'Công Cụ', question: 'Chế Độ Thi Thử (Mock Exam)', sql: 'Trắc nghiệm SQL tính thời gian chấm điểm', page: 'mock_exam', hash: '' }
    ];

    // Fetch JSON data
    Promise.all([
        fetch('data/exercises.json').then(res => res.json()).catch(() => []),
        fetch('data/banhang_exercises.json').then(res => res.json()).catch(() => []),
        fetch('data/qa.json').then(res => res.json()).catch(() => []),
        fetch('data/mcq.json').then(res => res.json()).catch(() => [])
    ]).then(([exData, bhData, qaData, mcqData]) => {
        // Xử lý bài tập QLSV & Bán Hàng
        const allExercises = [...exData, ...bhData];
        allExercises.forEach(ex => {
            if (!ex) return;
            let pageKey = 'home';
            const cat = ex.category ? ex.category.toLowerCase() : '';
            if (cat.includes('điều kiện') || cat.includes('cơ bản') || cat.includes('kết nối bảng')) pageKey = 'basic';
            else if (cat.includes('nhóm')) pageKey = 'groupby';
            else if (cat.includes('lồng')) pageKey = 'subquery';
            else if (cat.includes('lượng từ') || cat.includes('top')) pageKey = 'quantifier';
            else if (cat.includes('view')) pageKey = 'view_ex';
            else if (cat.includes('procedure') || cat.includes('thủ tục')) pageKey = 'proc_ex';
            else if (cat.includes('trigger')) pageKey = 'trigger_ex';
            
            searchData.push({
                id: ex.id,
                category: ex.category || 'Bài tập',
                question: ex.question || '',
                sql: ex.sql || '',
                page: pageKey,
                hash: `#ex-${ex.id}`
            });
        });

        // Xử lý câu hỏi Ôn Tập
        qaData.forEach(qa => {
            searchData.push({
                id: `qa-${qa.id}`,
                category: 'Ôn Tập',
                question: `Câu ${qa.id}: ${qa.question}`,
                sql: qa.answer,
                page: 'qa',
                hash: `#qa-${qa.id}`
            });
        });

        // Xử lý câu hỏi Trắc nghiệm (Thi Thử)
        mcqData.forEach(mcq => {
            searchData.push({
                id: `mcq-${mcq.id}`,
                category: 'Trắc Nghiệm',
                question: mcq.question,
                sql: `Đáp án đúng: ${mcq.options[mcq.answer]}`,
                page: 'mock_exam',
                hash: ''
            });
        });
    });

    function openModal() {
        modal.classList.add('active');
        input.value = '';
        input.focus();
        renderResults('');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    searchBtn.addEventListener('click', openModal);
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openModal();
        }
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    input.addEventListener('input', (e) => {
        renderResults(e.target.value);
    });

    function renderResults(query) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '<div class="search-empty">Nhập từ khóa (vd: JOIN, Cursor, Transaction...) để tìm kiếm.</div>';
            return;
        }

        const lowerQ = query.toLowerCase();
        const matches = searchData.filter(item => 
            (item.question && item.question.toLowerCase().includes(lowerQ)) ||
            (item.sql && item.sql.toLowerCase().includes(lowerQ)) ||
            (item.category && item.category.toLowerCase().includes(lowerQ))
        ).slice(0, 15); // Limit to 15 results

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<div class="search-empty">Không tìm thấy kết quả nào phù hợp.</div>';
            return;
        }

        resultsContainer.innerHTML = matches.map(item => {
            const hasDynamicLinks = document.querySelector('a[href^="?page="]') !== null;
            let href = '';
            if (hasDynamicLinks) {
                href = `?page=${item.page}${item.hash}`;
            } else {
                const fileName = item.page === 'home' ? 'index' : item.page;
                href = `${fileName}.html${item.hash}`;
            }
            
            const cleanSql = item.sql ? item.sql.replace(/\s+/g, ' ').substring(0, 100) + '...' : '';
            return `
                <a href="${href}" class="search-result-item">
                    <div class="result-category">${item.category}</div>
                    <div class="result-question">${item.question}</div>
                    <div class="result-code">${cleanSql}</div>
                </a>
            `;
        }).join('');
    }

    resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.search-result-item');
        if (item) {
            closeModal();
            // Optional: if navigating to the same page but different hash, ensure the target is opened
            setTimeout(() => {
                if (window.location.hash) {
                    const target = document.querySelector(window.location.hash);
                    if (target && target.classList.contains('qa-card')) {
                        document.querySelectorAll('.qa-card').forEach(c => c.classList.remove('open'));
                        target.classList.add('open');
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 100);
        }
    });

    window.addEventListener('hashchange', () => {
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target && target.classList.contains('qa-card')) {
                document.querySelectorAll('.qa-card').forEach(c => c.classList.remove('open'));
                target.classList.add('open');
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
});
