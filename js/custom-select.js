document.addEventListener('DOMContentLoaded', () => {
    const originalSelect = document.getElementById('ai-model-select');
    if (!originalSelect) return;

    // Hide original select completely but keep it in DOM
    originalSelect.style.display = 'none';

    // Create container
    const container = document.createElement('div');
    container.className = 'custom-select-container';
    originalSelect.parentNode.insertBefore(container, originalSelect);
    
    // Create trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    container.appendChild(trigger);
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    container.appendChild(dropdown);

    // Populate options from original select
    const optgroups = originalSelect.querySelectorAll('optgroup');
    
    function updateTriggerText(text) {
        // Strip out the bracketed part e.g. [TOP 1] for cleaner display on mobile
        let cleanText = text;
        if (window.innerWidth <= 420) {
            cleanText = text.replace(/\[.*?\]\s*/, '').split('-')[0].trim();
        }
        trigger.textContent = cleanText;
    }

    // Set initial text
    if (originalSelect.options[originalSelect.selectedIndex]) {
        updateTriggerText(originalSelect.options[originalSelect.selectedIndex].text);
    }

    const allOptionElements = [];

    optgroups.forEach(group => {
        const groupLabel = document.createElement('div');
        groupLabel.className = 'custom-select-group';
        groupLabel.textContent = group.label;
        dropdown.appendChild(groupLabel);

        const options = group.querySelectorAll('option');
        options.forEach(opt => {
            const optionEl = document.createElement('div');
            optionEl.className = 'custom-select-option';
            optionEl.textContent = opt.text;
            if (opt.selected) {
                optionEl.classList.add('selected');
            }
            
            optionEl.addEventListener('click', () => {
                // Update selected visually
                allOptionElements.forEach(el => el.classList.remove('selected'));
                optionEl.classList.add('selected');
                
                // Update trigger text
                updateTriggerText(opt.text);
                
                // Update original select and dispatch event
                originalSelect.value = opt.value;
                originalSelect.dispatchEvent(new Event('change'));
                
                // Close dropdown
                container.classList.remove('open');
            });
            
            allOptionElements.push(optionEl);
            dropdown.appendChild(optionEl);
        });
    });

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        container.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
        container.classList.remove('open');
    });
});
