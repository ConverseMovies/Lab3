document.addEventListener('DOMContentLoaded', function () {
    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetUrl = getTargetUrl(this.id);
            
            // Check if we're authenticated
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
                    handleProtectedLink(this.id);
                } else {
                    window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
            });
        });
    });
});

function handleProtectedLink(linkId) {
    let thingToFetch;
    if (linkId.includes('logs-link')) {
        thingToFetch = '/logs';
    } else if (linkId.includes('lab1-link')) {
        thingToFetch = '/lab1';
    } else if (linkId.includes('lab2-link')) {
        thingToFetch = '/lab2';
    } else if (linkId.includes('lab3-link')) {
        thingToFetch = '/lab3';
    } else if (linkId.includes('aetas-link')) {
        thingToFetch = '/aetas';
    }

    if (thingToFetch) {
        window.location.href = thingToFetch;
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