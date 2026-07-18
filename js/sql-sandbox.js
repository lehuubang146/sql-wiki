/**
 * SQL Sandbox System using sql.js (WebAssembly)
 */

let db = null;
let sqlPromise = null;

// Khởi tạo Database
async function initDatabase() {
    if (db) return db; // Đã khởi tạo
    
    if (!window.initSqlJs) {
        console.error("Thư viện sql.js chưa được nạp!");
        return null;
    }

    try {
        const SQL = await initSqlJs({
            // Trỏ đến file WASM trên CDN
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        db = new SQL.Database();
        
        // Tạo cấu trúc QLSV_NEW và QUANLYBANHANG
        const schema = `
            CREATE TABLE DMKHOA (MaKhoa NVARCHAR(10) PRIMARY KEY, TenKhoa NVARCHAR(100));
            CREATE TABLE DMNGANH (MaNganh NVARCHAR(10) PRIMARY KEY, TenNganh NVARCHAR(100), MaKhoa NVARCHAR(10));
            CREATE TABLE DMLOP (MaLop NVARCHAR(10) PRIMARY KEY, TenLop NVARCHAR(100), MaNganh NVARCHAR(10), KhoaHoc INT, HeDT NVARCHAR(50));
            CREATE TABLE SINHVIEN (MaSV NVARCHAR(20) PRIMARY KEY, HoTen NVARCHAR(100), NgaySinh DATE, GioiTinh NVARCHAR(10), QueQuan NVARCHAR(100), MaLop NVARCHAR(10));
            CREATE TABLE DMHOCPHAN (MaHP NVARCHAR(10) PRIMARY KEY, TenHP NVARCHAR(100), SODVHT INT, MaKhoa NVARCHAR(10));
            CREATE TABLE DIEMHP (MaSV NVARCHAR(20), MaHP NVARCHAR(10), DiemHP FLOAT, PRIMARY KEY (MaSV, MaHP));
            
            -- QUAN LY BAN HANG
            CREATE TABLE KHACHHANG (MaKH NVARCHAR(10) PRIMARY KEY, TenKH NVARCHAR(100), DiaChi NVARCHAR(200), DienThoai NVARCHAR(20), LoaiKH NVARCHAR(50));
            CREATE TABLE HANGHOA (MaH NVARCHAR(10) PRIMARY KEY, TenH NVARCHAR(100), DVT NVARCHAR(50), DonGia FLOAT);
            CREATE TABLE HOADON (MaHD NVARCHAR(10) PRIMARY KEY, NgayLapHD DATE, MaKH NVARCHAR(10), TrangThai NVARCHAR(50));
            CREATE TABLE CHITIETHD (MaHD NVARCHAR(10), MaH NVARCHAR(10), SoLuong INT, DonGia FLOAT, KhuyenMai FLOAT, PRIMARY KEY (MaHD, MaH));
        `;
        db.run(schema);

        // Chèn dữ liệu mẫu
        const seedData = `
            INSERT INTO DMKHOA VALUES ('CNTT', 'Công nghệ thông tin'), ('KT', 'Kinh tế'), ('NN', 'Ngoại ngữ');
            INSERT INTO DMNGANH VALUES ('HTTT', 'Hệ thống thông tin', 'CNTT'), ('KHMT', 'Khoa học máy tính', 'CNTT'), ('QTKD', 'Quản trị kinh doanh', 'KT');
            INSERT INTO DMLOP VALUES ('HTTT01', 'Hệ thống thông tin 1', 'HTTT', 2021, 'Đại học'), ('KHMT01', 'Khoa học máy tính 1', 'KHMT', 2022, 'Đại học');
            INSERT INTO SINHVIEN VALUES ('SV01', 'Nguyễn Văn A', '2003-05-15', 'Nam', 'Hà Nội', 'HTTT01'), ('SV02', 'Trần Thị B', '2004-10-20', 'Nữ', 'Hải Phòng', 'KHMT01'), ('SV03', 'Lê Văn C', '2003-01-10', 'Nam', 'Đà Nẵng', 'HTTT01');
            INSERT INTO DMHOCPHAN VALUES ('CSDL', 'Cơ sở dữ liệu', 3, 'CNTT'), ('TRR', 'Toán rời rạc', 3, 'CNTT'), ('KTVM', 'Kinh tế vi mô', 2, 'KT');
            INSERT INTO DIEMHP VALUES ('SV01', 'CSDL', 8.5), ('SV01', 'TRR', 7.0), ('SV02', 'CSDL', 9.0), ('SV03', 'KTVM', 6.5);
            
            -- QUAN LY BAN HANG DATA
            INSERT INTO KHACHHANG VALUES ('KH01', 'Công ty TNHH ABC', '123 Lê Lợi, Q1, HCM', '0901234567', 'Thường'), ('KH02', 'Cửa hàng Minh Hoa', '456 Trần Hưng Đạo, Q5, HCM', '0912345678', 'Thường');
            INSERT INTO HANGHOA VALUES ('HH01', 'Bánh kem', 'Cái', 250000), ('HH02', 'Kẹo dẻo', 'Gói', 50000), ('HH03', 'Bánh mì', 'Cái', 15000);
            INSERT INTO HOADON VALUES ('HD01', '2023-02-15', 'KH01', 'Đã giao'), ('HD02', '2023-10-05', 'KH02', 'Đang xử lý');
            INSERT INTO CHITIETHD VALUES ('HD01', 'HH01', 50, 250000, 0), ('HD01', 'HH02', 200, 50000, 0), ('HD02', 'HH03', 20, 15000, 0);
        `;
        db.run(seedData);
        
        console.log("✅ SQL Sandbox Initialized (QLSV_NEW & QUANLYBANHANG Loaded)");
        return db;
    } catch (err) {
        console.error("Lỗi khởi tạo CSDL:", err);
        return null;
    }
}

// Bắt đầu khởi tạo ngầm ngay lập tức
document.addEventListener('DOMContentLoaded', () => {
    sqlPromise = initDatabase();
});

// Chạy câu lệnh SQL và trả về HTML
async function executeSQL(query) {
    if (!sqlPromise) sqlPromise = initDatabase();
    await sqlPromise;
    
    if (!db) return '<div class="alert alert-error">Lỗi: CSDL chưa sẵn sàng!</div>';

    try {
        const results = db.exec(query);
        if (results.length === 0) {
            return '<div class="alert alert-success" style="background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); padding: 15px; border-radius: 8px;">Lệnh thực thi thành công (Không có kết quả trả về).</div>';
        }

        const data = results[0];
        let html = '<div class="table-responsive" style="max-height: 400px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;"><table class="data-table" style="margin: 0; width: 100%;"><thead><tr>';
        
        // Tạo Headers
        data.columns.forEach(col => {
            html += `<th style="position: sticky; top: 0; background: var(--bg-color, #0f172a); z-index: 1;">${escapeHTML(col)}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Tạo Rows
        data.values.forEach(row => {
            html += '<tr>';
            row.forEach(val => {
                html += `<td>${val === null ? '<em style="color:#64748b;">NULL</em>' : escapeHTML(String(val))}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        html += `<div style="margin-top:10px; font-size: 0.85rem; color: var(--text-muted);">Trả về <b>${data.values.length}</b> dòng.</div>`;
        return html;

    } catch (err) {
        let errorMsg = err.message;
        const upperQuery = query.toUpperCase();
        
        // Bắt lỗi các cú pháp đặc thù của T-SQL không có trong SQLite
        if (errorMsg.toLowerCase().includes('syntax error')) {
            if (errorMsg.toLowerCase().includes('all') || errorMsg.toLowerCase().includes('any') || upperQuery.includes(' ALL ') || upperQuery.includes(' ANY ')) {
                errorMsg += '<br><br>💡 <b>Lưu ý:</b> Lượng từ <code>ALL</code> và <code>ANY</code> không được hỗ trợ trong SQLite (trình biên dịch Web). Hãy dùng <code>MAX()</code>, <code>MIN()</code> hoặc chạy lệnh này trên SQL Server thật!';
            } else if (upperQuery.includes('CREATE PROCEDURE') || upperQuery.includes('CREATE TRIGGER') || upperQuery.includes('DECLARE ')) {
                errorMsg += '<br><br>💡 <b>Lưu ý:</b> Trình biên dịch Web (SQLite) không hỗ trợ lập trình T-SQL (Stored Procedure, Trigger, Cursor, Declare). Bạn chỉ có thể chạy các câu truy vấn SELECT, INSERT, UPDATE, DELETE cơ bản!';
            }
        }
        return `<div class="alert alert-error" style="color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 15px; border-radius: 8px;">
            <strong>Lỗi Cú Pháp SQL:</strong><br>${errorMsg}
        </div>`;
    }
}

// Hàm hỗ trợ chống XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Hàm kết nối UI (Dùng cho cả bài học và Sandbox độc lập)
window.runQuery = async function(btnElement, codeBlockId, resultContainerId) {
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<span class="loading-spinner" style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-bottom-color:transparent; border-radius:50%; animation: rotation 1s linear infinite;"></span> Đang xử lý...';
    btnElement.disabled = true;

    // Lấy nội dung code (hỗ trợ nhiều cách lấy)
    let query = "";
    let parentBlock = null;
    if (codeBlockId) {
        const el = document.getElementById(codeBlockId);
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
            query = el.value;
            parentBlock = el.parentElement;
        } else {
            let clone = el.cloneNode(true);
            let lineNums = clone.querySelector('.line-numbers-rows');
            if (lineNums) lineNums.remove();
            query = clone.innerText || clone.textContent;
            parentBlock = el;
        }
    } else {
        // Tìm pre code block gần nhất (Hỗ trợ cả Prism Toolbar và giao diện cũ)
        const toolbar = btnElement.closest('.code-toolbar');
        if (toolbar) {
            let clone = toolbar.querySelector('code').cloneNode(true);
            let lineNums = clone.querySelector('.line-numbers-rows');
            if (lineNums) lineNums.remove();
            query = clone.innerText || clone.textContent;
            parentBlock = toolbar;
        } else {
            const box = btnElement.closest('.query-example-box');
            if (box) {
                let clone = box.querySelector('pre code').cloneNode(true);
                let lineNums = clone.querySelector('.line-numbers-rows');
                if (lineNums) lineNums.remove();
                query = clone.innerText || clone.textContent;
                parentBlock = box;
            }
        }
    }

    if (!query.trim()) {
        btnElement.innerHTML = originalText;
        btnElement.disabled = false;
        return;
    }

    // --- POLYFILL SQL SERVER -> SQLITE ---
    let polyQuery = query;
    polyQuery = polyQuery.replace(/\bGETDATE\(\)/gi, "date('now')");
    polyQuery = polyQuery.replace(/\bYEAR\(([^)]+)\)/gi, "CAST(strftime('%Y', $1) AS INT)");
    polyQuery = polyQuery.replace(/\bMONTH\(([^)]+)\)/gi, "CAST(strftime('%m', $1) AS INT)");
    polyQuery = polyQuery.replace(/\bDAY\(([^)]+)\)/gi, "CAST(strftime('%d', $1) AS INT)");
    polyQuery = polyQuery.replace(/\bISNULL\(/gi, "IFNULL(");
    
    // Tạm bỏ qua lệnh tạo thủ tục/trigger vì SQLite không hỗ trợ hoàn toàn như SQL Server
    if (polyQuery.toUpperCase().includes("CREATE PROCEDURE") || polyQuery.toUpperCase().includes("CREATE TRIGGER")) {
        btnElement.innerHTML = originalText;
        btnElement.disabled = false;
        alert("Lưu ý: Sandbox sử dụng SQLite nên không hỗ trợ hoàn hảo CREATE PROCEDURE/TRIGGER của SQL Server. Vui lòng học lý thuyết phần này.");
        return;
    }

    const resultHtml = await executeSQL(polyQuery);
    
    // Tìm hoặc tạo vùng hiển thị kết quả
    let resultContainer;
    if (resultContainerId) {
        resultContainer = document.getElementById(resultContainerId);
    } else if (parentBlock) {
        resultContainer = parentBlock.nextElementSibling;
        if (!resultContainer || !resultContainer.classList.contains('sql-run-result')) {
            resultContainer = document.createElement('div');
            resultContainer.className = 'sql-run-result';
            resultContainer.style.marginTop = '15px';
            resultContainer.style.background = 'var(--code-bg, rgba(15, 23, 42, 0.5))';
            resultContainer.style.borderRadius = '8px';
            resultContainer.style.padding = '15px';
            resultContainer.style.border = '1px solid var(--glass-border, rgba(255,255,255,0.1))';
            parentBlock.parentNode.insertBefore(resultContainer, parentBlock.nextSibling);
        }
    }

    resultContainer.innerHTML = resultHtml;
    resultContainer.style.display = 'block';

    btnElement.innerHTML = originalText;
    btnElement.disabled = false;
};
