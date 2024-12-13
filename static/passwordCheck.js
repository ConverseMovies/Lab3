document.addEventListener('DOMContentLoaded', function () {
    // Get the current tab_id from URL or create new one
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('tab_id');
    
    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', async function (e) {
            e.preventDefault();
            let targetUrl = getTargetUrl(this.id);
            
            // Add tab_id to targetUrl if we have one
            if (tabId) {
                targetUrl = addTabIdToUrl(targetUrl, tabId);
            }
            
            try {
                const response = await fetch('/check-auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                
                if (data.authenticated) {
                    window.location.href = targetUrl;
                } else {
                    window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
            }
        });
    });
});

// Helper function to add tab_id to URLs
function addTabIdToUrl(url, tabId) {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('tab_id', tabId);
    return urlObj.pathname + urlObj.search;
}

function getTargetUrl(linkId) {
    const urlMap = {
        'logs-link': '/logs_list',
        'lab1-link': '/lab1_summary',
        'lab2-link': '/lab2_summary',
        'lab3-link': '/lab3_summary',
        'aetas-link': '/aetas_summary',
    };
    return urlMap[linkId] || '/';
}