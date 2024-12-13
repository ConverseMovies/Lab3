document.addEventListener('DOMContentLoaded', function () {
    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetUrl = getTargetUrl(this.id);
            
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
                    window.location.href = targetUrl;
                } else {
                    window.location.href = `/login?next=${targetUrl}`;
                }
            })
            .catch(() => {
                window.location.href = `/login?next=${targetUrl}`;
            });
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