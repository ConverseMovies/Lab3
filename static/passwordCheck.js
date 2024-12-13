document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Content Loaded");
    
    const protectedLinks = document.querySelectorAll('[id$="-link"]');
    console.log("Found protected links:", protectedLinks.length);
    
    protectedLinks.forEach(link => {
        link.addEventListener('click', async function (e) {
            console.log("Link clicked:", this.id);
            e.preventDefault();
            
            const targetUrl = getTargetUrl(this.id);
            console.log("Target URL:", targetUrl);
            
            try {
                console.log("Sending auth check...");
                const response = await fetch('/check-auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                
                console.log("Auth check response:", response.status);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                console.log("Auth data:", data);
                
                if (data.authenticated) {
                    console.log("Authenticated, redirecting to:", targetUrl);
                    // Force a proper redirect by ensuring we have the full URL
                    window.location.replace(window.location.origin + targetUrl);
                } else {
                    console.log("Not authenticated, redirecting to login");
                    window.location.replace('/login?next=' + encodeURIComponent(targetUrl));
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                window.location.replace('/login?next=' + encodeURIComponent(targetUrl));
            }
        });
    });
});

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