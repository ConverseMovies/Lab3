document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('tab_id');
    
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
        // Skip if it's already a protected link
        if (link.id && link.id.endsWith('-link')) {
            return;
        }

        const href = link.getAttribute('href');
        // Check if this is an internal link we should handle
        if (href && 
            !href.startsWith('http') && 
            !href.startsWith('/static/') && 
            href !== '#' && 
            href !== '/logout') {
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Non-protected link clicked:", href); // Debug log
                let targetUrl = href;
                if (tabId) {
                    targetUrl = addTabIdToUrl(targetUrl, tabId);
                    console.log("Added tab_id, new URL:", targetUrl); // Debug log
                }
                window.location.replace(window.location.origin + targetUrl);
            });
        }
    });
});

function addTabIdToUrl(url, tabId) {
    if (!tabId) return url;
    // Handle both relative and absolute URLs
    if (url.startsWith('http')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('tab_id', tabId);
        return urlObj.pathname + urlObj.search;
    } else {
        if (url.includes('?')) {
            return url + '&tab_id=' + tabId;
        } else {
            return url + '?tab_id=' + tabId;
        }
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