document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('message-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        const messageInput = document.getElementById('message-input');
        const messageStatus = document.getElementById('message-status');
        const emailRecipient = document.getElementById('email-recipient').value;
        const recipientName = document.getElementById('recipient-name').value;
        const sendButton = document.querySelector('.send-msg-btn'); // Button selector

        // Check if the message input is empty
        if (!messageInput.value.trim()) {
            messageStatus.style.display = 'block';
            messageStatus.style.color = 'red';
            messageStatus.textContent = 'Message cannot be empty!';
            
            setTimeout(() => {
                messageStatus.style.display = 'none';
            }, 3000);
            return;
        }

        // Disable the button and gray out the textarea
        sendButton.disabled = true;
        sendButton.style.backgroundColor = '#cccccc'; // Optional: change to a disabled-looking color
        messageInput.style.backgroundColor = '#dddddd'; // Gray out the textarea
        messageInput.style.pointerEvents = 'none'; // Prevent further typing

        // Send the message to the server
        fetch('/submit-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ 
                message: messageInput.value,
                sender: recipientName
            })
        })
        .then(response => {
            if (response.ok) {
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
                messageInput.value = ''; // Clear the input field
                messageInput.style.backgroundColor = ''; // Reset the background color
                messageInput.style.pointerEvents = 'auto'; // Enable typing again

                sendButton.disabled = false; // Enable the button
                sendButton.style.backgroundColor = ''; // Reset button color

                messageStatus.style.display = 'block';
                messageStatus.style.color = 'green';
                messageStatus.textContent = 'Message sent!';
                
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
            
            // Re-enable input and button after error
            messageInput.style.backgroundColor = '';
            messageInput.style.pointerEvents = 'auto';
            sendButton.disabled = false;
            sendButton.style.backgroundColor = '';
        });
    });
});
