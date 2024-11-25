// Simple password protection for accessing protected content
const PASSWORD = "Fall2024Lab3";

function promptPassword() {
    const input = prompt("Enter the password to access protected content:");
    if (input === PASSWORD) {
        window.location.href = "protected/page1.html";
    } else {
        alert("Incorrect password!");
    }
}

function sendContactMessage(message) {
    const timestamp = new Date().toISOString();
    const url = `data:text/html,<p>Message: ${message}</p><p>Timestamp: ${timestamp}</p>`;
    alert(`Your message has been sent! You can view it at this link: ${url}`);
    window.open(url, "_blank");
}
