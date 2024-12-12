document.addEventListener('DOMContentLoaded', function () {
    // Function to handle password-protected links
    function setupPasswordProtectedLink(linkId) {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent default behavior
                const password = prompt("Enter the password to access this page:");
                if (password) {
                    fetch('/lab1', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ password: password })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            window.location.href = data.redirect_url; // Redirect on success
                        } else {
                            alert("Incorrect password. Please try again.");
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        }
    }

    // Setup links
    setupPasswordProtectedLink('lab1-link');
    setupPasswordProtectedLink('lab1-link-lower'); // For additional Lab 1 links
    setupPasswordProtectedLink('lab1-link-gavin');
    setupPasswordProtectedLink('lab1-link-elizabeth');
    setupPasswordProtectedLink('lab1-link-luke');
    setupPasswordProtectedLink('lab1-link-kaylee');
});
