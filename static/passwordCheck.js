document.addEventListener('DOMContentLoaded', function () {
    // Function to handle password-protected links
    function setupPasswordProtectedLink(linkId) {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault(); // Prevent default behavior
                const password = prompt("Enter the password to access this page:");
                if (password) {
                    if(linkId=='logs-link'){
                        thingToFetch='/logs';

                    }
                    else if(linkId=='lab1-link' || linkId=='lab1-link-lower'){
                        thingToFetch='/lab1';
                    }
                    else if(linkId=='lab2-link' || linkId=='lab2-link-lower'){
                        thingToFetch='/lab2';
                    }
                    else if(linkId=='lab3-link' || linkId=='lab3-link-lower'){
                        thingToFetch='/lab3';
                    }
                    else{
                        thingToFetch='/aetas';
                    }
                    fetch(thingToFetch, {
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


    //LOGS LINK
    setupPasswordProtectedLink('logs-link');
    // Setup links
    setupPasswordProtectedLink('lab1-link');
    setupPasswordProtectedLink('lab1-link-lower'); // For additional Lab 1 links

    setupPasswordProtectedLink('lab2-link');
    setupPasswordProtectedLink('lab2-link-lower');

    setupPasswordProtectedLink('lab3-link');
    setupPasswordProtectedLink('lab3-link-lower');

    setupPasswordProtectedLink('aetas-link');
    setupPasswordProtectedLink('aetas-link-lower');


});
