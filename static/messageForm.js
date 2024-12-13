document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('message-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        const messageInput = document.getElementById('message-input');
        const messageStatus = document.getElementById('message-status');
        const emailRecipient = document.getElementById('email-recipient').value;

        // Check if the message input is empty
        if (!messageInput.value.trim()) {
            // Show an error message if the input is empty
            messageStatus.style.display = 'block';
            messageStatus.style.color = 'red';
            messageStatus.textContent = 'Message cannot be empty!';
            
            // Hide the message after 3 seconds
            setTimeout(() => {
                messageStatus.style.display = 'none';
            }, 3000);
            return; // Exit the function early
        }

        // Send the message to the server
        fetch('/submit-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ message: messageInput.value })
        })
        .then(response => {
            if (response.ok) {
                // Send the email
                return fetch('https://formsubmit.co/ajax/' + emailRecipient, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: messageInput.value })
                });
            } else {
                throw new Error('Failed to send message to the server.');
            }
        })
        .then(response => {
            if (response.ok) {
                // Clear the input field and show a success message
                messageInput.value = '';
                messageStatus.style.display = 'block';
                messageStatus.style.color = 'green';
                messageStatus.textContent = 'Message sent!';
                
                // Hide the message after 3 seconds
                setTimeout(() => {
                    messageStatus.style.display = 'none';
                }, 3000);
            } else {
                throw new Error('Failed to send email.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageStatus.style.display = 'block';
            messageStatus.style.color = 'red';
            messageStatus.textContent = 'Failed to send message. Please try again.';
        });
    });
});
