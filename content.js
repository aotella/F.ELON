let FILTERED_KEYWORDS = [];
let filterTimeout = null;

function containsFilteredKeywords(text) {
    const lowerText = text.toLowerCase();
    return FILTERED_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function filterPosts() {
    // Clear existing timeout
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }
    
    // Debounce the filtering
    filterTimeout = setTimeout(() => {
        const posts = document.querySelectorAll('.thing:not([data-filtered])');
        posts.forEach(post => {
            const titleElement = post.querySelector('a.title');
            if (!titleElement) return;
            
            const title = titleElement.textContent;
            if (containsFilteredKeywords(title)) {
                post.style.display = 'none';
            }
            // Mark as processed
            post.dataset.filtered = 'true';
        });
    }, 100);
}

// Listen for keyword updates from popup
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'UPDATE_KEYWORDS') {
        FILTERED_KEYWORDS = message.keywords;
        filterPosts();
    }
});

// Load initial keywords with better error handling
function initializeKeywords() {
    browser.storage.local.get('keywords')
        .then(result => {
            if (result.keywords) {
                FILTERED_KEYWORDS = result.keywords;
                filterPosts();
            }
        })
        .catch(error => {
            console.error('Error loading keywords:', error);
        });
}

// Initialize keywords
initializeKeywords();

// Observer for dynamic content
const observer = new MutationObserver(() => {
    filterPosts();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
}); 