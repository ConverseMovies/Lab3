document.addEventListener('DOMContentLoaded', function () {
    // Get the current tab_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('tab_id');
    
    // Handle all navigation links, not just protected ones
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', async function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's a logout link or external link
            if (href === '#' || href.startsWith('http') || href === '/logout') {
                return;
            }

            // Skip modification for static team pages
            if (href.startsWith('/static/')) {
                return;
            }

            e.preventDefault();
            let targetUrl = href;

            // If this is a protected link (ends with -link)
            if (this.id && this.id.endsWith('-link')) {
                targetUrl = getTargetUrl(this.id);
                
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
                    
                    if (!data.authenticated) {
                        window.location.href = `/login?next=${encodeURIComponent(addTabIdToUrl(targetUrl, tabId))}`;
                        return;
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    window.location.href = `/login?next=${encodeURIComponent(addTabIdToUrl(targetUrl, tabId))}`;
                    return;
                }
            }
            
            // Add tab_id to all internal navigation if we have one
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