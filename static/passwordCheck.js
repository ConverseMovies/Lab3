document.addEventListener('DOMContentLoaded', function () {
    // Get the current tab_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('tab_id');
    
    // Handle all navigation links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', async function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's a logout link, external link, or static page
            if (href === '#' || href.startsWith('http') || href === '/logout' || href.startsWith('/static/')) {
                return;
            }

            e.preventDefault();
            let targetUrl = href;

            // If this is a protected link
            if (this.id && this.id.endsWith('-link')) {
                targetUrl = getTargetUrl(this.id);
                // Add tab_id if we have one
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
                return;
            }
            
            // For non-protected pages, just add tab_id if we have one
            if (tabId) {
                targetUrl = addTabIdToUrl(targetUrl, tabId);
            }
            
            window.location.href = targetUrl;
        });
    });
});

function addTabIdToUrl(url, tabId) {
    if (!tabId) return url;
    
    // Handle both relative and absolute URLs
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