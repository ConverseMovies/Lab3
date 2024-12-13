document.addEventListener('DOMContentLoaded', function () {
    // Get tab_id from URL or localStorage as backup
    let urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tab_id');
    
    // If we have a tabId in URL, store it
    if (tabId) {
        localStorage.setItem('currentTabId', tabId);
    } else {
        // If not in URL but in localStorage, use that
        tabId = localStorage.getItem('currentTabId');
    }
    
    // Handle protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', async function (e) {
            e.preventDefault();
            
            let targetUrl = getTargetUrl(this.id);
            // Always add the stored tabId for protected pages
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

    // Handle non-protected internal links
    document.querySelectorAll('a:not([id$="-link"])').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('/static/') && href !== '#' && href !== '/logout') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                let targetUrl = href;
                // Keep tab_id in URL even for non-protected pages
                if (tabId) {
                    targetUrl = addTabIdToUrl(targetUrl, tabId);
                }
                window.location.replace(window.location.origin + targetUrl);
            });
        }
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