document.addEventListener('DOMContentLoaded', function () {
    // Generate a unique tab ID when the page loads
    if (!sessionStorage.getItem('tabId')) {
        sessionStorage.setItem('tabId', generateTabId());
    }
    
    // Check authentication status when page loads
    checkAuthStatus();

    // Handle clicks on protected links
    document.querySelectorAll('[id$="-link"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const linkId = this.id;
            handleProtectedLink(linkId);
        });
    });
});

function generateTabId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function checkAuthStatus() {
    const tabId = sessionStorage.getItem('tabId');
    
    fetch('/check-auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ tabId: tabId })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.authenticated) {
            // Clear any stored authentication data
            sessionStorage.removeItem('authenticated');
            console.log('User not authenticated');
        } else {
            sessionStorage.setItem('authenticated', 'true');
        }
    })
    .catch(error => console.error('Error checking auth status:', error));
}

function handleProtectedLink(linkId) {
    const tabId = sessionStorage.getItem('tabId');
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
            },
            body: JSON.stringify({ tabId: tabId })
        })
        .then(response => {
            if (response.status === 401) {
                // Redirect to login if not authenticated
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
        .catch(error => console.error('Error:', error));
    }
}