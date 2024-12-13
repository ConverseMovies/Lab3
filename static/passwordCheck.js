document.addEventListener('DOMContentLoaded', function () {
    // Get or generate tab_id immediately
    let urlParams = new URLSearchParams(window.location.search);
    let tabId = urlParams.get('tab_id');
    
    // If no tab_id exists yet, generate one and add it to the URL
    if (!tabId) {
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
            targetUrl = addTabIdToUrl(targetUrl, tabId);
            
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
            const targetUrl = addTabIdToUrl(href, tabId);
            window.location.replace(window.location.origin + targetUrl);
        });
    });
});

// Generate a random tab ID
function generateTabId() {
    return 'tab-' + Math.random().toString(36).substr(2, 9);
}

function addTabIdToUrl(url, tabId) {
    if (!tabId) return url;
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