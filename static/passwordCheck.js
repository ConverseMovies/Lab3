document.addEventListener('DOMContentLoaded', function () {
    // Get tab_id from URL
    let urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tab_id');
    
    // If we're on the login page, check for tab_id in the 'next' parameter
    if (!tabId && window.location.pathname === '/login') {
        const nextUrl = urlParams.get('next');
        if (nextUrl) {
            const nextUrlParams = new URLSearchParams(nextUrl.split('?')[1] || '');
            tabId = nextUrlParams.get('tab_id');
        }
    }
    
    // Only generate new tab_id if we don't have one and we're not on login page
    if (!tabId && window.location.pathname !== '/login') {
        tabId = generateTabId();
        // Add tab_id to current URL without reloading
        const newUrl = addTabIdToUrl(window.location.pathname + window.location.search, tabId);
        window.history.replaceState({}, '', newUrl);
    }
    
    // Handle protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', async function (e) {
            e.preventDefault();
            
            let targetUrl = getTargetUrl(this.id);
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
                    window.location.replace(window.location.origin + targetUrl);
                } else {
                    window.location.replace('/login?next=' + encodeURIComponent(targetUrl));
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                window.location.replace('/login?next=' + encodeURIComponent(targetUrl));
            }
        });
    });

    // Handle all non-protected internal links
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        // Skip if it's a protected link or special link
        if (link.id && link.id.endsWith('-link')) return;
        if (!href || href.startsWith('http') || href.startsWith('/static/') || href === '#' || href === '/logout') return;
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let targetUrl = href;
            if (tabId) {
                targetUrl = addTabIdToUrl(targetUrl, tabId);
            }
            window.location.replace(window.location.origin + targetUrl);
        });
    });
});

function generateTabId() {
    return 'tab-' + Math.random().toString(36).substr(2, 9);
}

function addTabIdToUrl(url, tabId) {
    if (!tabId) return url;
    // Handle both relative and absolute URLs
    if (url.includes('?')) {
        return url + '&tab_id=' + tabId;
    } else {
        return url + '?tab_id=' + tabId;
    }
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