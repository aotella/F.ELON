// Handle installation and updates
browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
        // Set default keywords on installation
        await browser.storage.local.set({
            keywords: ['elon musk', 'musk', 'tesla ceo', 'spacex ceo']
        });
    }
});

// Listen for messages from popup
browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === 'GET_KEYWORDS') {
        try {
            const result = await browser.storage.local.get('keywords');
            return { keywords: result.keywords || [] };
        } catch (error) {
            console.error('Error getting keywords:', error);
            return { keywords: [] };
        }
    }
}); 