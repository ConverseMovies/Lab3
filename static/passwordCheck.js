document.addEventListener('DOMContentLoaded', function () {
    // Get or extract tab_id
    let tabId = extractTabId(window.location.href);
    
    // Only generate new if we don't have one and we're not on login page
    if (!tabId && window.location.pathname !== '/login') {
        tabId = 'tab-' + Math.random().toString(36).substr(2, 9);
        // Add tab_id to current URL without reloading
        const newUrl = cleanAndAddTabId(window.location.pathname + window.location.search, tabId);
        window.history.replaceState({}, '', newUrl);
    }
    
    // Handle protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', async function (e) {
            e.preventDefault();
            
            let targetUrl = getTargetUrl(this.id);
            if (tabId) {
                targetUrl = cleanAndAddTabId(targetUrl, tabId);
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
                    window.location.replace(window.location.origin + targetUrl);
                } else {
                    const loginUrl = '/login?next=' + encodeURIComponent(targetUrl);
                    window.location.replace(loginUrl);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                window.location.replace('/login?next=' + encodeURIComponent(targetUrl));
            }
        });
    });

    // Handle non-protected links
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (link.id && link.id.endsWith('-link')) return;
        if (!href || href.startsWith('http') || href.startsWith('/static/') || href === '#' || href === '/logout') return;
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let targetUrl = href;
            if (tabId) {
                targetUrl = cleanAndAddTabId(targetUrl, tabId);
            }
            window.location.replace(window.location.origin + targetUrl);
        });
    });
});

// Extract tab_id from URL, including from 'next' parameter if on login page
function extractTabId(url) {
    const urlObj = new URL(url, window.location.origin);
    
    // First check direct tab_id in URL
    let tabId = urlObj.searchParams.get('tab_id');
    
    // If we're on login page and no direct tab_id, check 'next' parameter
    if (!tabId && urlObj.pathname === '/login') {
        const nextParam = urlObj.searchParams.get('next');
        if (nextParam) {
            // Try to extract tab_id from the 'next' URL
            const nextUrl = new URL(nextParam, window.location.origin);
            tabId = nextUrl.searchParams.get('tab_id');
        }
    }
    
    return tabId;
}

// Clean URL and add tab_id
function cleanAndAddTabId(url, tabId) {
    if (!tabId) return url;
    
    // Parse the URL
    const urlObj = new URL(url, window.location.origin);
    
    // Remove any existing tab_id parameters
    urlObj.searchParams.delete('tab_id');
    
    // Add the new tab_id
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