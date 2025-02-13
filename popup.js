// Set default keywords that will be used on first install
const DEFAULT_KEYWORDS = ['elon', 'musk', 'elon musk'];
let FILTERED_KEYWORDS = [];

function addKeyword(keyword) {
    keyword = keyword.trim().toLowerCase();
    if (!keyword) {
        showMessage('Please enter a keyword');
        return;
    }
    if (FILTERED_KEYWORDS.includes(keyword)) {
        showMessage('Keyword already exists');
        return;
    }
    if (keyword.length < 2) {
        showMessage('Keyword must be at least 2 characters');
        return;
    }
    
    FILTERED_KEYWORDS.push(keyword);
    updateKeywordList();
    saveKeywords();
    showMessage('Keyword added successfully', 'success');
    document.querySelector('.keyword-input').value = '';
}

function removeKeyword(keyword) {
    FILTERED_KEYWORDS = FILTERED_KEYWORDS.filter(k => k !== keyword);
    updateKeywordList();
    saveKeywords();
}

function updateKeywordList() {
    const keywordList = document.querySelector('.keyword-list');
    keywordList.innerHTML = FILTERED_KEYWORDS.map(keyword => `
        <div class="keyword-item">
            ${keyword}
            <span class="remove-keyword" data-keyword="${keyword}">×</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.remove-keyword').forEach(button => {
        button.addEventListener('click', (e) => {
            removeKeyword(e.target.dataset.keyword);
            e.stopPropagation();
        });
    });
}

function saveKeywords() {
    return browser.storage.local.set({ keywords: FILTERED_KEYWORDS })
        .then(() => {
            // Notify content script to update
            return browser.tabs.query({active: true, currentWindow: true});
        })
        .then((tabs) => {
            if (tabs[0]) {
                return browser.tabs.sendMessage(tabs[0].id, {
                    type: 'UPDATE_KEYWORDS',
                    keywords: FILTERED_KEYWORDS
                });
            }
        })
        .catch(error => console.error('Error saving keywords:', error));
}

function loadKeywords() {
    return browser.storage.local.get('keywords')
        .then(result => {
            if (result.keywords) {
                FILTERED_KEYWORDS = result.keywords;
            } else {
                // If no keywords found, use defaults and save them
                FILTERED_KEYWORDS = DEFAULT_KEYWORDS;
                return saveKeywords();
            }
        })
        .then(() => {
            updateKeywordList();
        })
        .catch(error => {
            console.error('Error loading keywords:', error);
            // If there's an error, use default keywords
            FILTERED_KEYWORDS = DEFAULT_KEYWORDS;
            updateKeywordList();
        });
}

function showMessage(message, type = 'error') {
    const messageElement = document.querySelector('.message') || createMessageElement();
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    setTimeout(() => messageElement.className = 'message hidden', 3000);
}

function createMessageElement() {
    const messageElement = document.createElement('div');
    messageElement.className = 'message hidden';
    document.querySelector('.keyword-filter-box').prepend(messageElement);
    return messageElement;
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.keyword-input');
    const addButton = document.querySelector('#add-keyword');
    
    addButton.addEventListener('click', () => addKeyword(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addKeyword(input.value);
        }
    });
    
    loadKeywords();
}); 