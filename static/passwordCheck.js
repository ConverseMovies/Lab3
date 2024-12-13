document.addEventListener('DOMContentLoaded', function () {
    // Check if we need to authenticate this tab
    if (!sessionStorage.getItem('tabAuthenticated')) {
        // If we're not on the login page, we need to check auth
        if (!window.location.pathname.includes('/login')) {
            checkAuthAndRedirect();
        }
    }

    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            if (!sessionStorage.getItem('tabAuthenticated')) {
                const targetUrl = getTargetUrl(this.id);
                window.location.href = `/login?next=${encodeURIComponent(targetUrl)}`;
            } else {
                handleProtectedLink(this.id);
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
        if (!data.authenticated && isProtectedPage()) {
            window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        } else if (data.authenticated) {
            sessionStorage.setItem('tabAuthenticated', 'true');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        sessionStorage.removeItem('tabAuthenticated');
    });
}

function isProtectedPage() {
    const protectedPaths = [
        '/lab1_summary',
        '/lab2_summary',
        '/lab3_summary',
        '/aetas_summary',
        '/logs_list'
    ];
    return protectedPaths.some(path => window.location.pathname.includes(path));
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