document.addEventListener('DOMContentLoaded', function () {
    // Check if this is a new tab session
    if (!sessionStorage.getItem('tabAuthenticated')) {
        // Force a new authentication check
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
                sessionStorage.setItem('tabAuthenticated', 'true');
            } else {
                // Clear any existing authentication
                sessionStorage.removeItem('tabAuthenticated');
                // If on a protected page, redirect to login
                if (isProtectedPage()) {
                    window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
                }
            }
        });
    }

    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            handleProtectedLink(this.id);
        });
    });
});

function isProtectedPage() {
    // List of protected paths
    const protectedPaths = [
        '/lab1_summary',
        '/lab2_summary',
        '/lab3_summary',
        '/aetas_summary',
        '/logs_list'
    ];
    return protectedPaths.some(path => window.location.pathname.startsWith(path));
}

function handleProtectedLink(linkId) {
    if (!sessionStorage.getItem('tabAuthenticated')) {
        const targetUrl = getTargetUrl(linkId);
        window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
        return;
    }

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
        fetch(thingToFetch, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.status === 401) {
                sessionStorage.removeItem('tabAuthenticated');
                window.location.href = `/login?next=${encodeURIComponent(thingToFetch)}`;
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                window.location.href = data.redirect_url;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            sessionStorage.removeItem('tabAuthenticated');
        });
    }
}

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