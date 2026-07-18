const fs = require('fs');

const explanations = {
  "b2-d1-b1-1": "Câu lệnh sử dụng mệnh đề SELECT để chọn các cột masv, hoten, malop, ngaysinh, và gioitinh từ bảng sinhvien. Không có mệnh đề WHERE nên kết quả sẽ trả về tất cả các dòng trong bảng.",
  "b2-d1-b1-2": "Sử dụng SELECT để lấy các trường tương ứng, dùng hàm YEAR(ngaysinh) as namsinh để trích xuất năm sinh từ ngày sinh. Mệnh đề WHERE gioitinh = 1 dùng để lọc và chỉ lấy các sinh viên Nữ (giả sử 1 là Nữ).",
  "b2-d1-b1-3": "Lấy các thông tin cần thiết từ bảng sinhvien. Mệnh đề WHERE kết hợp điều kiện gioitinh = 0 (sinh viên Nam) VÀ (AND) điều kiện địa chỉ ở 'tuy phuoc' HOẶC (OR) 'tay son'. Dấu ngoặc () bao quanh điều kiện OR đảm bảo logic kiểm tra địa chỉ được thực hiện trước khi AND với giới tính.",
  "b2-d1-b1-4": "Hàm CONVERT(varchar, ngaysinh, 103) được dùng để định dạng ngày sinh theo chuẩn dd/mm/yyyy (mã định dạng 103). Mệnh đề WHERE lọc ra các sinh viên thỏa mãn đồng thời 2 điều kiện: là nam (gioitinh = 0) và thuộc lớp 'ct13'.",
  "b2-d1-b1-5": "Lấy năm sinh bằng hàm YEAR(). Ở đây, cột giới tính được gán giá trị tĩnh N'nam' as gioitinh ngay trong SELECT vì ta đã lọc sinh viên nam ở WHERE. Điều kiện WHERE gioitinh = 0 AND malop = 'ct11' dùng để chọn các sinh viên nam của lớp CT11.",
  "b2-d1-b1-6": "Sử dụng cấu trúc CASE WHEN trong SELECT để chuyển đổi giá trị gioitinh: nếu là 0 thì hiển thị 'nam', ngược lại hiển thị 'nu'. Mệnh đề WHERE hoten LIKE '_g%' dùng để lọc các sinh viên có ký tự thứ 2 trong họ tên là 'g' (dấu '_' đại diện cho 1 ký tự bất kỳ đầu tiên, '%' đại diện cho chuỗi ký tự phía sau).",
  "b2-d1-b1-7": "Cấu trúc CASE WHEN tương tự câu trên để hiển thị giới tính. Mệnh đề WHERE hoten LIKE N'% van %' dùng để tìm các sinh viên có họ lót là 'văn'. Dấu '%' ở hai đầu giúp tìm từ 'van' nằm ở giữa chuỗi họ tên, có khoảng trắng ở hai bên.",
  "b2-d1-b1-8": "Sử dụng CASE WHEN để định dạng giới tính. Mệnh đề WHERE kết hợp nhiều điều kiện NOT LIKE với toán tử AND để loại bỏ các sinh viên có họ (ký tự đầu tiên) bắt đầu bằng chữ 'n', 'l', hoặc 't'. Ký tự '%' đại diện cho phần còn lại của tên.",
  "b2-d1-b1-9": "Sử dụng mệnh đề IN trong điều kiện WHERE thay vì dùng nhiều điều kiện OR liên tiếp (malop = 'ct11' OR malop = 'ct12' ...). Toán tử IN giúp kiểm tra xem giá trị của cột malop có nằm trong danh sách ('ct11', 'ct12', 'ct13') hay không, làm cho truy vấn ngắn gọn và dễ đọc hơn.",
  "b2-d1-b1-10": "Tính tuổi bằng cách lấy năm hiện tại YEAR(GETDATE()) trừ đi năm sinh YEAR(ngaysinh). Trong WHERE, ta lọc các sinh viên có độ tuổi từ 20 đến 29 bằng toán tử BETWEEN 20 AND 29, toán tử này bao gồm cả hai giá trị đầu mút.",
  "b2-d1-b2-1": "Truy vấn kết nối 2 bảng sinhvien (bí danh s) và diemhp (bí danh d) thông qua khóa chung masv (s.masv = d.masv). Điều kiện d.diemhp >= 5 dùng để lọc các học phần điểm lớn hơn hoặc bằng 5. Mệnh đề ORDER BY dùng để sắp xếp kết quả tăng dần (ASC) ưu tiên theo malop trước, sau đó tới hoten.",
  "b2-d1-b2-2": "Kết nối 3 bảng sinhvien, diemhp và dmhocphan thông qua các khóa ngoại masv và mahp. Mệnh đề WHERE có điều kiện lọc điểm học phần nằm trong khoảng từ 7 đến 9 bằng toán tử BETWEEN, và điều kiện học kỳ phải là 1 (h.hocky = 1).",
  "b2-d1-b2-3": "Thực hiện phép nối qua 4 bảng (sinhvien, dmlop, dmnganh, dmkhoa) bằng các khóa kết nối tương ứng (malop, manganh, makhoa). Điều kiện k.makhoa IN ('cntt', 'kt') giúp chỉ lọc ra các sinh viên thuộc về khoa có mã là 'cntt' hoặc 'kt'.",
  "b2-d2-b1-1": "Sử dụng LEFT JOIN để giữ lại tất cả các lớp trong bảng dmlop kể cả khi lớp đó chưa có sinh viên nào. Phép gom nhóm GROUP BY theo malop và tenlop cho phép ta đếm số lượng sinh viên (COUNT(s.masv)) của từng lớp. Nếu dùng INNER JOIN, các lớp không có sinh viên sẽ bị loại khỏi kết quả.",
  "b2-d2-b1-2": "Kết nối các bảng điểm, học phần và sinh viên. Sau đó, gom nhóm dữ liệu theo từng sinh viên (s.masv) và học kỳ (h.hocky) bằng mệnh đề GROUP BY. Hàm tập hợp AVG(d.diemhp) được dùng để tính điểm trung bình chung cho từng nhóm (tức là mỗi học kỳ của từng sinh viên).",
  "b2-d2-b1-3": "Phép kết nối dmlop và sinhvien. GROUP BY được thực hiện trên malop, tenlop và gioitinh để chia nhỏ nhóm theo từng giới tính trong mỗi lớp. COUNT(s.masv) sẽ đếm tổng số sinh viên trong mỗi nhóm nhỏ đó, từ đó cho ra số lượng nam/nữ riêng biệt của mỗi lớp.",
  "b2-d2-b2-1": "Lọc ra các bản ghi điểm dưới 5 trước (bằng WHERE d.diemhp < 5) từ kết quả nối bảng sinhvien và diemhp. Sau đó, GROUP BY theo masv, hoten để gom nhóm và đếm số lượng học phần thiếu điểm của mỗi sinh viên bằng COUNT(d.mahp).",
  "b2-d2-b2-2": "Lọc trực tiếp từ bảng diemhp những sinh viên có điểm > 5. Gom nhóm bằng GROUP BY mahp để phân chia theo từng học phần, rồi dùng hàm COUNT(masv) đếm số lượng sinh viên đạt yêu cầu của mỗi học phần.",
  "b2-d2-b2-3": "Lọc ra những môn có điểm >= 5 qua mệnh đề WHERE. Sau khi kết nối dữ liệu từ sinhvien, diemhp và dmhocphan, GROUP BY theo sinh viên. Hàm tập hợp SUM(h.sodvht) sẽ cộng dồn số đơn vị học trình của tất cả các môn đã qua (đạt điều kiện >= 5) của mỗi sinh viên.",
  "b2-d2-b3-1": "Gom nhóm sinh viên theo từng lớp bằng GROUP BY. Mệnh đề HAVING được dùng thay vì WHERE bởi vì ta cần lọc dựa trên kết quả của hàm tập hợp (COUNT). Điều kiện HAVING count(s.masv) >= 10 sẽ giữ lại những lớp có từ 10 sinh viên trở lên.",
  "b2-d2-b3-2": "Gom nhóm theo sinh viên, sau đó tính điểm trung bình chung bằng AVG(d.diemhp). Dùng mệnh đề HAVING avg(d.diemhp) < 3 để lọc ra các sinh viên có điểm trung bình sau khi gom nhóm nhỏ hơn 3 (HAVING áp dụng điều kiện cho các nhóm sau khi GROUP BY).",
  "b2-d2-b3-3": "Đầu tiên dùng WHERE d.diemhp <= 5 để lọc ra các học phần có điểm <= 5. Sau đó thực hiện GROUP BY theo sinh viên và áp dụng mệnh đề HAVING count(d.mahp) >= 2 để chỉ lấy ra các sinh viên có ít nhất 2 học phần rớt.",
  "b2-d2-b3-4": "Lọc các học phần thuộc ngành '140902' trong WHERE, sau đó gom nhóm theo sinh viên. Mệnh đề HAVING đếm số học phần phân biệt (COUNT(DISTINCT d.mahp)) sinh viên đã học. Truy vấn con (SELECT COUNT... WHERE manganh='140902') trả về tổng số học phần của ngành. Phép bằng (=) đảm bảo sinh viên đã học 'TẤT CẢ' môn.",
  "b2-d2-b3-5": "WHERE lọc các bản ghi chỉ thuộc 3 môn '001', '002', '003'. Sau đó gom nhóm theo sinh viên và dùng HAVING đếm số học phần phân biệt (DISTINCT mahp). Nếu đếm được >= 3 môn, nghĩa là sinh viên đã học ít nhất cả 3 học phần được chỉ định (vì đã bị giới hạn tối đa 3 môn ở phần WHERE).",
  "b2-d2-b4-1": "Mệnh đề SELECT TOP 1 lấy ra bản ghi đầu tiên trong kết quả truy vấn. Để tìm người có điểm trung bình cao nhất, sau khi GROUP BY tính AVG, ta phải sắp xếp giảm dần kết quả theo điểm trung bình bằng ORDER BY avg(d.diemhp) DESC. Bản ghi đầu tiên lúc này sẽ có điểm cao nhất.",
  "b2-d2-b4-2": "Lọc các điểm rớt (< 5), gom nhóm theo sinh viên và tính tổng số môn rớt bằng COUNT(). Lấy người có số học phần rớt nhiều nhất bằng cách kết hợp SELECT TOP 1 với ORDER BY count(d.mahp) DESC (sắp xếp giảm dần số môn rớt).",
  "b2-d2-b4-3": "Tương tự như tìm sinh viên, nhưng áp dụng trên bảng học phần. Lọc ra các điểm < 5, gom nhóm theo học phần (mahp). Sử dụng hàm đếm COUNT(d.masv) (số lượng sinh viên rớt), sắp xếp giảm dần (DESC) và dùng TOP 1 để lấy ra học phần có nhiều sinh viên rớt nhất.",
  "b2-d3-b1-1": "Sử dụng truy vấn lồng nhau (subquery). Câu lệnh con (SELECT masv FROM diemhp) lấy ra danh sách tất cả mã sinh viên đã có điểm học phần (nghĩa là đã học ít nhất 1 môn). Điều kiện NOT IN ở truy vấn ngoài sẽ loại trừ danh sách đó, để lấy những sinh viên không có điểm trong bảng diemhp.",
  "b2-d3-b1-2": "Truy vấn con lấy ra các mã sinh viên đã học học phần mã '002' (WHERE mahp = '002'). Sau đó, truy vấn chính lọc từ bảng sinhvien với mệnh đề NOT IN để loại bỏ các sinh viên trong danh sách vừa thu được, cho ra kết quả là những người chưa học môn này.",
  "b2-d3-b1-3": "Truy vấn con lọc ra danh sách mã học phần (mahp) có sinh viên nào đó đạt điểm <= 5. Truy vấn chính dùng NOT IN danh sách đó để lọc ra các học phần (từ bảng dmhocphan) không hề có bất kỳ sinh viên nào bị điểm thấp hơn hoặc bằng 5.",
  "b2-d3-b1-4": "Truy vấn con lấy danh sách mã sinh viên (masv) đã từng có điểm nhỏ hơn 5 ở bất kỳ môn nào. Ở truy vấn ngoài, toán tử NOT IN được sử dụng để loại bỏ các sinh viên này, kết quả nhận được là những sinh viên hoàn toàn không có học phần nào bị điểm < 5."
};

const inputFile = 'C:/xampp/htdocs/SQL_Wiki/data/part1.json';
const outputFile = 'C:/xampp/htdocs/SQL_Wiki/data/part1_done.json';

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

for (let i = 0; i < data.length; i++) {
  const item = data[i];
  if (explanations[item.id]) {
    item.explanation = explanations[item.id];
  } else {
    console.warn('Missing explanation for id:', item.id);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully written to', outputFile);
