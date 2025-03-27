const AdConfig = {
    isTestMode: true,
    slots: {
        'test-slot-1': {
            sizes: [[728, 90], [320, 50]],
            layout: 'responsive'
        }
    }
};

function initializeAds() {
    const adContainers = document.querySelectorAll('.ad-container');
    
    adContainers.forEach(container => {
        const adSlot = container.dataset.adSlot;
        if (adSlot && AdConfig.slots[adSlot]) {
            const adInsElement = container.querySelector('.adsbygoogle');
            if (adInsElement) {
                // Push test ad configuration
                (adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "ca-pub-6398161093512510",
                    enable_page_level_ads: true,
                    google_adtest: "on", // Enable test mode
                    overlays: {bottom: true}
                });
            }
        }
    });
}

// Initialize ads when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAds);

export { AdConfig, initializeAds };
