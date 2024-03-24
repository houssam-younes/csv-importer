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
        errorContainer.style.color = '#b30000'; // Dark red text for better readability
        errorContainer.style.fontWeight = 'bold';
        errorContainer.style.padding = '10px';
        errorContainer.style.boxShadow = '0px 4px 8px rgba(179, 0, 0, 0.2)'; // Soft shadow for a subtle border effect
        errorContainer.style.backgroundColor = '#ffe6e6'; // Light red background for contrast
        errorContainer.style.borderRadius = '5px';
        errorContainer.style.marginTop = '20px';
        errorContainer.style.maxWidth = '50%';        
        errorContainer.innerHTML = `<div class="file-error">⚠️ ${errorMessage}<br> </div>`;

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
