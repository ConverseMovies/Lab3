document.addEventListener('DOMContentLoaded', function () {
    // If we're not on the login page, check authentication
    if (!window.location.pathname.includes('/login')) {
        // Always check auth when loading a new page
        checkAuthAndRedirect();
    }

    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetUrl = getTargetUrl(this.id);
            
            // If we're already authenticated, navigate directly
            if (sessionStorage.getItem('tabAuthenticated')) {
                handleProtectedLink(this.id);
            } else {
                window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
            }
        });
    });
});

function checkAuthAndRedirect() {
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
            // If server says we're authenticated, set the tab session
            sessionStorage.setItem('tabAuthenticated', 'true');
        } else if (isProtectedPage()) {
            // If we're not authenticated and on a protected page, redirect to login
            sessionStorage.removeItem('tabAuthenticated');
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (isProtectedPage()) {
            sessionStorage.removeItem('tabAuthenticated');
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
    });
}

function isProtectedPage() {
    const protectedPaths = [
        '/lab1_summary',
        '/lab2_summary',
        '/lab3_summary',
        '/aetas_summary',
        '/logs_list',
        '/lab1',
        '/lab2',
        '/lab3',
        '/aetas',
        '/logs'
    ];
    return protectedPaths.some(path => window.location.pathname.startsWith(path));
}

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