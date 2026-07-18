document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const sessionListEl = document.getElementById('chat-session-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const messagesEl = document.getElementById('messenger-messages');
    const inputEl = document.getElementById('messenger-input');
    const sendBtn = document.getElementById('messenger-send-btn');
    const modelSelect = document.getElementById('ai-model-select');
    const typingIndicator = document.getElementById('messenger-typing');
    
    // File Attachments
    const fileUpload = document.getElementById('chat-file-upload');
    const attachBtn = document.getElementById('chat-attach-btn');
    const attachmentPreview = document.getElementById('attachment-preview-area');
    
    // Settings
    const settingsBtn = document.getElementById('chat-settings-btn');
    const settingsModal = document.getElementById('messenger-settings-modal');
    const closeSettingsBtn = document.getElementById('ms-close-btn');
    const saveSettingsBtn = document.getElementById('ms-save-btn');
    const groqKeyInput = document.getElementById('ms-groq-key');
    
    // Mobile Sidebar
    const sidebar = document.getElementById('chat-sidebar');
    const sidebarToggle = document.getElementById('mobile-sidebar-toggle');
    const sidebarClose = document.getElementById('mobile-sidebar-close');

    // State
    let sessions = JSON.parse(localStorage.getItem('messenger_sessions')) || [];
    let activeSessionId = localStorage.getItem('messenger_active_session') || null;
    let groqKey = localStorage.getItem('groq_api_key') || '';
    let deepseekKey = localStorage.getItem('deepseek_api_key') || '';
    let geminiKey = localStorage.getItem('gemini_api_key') || '';
    
    let currentAttachments = [];

    const systemPrompt = window.SQL_WIKI_SYSTEM_PROMPT || "Bạn là trợ lý AI.";
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    // Tải danh sách models trước khi init
    loadModels();
    
    // Initialize
    if (sessions.length === 0) {
        createNewSession();
    } else {
        if (!activeSessionId || !sessions.find(s => s.id === activeSessionId)) {
            activeSessionId = sessions[0].id;
        }
        renderSessionList();
        loadSession(activeSessionId);
    }

    const pendingPrompt = sessionStorage.getItem('pendingAiPrompt');
    if (pendingPrompt) {
        sessionStorage.removeItem('pendingAiPrompt');
        setTimeout(() => {
            inputEl.value = pendingPrompt;
            inputEl.focus();
        }, 300);
    }
    
    function loadModels() {
        let html = '<optgroup label="Groq Models (Tốc độ siêu nhanh)">';
        html += '<option value="groq:llama-3.3-70b-versatile">llama-3.3-70b-versatile - [TOP 1] Thông minh & Toàn năng nhất</option>';
        html += '<option value="groq:llama-3.1-8b-instant">llama-3.1-8b-instant - [TOP 2] Phan hoi sieu nhanh</option>';
        html += '</optgroup>';
        
        html += '<optgroup label="Google Gemini (Siêu thông minh - 2M tokens)">';
        html += '<option value="gemini:gemini-3.5-flash">Gemini 3.5 Flash (Tốc độ siêu cao + Hỗ trợ đọc Ảnh!)</option>';
        html += '</optgroup>';
        
        const prevValue = modelSelect.value || 'groq:llama-3.3-70b-versatile';
        modelSelect.innerHTML = html;
        if (prevValue) {
            modelSelect.value = prevValue;
        } else {
            modelSelect.value = 'groq:llama-3.3-70b-versatile';
        }
    }

    function saveSessions() {
        localStorage.setItem('messenger_sessions', JSON.stringify(sessions));
        localStorage.setItem('messenger_active_session', activeSessionId);
    }

    function createNewSession() {
        const newId = 'session_' + Date.now();
        sessions.unshift({
            id: newId,
            title: 'Đoạn chat mới',
            model: modelSelect.value,
            messages: []
        });
        activeSessionId = newId;
        saveSessions();
        renderSessionList();
        loadSession(newId);
    }

    function renderSessionList() {
        sessionListEl.innerHTML = '';
        sessions.forEach(session => {
            const li = document.createElement('li');
            li.className = `chat-session-item ${session.id === activeSessionId ? 'active' : ''}`;
            li.innerHTML = `
                <div class="chat-session-item-title">${escapeHtml(session.title)}</div>
                <button class="delete-btn" title="Xoá">&times;</button>
            `;
            li.onclick = (e) => {
                if(e.target.classList.contains('delete-btn')) {
                    deleteSession(session.id);
                } else {
                    activeSessionId = session.id;
                    saveSessions();
                    renderSessionList();
                    loadSession(session.id);
                    if(window.innerWidth <= 768) sidebar.classList.remove('active');
                }
            };
            sessionListEl.appendChild(li);
        });
    }

    function deleteSession(id) {
        sessions = sessions.filter(s => s.id !== id);
        if (sessions.length === 0) {
            createNewSession();
        } else {
            if (activeSessionId === id) {
                activeSessionId = sessions[0].id;
            }
            saveSessions();
            renderSessionList();
            loadSession(activeSessionId);
        }
    }

    function loadSession(id) {
        const session = sessions.find(s => s.id === id);
        if(!session) return;
        
        if(session.model) {
            modelSelect.value = session.model;
            if(!modelSelect.value) { 
                modelSelect.value = 'groq:llama-3.3-70b-versatile'; 
                session.model = modelSelect.value; 
                saveSessions(); 
            }
        }

        messagesEl.innerHTML = '';
        if (session.messages.length === 0) {
            messagesEl.innerHTML = `<div class="chat-msg ai" id="chat-welcome-msg">Xin chào! Chọn một Model ở trên và bắt đầu trò chuyện nhé.</div>`;
        } else {
            session.messages.forEach(msg => {
                if (msg.attachment && !msg.attachments) {
                    msg.attachments = [msg.attachment];
                }
                renderMessageUI(msg.role, msg.content, msg.attachments);
            });
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function renderMessageUI(role, text, attachments = null) {
        if(role === 'system') return;
        text = String(text ?? '');
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${role === 'user' ? 'user' : 'ai'}`;
        
        let html = '';
        if (attachments && Array.isArray(attachments)) {
            html += '<div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 5px;">';
            attachments.forEach(attachment => {
                if (attachment.type === 'image') {
                    html += `<img src="data:${escapeHtml(attachment.mime)};base64,${attachment.data}" class="msg-attachment" style="cursor: zoom-in; max-width: 150px; border-radius: 8px;">`;
                } else if (attachment.type === 'text') {
                    html += `<div class="msg-file-icon" style="background: rgba(0,0,0,0.05); padding: 5px 10px; border-radius: 4px;">📄 ${escapeHtml(attachment.filename)}</div>`;
                }
            });
            html += '</div><br>';
        }
        
        let codeBlocks = [];
        let formattedText = text.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/gi, (match, lang, code) => {
            const language = lang || 'text';
            const escapedLanguage = escapeHtml(language);
            const escapedCode = escapeHtml(code);
            codeBlocks.push(`
            <div class="code-box">
                <div class="code-box-header">
                    <span class="code-lang">${escapedLanguage.toUpperCase()}</span>
                    <button class="copy-code-btn" onclick="copyToClipboard(this)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy
                    </button>
                </div>
                <div class="code-box-body">
                    <pre><code class="language-${escapedLanguage}">${escapedCode}</code></pre>
                </div>
            </div>`);
            return `___CODEBLOCK_${codeBlocks.length - 1}___`;
        });
        
        let inlineCodeBlocks = [];
        formattedText = formattedText.replace(/`([^`]+)`/g, (match, code) => {
            const escapedCode = escapeHtml(code);
            inlineCodeBlocks.push(`<code class="inline-code">${escapedCode}</code>`);
            return `___INLINECODE_${inlineCodeBlocks.length - 1}___`;
        });
        
        formattedText = escapeHtml(formattedText);
        
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        codeBlocks.forEach((block, index) => {
            formattedText = formattedText.replace(`___CODEBLOCK_${index}___`, block);
        });
        inlineCodeBlocks.forEach((block, index) => {
            formattedText = formattedText.replace(`___INLINECODE_${index}___`, block);
        });
        
        html += formattedText;
        msgDiv.innerHTML = html;
        messagesEl.appendChild(msgDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        
        if (window.Prism) Prism.highlightAllUnder(msgDiv);
    }

    // --- Attachments ---
    if (attachBtn) attachBtn.onclick = () => fileUpload.click();
    
    window.removeAttachment = function(index) {
        currentAttachments.splice(index, 1);
        if(currentAttachments.length === 0 && fileUpload) {
            fileUpload.value = '';
        }
        showAttachmentPreview();
    };

    if (fileUpload) {
        fileUpload.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            for (const file of files) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("Bỏ qua file " + file.name + " (Vượt quá 2MB)");
                    continue;
                }
                
                await new Promise((resolve) => {
                    const reader = new FileReader();
                    if (file.type.startsWith('image/')) {
                        reader.onload = (ev) => {
                            const base64 = ev.target.result.split(',')[1];
                            currentAttachments.push({ type: 'image', data: base64, mime: file.type, filename: file.name });
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    } else {
                        reader.onload = (ev) => {
                            currentAttachments.push({ type: 'text', data: ev.target.result, mime: file.type || 'text/plain', filename: file.name });
                            resolve();
                        };
                        reader.readAsText(file);
                    }
                });
            }
            showAttachmentPreview();
        };
    }
    
    function showAttachmentPreview() {
        if(!currentAttachments || currentAttachments.length === 0) {
            if (attachmentPreview) {
                attachmentPreview.style.display = 'none';
                attachmentPreview.innerHTML = '';
            }
            return;
        }
        if(attachmentPreview) {
            attachmentPreview.style.display = 'flex';
            attachmentPreview.innerHTML = '';
            
            currentAttachments.forEach((att, index) => {
                const item = document.createElement('div');
                item.style.cssText = "position: relative; background: #fff; padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 0.8rem; display: flex; align-items: center; gap: 5px;";
                
                let icon = '';
                if (att.type === 'image') {
                    icon = `<img src="data:${escapeHtml(att.mime)};base64,${att.data}" style="height:20px; border-radius:2px; object-fit: cover;">`;
                } else {
                    icon = '📄';
                }
                
                item.innerHTML = `${icon} <span>${escapeHtml(att.filename.substring(0,15))}${att.filename.length>15?'...':''}</span>
                                  <button onclick="removeAttachment(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0 0 0 5px; font-weight: bold;">✕</button>`;
                attachmentPreview.appendChild(item);
            });
        }
    }
    
    function clearAttachments() {
        currentAttachments = [];
        if (fileUpload) fileUpload.value = '';
        showAttachmentPreview();
    }

    // --- Sending Messages & API Integration ---
    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text && currentAttachments.length === 0) return;

        const session = sessions.find(s => s.id === activeSessionId);
        
        let activeMdl = session.model || modelSelect.value;
        if (!activeMdl || !activeMdl.includes(':')) {
            activeMdl = 'groq:llama-3.3-70b-versatile';
            session.model = activeMdl;
            modelSelect.value = activeMdl;
        }
        
        const providerData = activeMdl.split(':');
        const provider = providerData[0];
        const modelName = providerData[1];
        
        if (provider === 'gemini' && !geminiKey) {
            alert('Vui lòng cài đặt Gemini API Key để dùng mô hình này!');
            settingsModal.style.display = 'flex';
            return;
        }
        if (provider === 'deepseek' && !deepseekKey) {
            alert('Vui lòng cài đặt DeepSeek API Key để dùng mô hình này!');
            settingsModal.style.display = 'flex';
            return;
        }
        if (provider === 'groq' && !groqKey) {
            alert('Vui lòng cài đặt Groq API Key để dùng mô hình này!');
            settingsModal.style.display = 'flex';
            return;
        }

        const welcomeMsg = document.getElementById('chat-welcome-msg');
        if(welcomeMsg) welcomeMsg.remove();
        
        const attachCopy = currentAttachments.length > 0 ? [...currentAttachments] : null;
        renderMessageUI('user', text, attachCopy);
        
        if (session.messages.length === 0 && text) {
            session.title = text.substring(0, 20) + (text.length > 20 ? '...' : '');
            renderSessionList();
        }
        
        session.messages.push({ role: 'user', content: text, attachments: attachCopy });
        session.model = modelSelect.value;
        saveSessions();
        
        inputEl.value = '';
        clearAttachments();
        
        inputEl.disabled = true;
        sendBtn.disabled = true;
        typingIndicator.style.display = 'flex';
        messagesEl.scrollTop = messagesEl.scrollHeight;

        try {
            let aiResponse;
            if (provider === 'gemini') {
                aiResponse = await callGeminiAPI(modelName, session.messages, attachCopy);
            } else if (provider === 'deepseek') {
                aiResponse = await callDeepSeekAPI(modelName, session.messages, attachCopy);
            } else {
                aiResponse = await callGroqAPI(modelName, session.messages, attachCopy);
            }
            
            renderMessageUI('assistant', aiResponse);
            session.messages.push({ role: 'assistant', content: aiResponse });
            saveSessions();
            
        } catch (error) {
            console.error(error);
            renderMessageUI('assistant', `⚠️ Lỗi: ${error.message}`);
            session.messages.pop();
        } finally {
            inputEl.disabled = false;
            sendBtn.disabled = false;
            typingIndicator.style.display = 'none';
            inputEl.focus();
        }
    }

    async function callGroqAPI(model, messages, attachments) {
        const profileNotes = localStorage.getItem('ai_profile_notes') || '';
        let fullSystemPrompt = systemPrompt;
        if (profileNotes.trim()) {
            fullSystemPrompt += '\n\n--- GHI CHU TU NGUOI DUNG (AI PROFILE) ---\n' + profileNotes + '\n--- HET GHI CHU ---';
        }
        let groqMessages = [{ role: 'system', content: fullSystemPrompt }];
        
        messages.forEach(msg => {
            let content = msg.content || "";
            
            let atts = msg.attachments || (msg.attachment ? [msg.attachment] : []);
            if (atts.length > 0) {
                atts.forEach(att => {
                    if (att.type === 'image') {
                        content += "\n[Hình ảnh đính kèm không thể hiển thị lại cho model văn bản]";
                    } else if (att.type === 'text') {
                        content += `\n\n--- Dữ liệu File đính kèm (${att.filename}) ---\n${att.data}\n--- Hết File ---`;
                    }
                });
            }
            
            groqMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: content });
        });

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
            body: JSON.stringify({ model: model, messages: groqMessages })
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.error?.message || 'Lỗi kết nối Groq');
        return data.choices[0].message.content;
    }

    async function callDeepSeekAPI(model, messages, attachments) {
        const profileNotes = localStorage.getItem('ai_profile_notes') || '';
        let fullSystemPrompt = systemPrompt;
        if (profileNotes.trim()) {
            fullSystemPrompt += '\n\n--- GHI CHU TU NGUOI DUNG (AI PROFILE) ---\n' + profileNotes + '\n--- HET GHI CHU ---';
        }
        let dsMessages = [{ role: 'system', content: fullSystemPrompt }];
        
        messages.forEach(msg => {
            let content = msg.content || "";
            let atts = msg.attachments || (msg.attachment ? [msg.attachment] : []);
            atts.forEach(att => {
                if (att.type === 'text') {
                    content += '\n\n--- Dữ liệu File đính kèm (' + att.filename + ') ---\n' + att.data + '\n--- Hết File ---';
                }
            });
            dsMessages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: content });
        });

        const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + deepseekKey },
            body: JSON.stringify({ model: model, messages: dsMessages })
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.error?.message || 'Lỗi kết nối DeepSeek');
        return data.choices[0].message.content;
    }

    async function callGeminiAPI(model, messages, attachments) {
        const profileNotes = localStorage.getItem('ai_profile_notes') || '';
        let fullSystemPrompt = systemPrompt;
        if (profileNotes.trim()) {
            fullSystemPrompt += '\n\n--- GHI CHU TU NGUOI DUNG (AI PROFILE) ---\n' + profileNotes + '\n--- HET GHI CHU ---';
        }
        
        let geminiContents = [];
        messages.forEach(msg => {
            let role = msg.role === 'assistant' ? 'model' : 'user';
            let parts = [];
            
            let atts = msg.attachments || (msg.attachment ? [msg.attachment] : []);
            atts.forEach(att => {
                if (att.type === 'image') {
                    parts.push({
                        inlineData: {
                            data: att.data,
                            mimeType: att.mime
                        }
                    });
                } else if (att.type === 'text') {
                    parts.push({ text: `\n--- Dữ liệu File đính kèm (${att.filename}) ---\n${att.data}\n--- Hết File ---\n` });
                }
            });
            parts.push({ text: msg.content || "Hãy phân tích đính kèm này." });
            geminiContents.push({ role: role, parts: parts });
        });

        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: {
                    role: 'system',
                    parts: [{ text: fullSystemPrompt }]
                },
                contents: geminiContents
            })
        });
        
        const data = await res.json();
        if(!res.ok) throw new Error(data.error?.message || 'Lỗi kết nối Gemini');
        return data.candidates[0].content.parts[0].text;
    }

    // --- Events Binding ---
    if (sendBtn) sendBtn.onclick = sendMessage;
    if (inputEl) inputEl.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
    if (newChatBtn) newChatBtn.onclick = createNewSession;
    
    if (settingsBtn) settingsBtn.onclick = () => {
        if (groqKeyInput) groqKeyInput.value = groqKey;
        const geminiEl = document.getElementById('ms-gemini-key');
        if (geminiEl) geminiEl.value = geminiKey;
        if (settingsModal) settingsModal.style.display = 'flex';
    };
    if (closeSettingsBtn) closeSettingsBtn.onclick = () => { if(settingsModal) settingsModal.style.display = 'none'; };
    if (saveSettingsBtn) saveSettingsBtn.onclick = () => {
        if (groqKeyInput) {
            groqKey = groqKeyInput.value.trim();
            localStorage.setItem('groq_api_key', groqKey);
        }
        const geminiEl = document.getElementById('ms-gemini-key');
        if (geminiEl) {
            geminiKey = geminiEl.value.trim();
            localStorage.setItem('gemini_api_key', geminiKey);
        }
        if (settingsModal) settingsModal.style.display = 'none';
        loadModels();
    };
    
    if (sidebarToggle && sidebar) sidebarToggle.onclick = () => sidebar.classList.add('active');
    if (sidebarClose && sidebar) sidebarClose.onclick = () => sidebar.classList.remove('active');

    // --- AI Profile ---
    const profileBtn = document.getElementById('chat-profile-btn');
    const profileModal = document.getElementById('ai-profile-modal');
    const profileNotesEl = document.getElementById('ai-profile-notes');
    const profileSaveBtn = document.getElementById('ai-profile-save-btn');
    const profileCloseBtn = document.getElementById('ai-profile-close-btn');
    const profileClearBtn = document.getElementById('ai-profile-clear-btn');

    if (profileNotesEl) profileNotesEl.value = localStorage.getItem('ai_profile_notes') || '';
    if (profileBtn) profileBtn.onclick = () => { profileModal.style.display = 'flex'; };
    if (profileCloseBtn) profileCloseBtn.onclick = () => { profileModal.style.display = 'none'; };
    if (profileClearBtn) profileClearBtn.onclick = () => { profileNotesEl.value = ''; };
    if (profileSaveBtn) profileSaveBtn.onclick = () => {
        localStorage.setItem('ai_profile_notes', profileNotesEl.value);
        profileModal.style.display = 'none';
    };

    // --- Help Modal ---
    const helpBtn = document.getElementById('chat-help-btn');
    const helpModal = document.getElementById('ai-help-modal');
    const helpCloseBtn = document.getElementById('ai-help-close-btn');

    if (helpBtn) helpBtn.onclick = () => { helpModal.style.display = 'flex'; };
    if (helpCloseBtn) helpCloseBtn.onclick = () => { helpModal.style.display = 'none'; };

    // --- Image Viewer Modal ---
    const imageViewerModal = document.getElementById('image-viewer-modal');
    const imageViewerImg = document.getElementById('image-viewer-img');
    if (imageViewerModal) {
        imageViewerModal.onclick = () => {
            imageViewerModal.style.display = 'none';
        };
    }

    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && (e.target.classList.contains('msg-attachment') || e.target.classList.contains('preview-thumbnail'))) {
            if (imageViewerModal && imageViewerImg) {
                imageViewerImg.src = e.target.src;
                imageViewerModal.style.display = 'flex';
            }
        }
    });
});

window.copyToClipboard = function(btn) {
    const codeBlock = btn.closest('.code-box').querySelector('code');
    const text = codeBlock.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        btn.style.color = '#10b981';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
        }, 2000);
    });
};
