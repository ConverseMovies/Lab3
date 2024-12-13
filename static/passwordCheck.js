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
                    // User is already authenticated
                    window.location.replace(window.location.origin + targetUrl);
                } else {
                    // Prompt user for password
                    const password = prompt("Enter the password:");
                    if (password) {
                        const authResponse = await fetch('/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            body: JSON.stringify({ password }),
                            credentials: 'same-origin'
                        });
                        
                        if (authResponse.ok) {
                            const authData = await authResponse.json();
                            if (authData.success) {
                                // Redirect to the target URL after successful login
                                window.location.replace(window.location.origin + targetUrl);
                            } else {
                                alert("Incorrect password. Access denied.");
                            }
                        } else {
                            throw new Error('Login request failed');
                        }
                    }
                }
            } catch (error) {
                console.error('Auth check or login failed:', error);
                alert("An error occurred. Please try again.");
            }
        });
    });

    // Handle all other internal links (non-protected)
    document.querySelectorAll('a:not([id$="-link"])').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('/static/') && href !== '#' && href !== '/logout') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                let targetUrl = href;
                if (tabId) {
                    targetUrl = addTabIdToUrl(targetUrl, tabId);
                }
                console.log("Non-protected link clicked, redirecting to:", targetUrl);
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
