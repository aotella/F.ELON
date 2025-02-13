// Types and Constants
/** @typedef {'old' | 'new'} RedditVersion */

const REDDIT_SELECTORS = {
    post: {
        old: '.thing:not([data-filtered])',
        new: 'shreddit-post:not([data-filtered]), [data-testid="post-container"]:not([data-filtered])'
    },
    title: {
        old: 'a.title',
        new: 'a[data-ks-id], [slot="title"], faceplate-screen-reader-content'
    },
    layout: {
        content: '.content[role="main"]',
        siteTable: '#siteTable',
        side: '.side',
        listing: '.listing-page'
    }
};

const STYLE_OVERRIDES = {
    content: 'width: 100% !important; margin-right: 0 !important; float: none !important;',
    siteTable: 'width: 100% !important; float: none !important; margin-right: 0 !important;',
    side: 'float: right !important; margin-left: 0 !important; clear: right !important;',
    listing: 'width: 100% !important; float: none !important;',
    hiddenPost: 'height: 0 !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; overflow: hidden !important;'
};

// State management
const state = {
    filteredKeywords: [],
    filterTimeout: null
};

// Pure utility functions
const isNewReddit = () => window.location.hostname === 'www.reddit.com';

const getSelectors = () => ({
    post: isNewReddit() ? REDDIT_SELECTORS.post.new : REDDIT_SELECTORS.post.old,
    title: isNewReddit() ? REDDIT_SELECTORS.title.new : REDDIT_SELECTORS.title.old
});

const containsFilteredKeywords = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return state.filteredKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

// DOM manipulation functions
const applyStyles = (element, styles) => {
    if (element) element.style.cssText = styles;
};

const hideElement = (element, isOldReddit) => {
    if (!element) return;

    if (isOldReddit) {
        applyStyles(element, STYLE_OVERRIDES.hiddenPost);
        // Hide all direct children except clearleft
        Array.from(element.children)
            .filter(child => !child.classList.contains('clearleft'))
            .forEach(child => child.style.display = 'none');
    } else {
        element.style.display = 'none';
    }
    element.dataset.filtered = 'true';
};

const fixOldRedditLayout = () => {
    if (isNewReddit()) return;

    applyStyles(document.querySelector(REDDIT_SELECTORS.layout.content), STYLE_OVERRIDES.content);
    applyStyles(document.getElementById('siteTable'), STYLE_OVERRIDES.siteTable);
    applyStyles(document.querySelector(REDDIT_SELECTORS.layout.side), STYLE_OVERRIDES.side);
    applyStyles(document.querySelector(REDDIT_SELECTORS.layout.listing), STYLE_OVERRIDES.listing);
};

// Post filtering logic
const getTitleText = (post, selectors) => {
    if (isNewReddit()) {
        const titleElement = post.querySelector(selectors.title);
        if (titleElement) return titleElement.textContent || titleElement.innerText;

        const linkElement = post.querySelector('a[data-ks-id]');
        if (linkElement) {
            const screenReader = linkElement.querySelector('faceplate-screen-reader-content');
            return screenReader ? screenReader.textContent : linkElement.textContent;
        }
    }
    
    const titleElement = post.querySelector(selectors.title);
    return titleElement ? titleElement.textContent : '';
};

const filterPosts = () => {
    if (state.filterTimeout) clearTimeout(state.filterTimeout);
    
    state.filterTimeout = setTimeout(() => {
        const isOld = !isNewReddit();
        const selectors = getSelectors();
        const posts = document.querySelectorAll(selectors.post);
        
        posts.forEach(post => {
            if (post.dataset.filtered === 'true') return;
            
            const titleText = getTitleText(post, selectors);
            if (!containsFilteredKeywords(titleText)) return;

            if (isOld) {
                hideElement(post, true);
            } else {
                const container = post.closest('shreddit-post') || 
                                post.closest('[data-testid="post-container"]') ||
                                post;
                hideElement(container, false);
            }
        });

        if (isOld) fixOldRedditLayout();
    }, 100);
};

// Event handlers and initialization
const handleKeywordUpdate = (message) => {
    if (message.type === 'UPDATE_KEYWORDS') {
        state.filteredKeywords = message.keywords;
        filterPosts();
    }
};

const initializeKeywords = async () => {
    try {
        const result = await browser.storage.local.get('keywords');
        if (result.keywords) {
            state.filteredKeywords = result.keywords;
            filterPosts();
        }
    } catch (error) {
        console.error('Error loading keywords:', error);
    }
};

const setupMutationObserver = () => {
    const observer = new MutationObserver((mutations) => {
        const hasNewPosts = mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return false;
                const selector = getSelectors().post;
                return node.matches(selector) || node.querySelector(selector);
            })
        );
        
        if (hasNewPosts) filterPosts();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

// Initialize extension
const initialize = () => {
    browser.runtime.onMessage.addListener(handleKeywordUpdate);
    initializeKeywords();
    setupMutationObserver();

    if (!isNewReddit()) {
        if (document.readyState === 'complete') {
            fixOldRedditLayout();
        } else {
            window.addEventListener('load', fixOldRedditLayout);
        }
    }
};

initialize(); 