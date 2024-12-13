document.addEventListener('DOMContentLoaded', function () {
    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetUrl = getTargetUrl(this.id);
            
            // Check if we're authenticated first
            fetch('/check-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    // If authenticated, go directly to the page
                    window.location.href = targetUrl;
                } else {
                    // If not authenticated, go to login with relative path
                    window.location.href = `/login?next=${targetUrl}`;
                }
            })
            .catch(() => {
                // On error, go to login
                window.location.href = `/login?next=${targetUrl}`;
            });
        });
    });
});

function getTargetUrl(linkId) {
    const urlMap = {
        'logs-link': '/logs_list',
        'lab1-link': '/lab1_summary',
        'lab1-link-lower': '/lab1_summary',
        'lab2-link': '/lab2_summary',
        'lab2-link-lower': '/lab2_summary',
        'lab3-link': '/lab3_summary',
        'lab3-link-lower': '/lab3_summary',
        'aetas-link': '/aetas_summary',
        'aetas-link-lower': '/aetas_summary'
    };
    return urlMap[linkId] || '/';
}