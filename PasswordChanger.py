import os

def read_password(file_path):
    """Read the current password from a file."""
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            f.write("defaultpassword")  # Default password if none exists
    
    with open(file_path, 'r') as f:
        return f.read().strip()

def write_password(file_path, new_password):
    """Write the new password to the file."""
    with open(file_path, 'w') as f:
        f.write(new_password)

def update_password():
    """Main function to handle password update."""
    password_file = "password.txt"  # Name of the file storing the password

    # Read the current password
    current_password = read_password(password_file)

    # Prompt the user for the old password
    old_password = input("Enter the current password: ").strip()

    # Check if the entered password is correct
    if old_password == current_password:
        # Prompt for a new password
        new_password = input("Enter the new password: ").strip()

        # Confirm the new password
        confirm_password = input("Confirm the new password: ").strip()

        if new_password == confirm_password:
            # Update the password file
            write_password(password_file, new_password)
            print("Password updated successfully!")
        else:
            print("Error: Passwords do not match. Please try again.")
    else:
        print("Error: Incorrect password. Access denied.")

if __name__ == "__main__":
    update_password()
