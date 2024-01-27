// errorManager.js

// Variable to hold the global error message
let globalErrorMessage = '';

// Function to set and display the global error message
export function setGlobalErrorMessage(message) {
    globalErrorMessage = message;
    displayErrorMessage(message); // Display the message when it's set
}

// Function to clear the global error message
export function clearGlobalErrorMessage() {
    globalErrorMessage = ''; // Clear the message
    removeErrorMessage(); // Remove the message from the DOM
}

// Function to display the error message in the UI
function displayErrorMessage(errorMessage) {
    removeErrorMessage(); // Remove existing error message if present

    if (errorMessage) {
        const errorContainer = document.createElement('div');
        errorContainer.setAttribute('id', 'errorContainer');
        errorContainer.style.color = 'red';
        errorContainer.style.fontWeight = 'bold';
        errorContainer.style.marginTop = '20px';
        errorContainer.innerHTML = `<div class="file-error" style="color: red;">⚠️ ${errorMessage} ,<br> please check out 'how to use' for more details </div>`;

        const mainElement = document.querySelector('main');
        const firstChild = mainElement.firstChild;
        if (firstChild) {
            mainElement.insertBefore(errorContainer, firstChild);
        } else {
            mainElement.appendChild(errorContainer);
        }
    }
}

// Function to remove the error message from the UI
function removeErrorMessage() {
    const existingError = document.getElementById('errorContainer');
    if (existingError) {
        existingError.remove();
    }
}

// Optionally, if you need to access the current error message from other parts of your application
export function getGlobalErrorMessage() {
    return globalErrorMessage;
}
