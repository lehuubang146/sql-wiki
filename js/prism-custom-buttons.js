document.addEventListener('DOMContentLoaded', function() {
    // Tìm tất cả các code block SQL
    const sqlBlocks = document.querySelectorAll('pre code.language-sql');
    
    function getCleanCode(el) {
        let clone = el.cloneNode(true);
        let lineNums = clone.querySelector('.line-numbers-rows');
        if (lineNums) lineNums.remove();
        return clone.innerText || clone.textContent;
    }
    
    sqlBlocks.forEach(function(codeEl) {
        const preEl = codeEl.parentElement;
        
        // Tránh chèn trùng lặp
        if (preEl.parentElement.classList.contains('custom-code-wrapper')) return;

        // Bọc pre trong một thẻ div relative
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-code-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.marginBottom = '1.5rem';
        wrapper.style.paddingTop = '3.5rem'; // Dành khoảng trống cho toolbar
        
        preEl.parentNode.insertBefore(wrapper, preEl);
        wrapper.appendChild(preEl);
        preEl.style.margin = '0';
        preEl.style.borderTopLeftRadius = '0';
        preEl.style.borderTopRightRadius = '0';
        
        // Tạo Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'custom-code-toolbar';
        toolbar.style.position = 'absolute';
        toolbar.style.top = '0';
        toolbar.style.left = '0';
        toolbar.style.right = '0';
        toolbar.style.display = 'flex';
        toolbar.style.justifyContent = 'flex-end';
        toolbar.style.alignItems = 'center';
        toolbar.style.gap = '0.5rem';
        toolbar.style.zIndex = '10';
        toolbar.style.padding = '8px 12px';
        toolbar.style.background = 'rgba(0, 0, 0, 0.15)';
        toolbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        toolbar.style.borderTopLeftRadius = '8px';
        toolbar.style.borderTopRightRadius = '8px';

        // Styling chung cho nút
        const btnStyle = "padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.5); color: #fff; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;";

        // Nút Copy
        const copyBtn = document.createElement('button');
        copyBtn.style.cssText = btnStyle;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(getCleanCode(codeEl));
            const origText = this.innerHTML;
            this.innerHTML = '✅ Copied!';
            setTimeout(() => this.innerHTML = origText, 2000);
        };

        // Dropdown Hỏi AI
        const aiWrapper = document.createElement('div');
        aiWrapper.style.position = 'relative';

        const aiBtn = document.createElement('button');
        aiBtn.style.cssText = btnStyle;
        aiBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Hỏi AI ▾';
        
        const aiDropdown = document.createElement('div');
        aiDropdown.className = 'ai-dropdown-menu';
        aiDropdown.style.cssText = "display: none; position: absolute; top: 100%; right: 0; background: var(--bg-color); border: 1px solid var(--glass-border); border-radius: 8px; padding: 5px; min-width: 180px; z-index: 20; box-shadow: 0 4px 12px rgba(0,0,0,0.5); flex-direction: column; gap: 2px;";
        
        const aiOptions = [
            { text: '📖 Giải thích chi tiết', prompt: 'Giúp tôi giải thích chi tiết đoạn code SQL này:\n```sql\n' },
            { text: '🐛 Tìm lỗi (Debug)', prompt: 'Tìm và sửa lỗi trong đoạn code SQL này giúp tôi:\n```sql\n' },
            { text: '🚀 Tối ưu hóa', prompt: 'Tối ưu hóa đoạn code SQL này để chạy nhanh hơn:\n```sql\n' },
            { text: '📝 Tạo bài tập tương tự', prompt: 'Tạo một bài tập SQL tương tự dựa trên đoạn code này:\n```sql\n' }
        ];

        aiOptions.forEach(opt => {
            const optBtn = document.createElement('button');
            optBtn.style.cssText = "padding: 8px 12px; text-align: left; background: none; border: none; color: var(--text-color); border-radius: 4px; cursor: pointer; font-size: 0.85rem; width: 100%; transition: background 0.2s; font-family: inherit;";
            optBtn.innerHTML = opt.text;
            optBtn.onmouseover = () => optBtn.style.background = 'var(--glass-bg)';
            optBtn.onmouseout = () => optBtn.style.background = 'none';
            optBtn.onclick = () => {
                sessionStorage.setItem('pendingAiPrompt', opt.prompt + getCleanCode(codeEl) + '\n```');
                const isStatic = window.location.pathname.endsWith('.html') || window.location.pathname.includes('github.io');
                window.location.href = isStatic ? 'chat.html' : '?page=chat';
            };
            aiDropdown.appendChild(optBtn);
        });

        aiBtn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = aiDropdown.style.display === 'flex';
            document.querySelectorAll('.ai-dropdown-menu').forEach(menu => menu.style.display = 'none');
            aiDropdown.style.display = isVisible ? 'none' : 'flex';
        };
        
        document.addEventListener('click', () => aiDropdown.style.display = 'none');

        aiWrapper.appendChild(aiBtn);
        aiWrapper.appendChild(aiDropdown);

        // Nút Chạy thử
        const runBtn = document.createElement('button');
        runBtn.style.cssText = btnStyle + " background: rgba(16, 185, 129, 0.2); color: #10b981; border-color: rgba(16, 185, 129, 0.4);";
        runBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Chạy thử';
        
        runBtn.onclick = function() {
            if (window.runQuery) {
                const code = getCleanCode(codeEl);
                const upperCode = code.toUpperCase();
                if (upperCode.includes('CREATE PROCEDURE') || upperCode.includes('CREATE TRIGGER') || upperCode.includes('DECLARE @')) {
                    alert('⚠️ Trình biên dịch trực tuyến (SQLite) hiện tại không hỗ trợ cú pháp Stored Procedure, Trigger hoặc Biến của T-SQL (SQL Server).\n\nVui lòng sử dụng SQL Server Management Studio (SSMS) để chạy các đoạn mã này.');
                    return;
                }
                
                // Cấp ID cho code block nếu chưa có
                if (!codeEl.id) {
                    codeEl.id = 'query-input-auto-' + Math.random().toString(36).substr(2, 9);
                }
                
                let resultId = codeEl.id.replace('input', 'result');
                let resultDiv = document.getElementById(resultId);
                
                // Nếu không có sẵn div result (ở các trang lý thuyết), tạo mới ngay bên dưới wrapper
                if (!resultDiv) {
                    resultDiv = document.createElement('div');
                    resultDiv.className = 'query-result-container';
                    resultDiv.id = resultId;
                    resultDiv.style.marginTop = '15px';
                    wrapper.parentNode.insertBefore(resultDiv, wrapper.nextSibling);
                }
                
                window.runQuery(this, codeEl.id, resultId);
            } else {
                alert('Trình biên dịch chưa sẵn sàng. Vui lòng đợi trang tải xong!');
            }
        };

        toolbar.appendChild(copyBtn);
        toolbar.appendChild(aiWrapper);
        toolbar.appendChild(runBtn);
        wrapper.appendChild(toolbar);
    });
});
