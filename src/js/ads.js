const AdConfig = {
    isTestMode: false,
    slots: {
        'header-ad': {
            slotId: '5685335273',
            sizes: [[728, 90], [320, 50]],
            layout: 'responsive'
        },
        'footer-ad': {
            slotId: '5685335273',
            sizes: [[728, 90], [320, 50]],
            layout: 'responsive'
        }
    }
};

function initializeAds() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        (adsbygoogle = window.adsbygoogle || []).push({});
    });
}

document.addEventListener('DOMContentLoaded', initializeAds);
export { AdConfig, initializeAds };
