// Function to fetch the password from password.txt and validate the user input
async function promptPassword() {
    try {
        // Fetch the password from password.txt
        const response = await fetch("password.txt");
        if (!response.ok) {
            throw new Error("Failed to load the password file");
        }

        // Get the password text
        const storedPassword = await response.text();
        const trimmedPassword = storedPassword.trim(); // Remove any extra whitespace

        // Prompt the user for the password
        const input = prompt("Enter the password to access protected content:");

        // Validate the password
        if (input === trimmedPassword) {
            window.location.href = "protected/page1.html";
        } else {
            alert("Incorrect password!");
        }
    } catch (error) {
        console.error("Error fetching password:", error);
        alert("An error occurred. Please try again later.");
    }
}
