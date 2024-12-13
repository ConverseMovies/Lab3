document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('tab_id');
    
    // Handle protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', async function (e) {
            console.log("Protected link clicked:", this.id);
            e.preventDefault();
            
            let targetUrl = getTargetUrl(this.id);
            if (tabId) {
                targetUrl = addTabIdToUrl(targetUrl, tabId);
            }
            console.log("Target URL with tab:", targetUrl);
            
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

    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        // Skip if it's a protected link, external link, or special link
        if (href && 
            !link.id.endsWith('-link') && 
            !href.startsWith('http') && 
            href !== '#' && 
            href !== '/logout') {
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                let targetUrl = href;
                
                // Add tab_id if we have one and there's an active session
                    targetUrl = addTabIdToUrl(targetUrl, tabId);
                
                window.location.replace(window.location.origin + targetUrl);
            });
        }
    });
});


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