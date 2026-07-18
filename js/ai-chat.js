document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('ai-chat-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const settingsBtn = document.getElementById('ai-chat-settings-btn');
    
    const settingsModal = document.getElementById('ai-settings-modal');
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const saveKeyBtn = document.getElementById('save-api-key-btn');
    
    const chatMessages = document.getElementById('ai-chat-messages');
    const chatInput = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const typingIndicator = document.getElementById('ai-typing-indicator');

    let apiKey = localStorage.getItem('groq_api_key') || '';
    
    // Mở / Đóng Chat
    toggleBtn.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatWindow.style.display === 'flex') {
            if (!apiKey) {
                settingsModal.classList.add('active');
            } else {
                chatInput.focus();
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Mở Settings Modal
    settingsBtn.addEventListener('click', () => {
        apiKeyInput.value = apiKey;
        settingsModal.classList.toggle('active');
    });

    // Lưu API Key
    saveKeyBtn.addEventListener('click', () => {
        const val = apiKeyInput.value.trim();
        if (val) {
            apiKey = val;
            localStorage.setItem('groq_api_key', apiKey);
            settingsModal.classList.remove('active');
            chatInput.focus();
        } else {
            alert('Vui lòng nhập API Key!');
        }
    });

    let conversationHistory = [];

    const systemPrompt = `Bạn là trợ lý AI (Llama) xuất sắc giảng dạy SQL Server. Bạn đang hỗ trợ một sinh viên làm bài tập thực hành. 
Cơ sở dữ liệu QLSV_NEW bao gồm các bảng sau:
- KHOA(MAKHOA, TENKHOA)
- NGANH(MANGANH, TENNGANH, MAKHOA)
- LOP(MALOP, TENLOP, MANGANH, KHOAHOC, HEDT, NAMNHAPHOC)
- SINHVIEN(MASV, HO, TEN, NGAYSINH, GIOITINH, NOISINH, MALOP)
- MONHOC(MAMH, TENMH, SODVHT, MANGANH, HOCKY)
- KETQUA(MASV, MAMH, LANTHI, DIEMTHI)
Yêu cầu: Trả lời ngắn gọn, tiếng Việt thân thiện. Cung cấp câu lệnh SQL chính xác với tên cột ở trên. Đóng gói code SQL trong \`\`\`sql ... \`\`\`.`;

    // Nạp system prompt vào lịch sử OpenAI
    conversationHistory.push({ role: 'system', content: systemPrompt });

    function addMessageToUI(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        
        // Render Markdown cơ bản
        let formattedText = text.replace(/```(sql)?\n([\s\S]*?)```/g, '<pre><code class="language-sql">$2</code></pre>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        msgDiv.innerHTML = formattedText;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (window.Prism) {
            Prism.highlightAllUnder(msgDiv);
        }
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        if (!apiKey) {
            settingsModal.classList.add('active');
            return;
        }

        addMessageToUI('user', text);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        typingIndicator.classList.add('active');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        conversationHistory.push({ role: 'user', content: text });

        try {
            const models = [
                'llama-3.3-70b-versatile',
                'llama-3.1-8b-instant',
                'gemma2-9b-it',
                'mixtral-8x7b-32768'
            ];
            
            let data = null;
            let lastError = null;
            
            for (const model of models) {
                try {
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: conversationHistory
                        })
                    });

                    const resData = await response.json();
                    
                    if (!response.ok) {
                        lastError = new Error(resData.error?.message || 'Lỗi Groq API');
                        console.warn(`Model ${model} bị nghẽn:`, lastError.message);
                        continue; // Bỏ qua, thử model tiếp theo
                    }
                    
                    data = resData;
                    break; // Thành công, thoát vòng lặp
                } catch (err) {
                    lastError = err;
                    console.warn(`Model ${model} lỗi kết nối:`, err.message);
                }
            }
            
            if (!data) {
                throw lastError || new Error('Tất cả các AI miễn phí đều đang quá tải.');
            }

            const aiText = data.choices[0].message.content;
            addMessageToUI('ai', aiText);
            conversationHistory.push({ role: 'assistant', content: aiText });

        } catch (error) {
            console.error(error);
            let errMsg = error.message;
            if (errMsg.includes('401') || errMsg.includes('key')) {
                errMsg = 'Mã Groq API Key không hợp lệ. Vui lòng kiểm tra lại (mã thường bắt đầu bằng gsk_...).';
            } else if (errMsg.includes('limits') || errMsg.includes('quota')) {
                errMsg = 'Bạn đã hỏi quá nhanh (Rate Limit) hoặc máy chủ Groq đang quá tải. Vui lòng đợi 1 phút và thử lại.';
            } else {
                errMsg = `Lỗi hệ thống: ${errMsg}`;
            }
            addMessageToUI('ai', `⚠️ ${errMsg}`);
            conversationHistory.pop(); // Xóa tin nhắn user khỏi lịch sử nếu lỗi
        } finally {
            chatInput.disabled = false;
            sendBtn.disabled = false;
            typingIndicator.classList.remove('active');
            chatInput.focus();
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
