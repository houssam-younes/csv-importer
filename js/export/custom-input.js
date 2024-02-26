// custom-input.js
import { CELL_INDICES } from "../file-constants.js";
import { getExportRowsMap } from "../table-builders/comparison/comparison.js";

// let isEditing = false; // Flag to indicate if any field is being edited

/**
 * Check if editing is in progress by looking for specific elements in the DOM.
 */
function isEditing() {
    const doneButtonContainer = document.querySelector('.done-button-container');
    const editableDiv = document.querySelector('.editable-div');
    return doneButtonContainer !== null && editableDiv !== null && editableDiv.contentEditable === 'true';
}

/**
 * Routes the handling of custom input based on the cell index.
 */
export function handleCustomInput(userItemId, pairId, cellIndex, currentScanCode, eventTarget) {
    if (isEditing()) {
        alert("Please finish editing the open field before editing another.");
        eventTarget.value = eventTarget.getAttribute('data-prev-value'); // Revert to previous value
        return;
    }
    switch (cellIndex) {
        case CELL_INDICES.price:
            handleCustomPriceInput(currentScanCode, eventTarget);
            break;
        // Add cases for other indices if needed
        default:
            console.error("Custom input handling for this cell index is not implemented.");
            break;
    }
}

/**
 * Handles custom input specifically for the price field.
 */
function handleCustomPriceInput(currentScanCode, eventTarget) {
    // isEditing = true; // Set the flag as editing started

    const parentTd = eventTarget.closest('td');
    const jsUiValueContainer = parentTd.querySelector('.js-ui-value');

    const currentValue = getCurrentPriceValue(currentScanCode);

    jsUiValueContainer.innerHTML = ''; // Clear the container

    // Create a flex container for the editable div and buttons
    const flexContainer = document.createElement('div');
    flexContainer.style.display = 'flex';
    flexContainer.style.alignItems = 'center';
    flexContainer.style.justifyContent = 'flex-start';
    flexContainer.style.gap = '10px'; // Spacing between elements

    // Create and append the editable div to the flex container
    const editableDiv = createEditableDiv(currentValue);
    flexContainer.appendChild(editableDiv);

    // Create and append the "Done" button to the flex container
    const doneButton = createDoneButton(() => finalizeCustomInput(currentScanCode, editableDiv, flexContainer, jsUiValueContainer));
    flexContainer.appendChild(doneButton);

    jsUiValueContainer.appendChild(flexContainer); // Append the flex container to the jsUiValueContainer
}


// Adjustments for when the div becomes non-editable (read-only mode)
function finalizeCustomInput(currentScanCode, editableDiv, flexContainer, jsUiValueContainer) {
    const newValue = editableDiv.textContent.trim();
    if (!isNaN(parseFloat(newValue)) && isFinite(newValue)) {
        updatePriceInExportRowsMap(currentScanCode, newValue);

        // Set the div as non-editable and update its appearance for readonly mode
        editableDiv.contentEditable = false;
        editableDiv.style.backgroundColor = '#e9ecef'; // Light grey background indicates readonly
        editableDiv.style.color = '#495057'; // Darker text for contrast
        editableDiv.style.border = '1px solid #ced4da'; // Solid border to mimic input field in readonly state

        // Optionally, if you wish to keep the cursor as default instead of text selection
        editableDiv.style.cursor = 'default';

        // Reset editing flag to allow new edits
        // isEditing = false;

        // Remove the "Done" button and replace with the "Edit" button
        removeButtonFromContainer(flexContainer, 'button');
        const editButton = createEditButton(currentScanCode, editableDiv, flexContainer, jsUiValueContainer);
        flexContainer.appendChild(editButton);
    } else {
        alert("Please enter a valid number for the price.");
    }
}

function removeButtonFromContainer(container, selector) {
    const button = container.querySelector(selector);
    if (button) {
        container.removeChild(button);
    }
}

function createEditableDiv(currentValue) {
    const editableDiv = document.createElement('div');
    editableDiv.contentEditable = true; // Ensure it's editable when "Custom" is selected
    editableDiv.className = 'custom-price-editable editable-div';
    editableDiv.style.border = '1px solid #ccc';
    editableDiv.style.padding = '5px 8px';
    // editableDiv.style.width = '100px'; // Fixed width
    editableDiv.style.width = 'fit-content'; // Fixed width
    editableDiv.style.minWidth = '50px'; // Fixed width
    editableDiv.style.maxWidth = '80px'; // Fixed width
    editableDiv.style.display = 'inline-block';
    editableDiv.style.borderRadius = '4px';
    editableDiv.style.backgroundColor = '#fff'; // White background for editable state
    editableDiv.style.outline = 'none'; // Remove focus outline for cleaner look
    editableDiv.textContent = currentValue;

    // Add keypress event listener to check for Enter key
    editableDiv.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default Enter key action

            // Find the "Done" button by class name within the closest 'td' or container
            const parentTd = this.closest('td'); // Adjust if your structure is different
            const doneButton = parentTd.querySelector('.done-button');
            if (doneButton) {
                doneButton.click(); // Simulate clicking the Done button
            }
        }
    });


    return editableDiv;
}

function createDoneButton(onClick) {
    const button = document.createElement('button');
    button.onclick = onClick;
    button.className = "done-button-container";
    button.innerHTML = '<img src="../resources/img/done.png" alt="Done" class="done-button" style="width: 24px; height: 24px;">'; // Adjust path as necessary
    styleIconButton(button);
    return button;
}

function createEditButton(currentScanCode, editableDiv, flexContainer, jsUiValueContainer) {
    const button = document.createElement('button');
    button.innerHTML = '<img src="../resources/img/edit.png" alt="Edit" style="width: 24px; height: 24px;">';
    styleIconButton(button);

    button.onclick = () => {

        if (isEditing()) {
            // If another field is already being edited, alert the user and exit the function
            alert("Please finish editing the current field before editing another.");
            return;
        }

        // isEditing = true; // Indicate that editing has started

        // Make the div editable
        editableDiv.contentEditable = true;
        editableDiv.style.backgroundColor = '#fff'; // Editable state background

        // Remove the "Edit" button and replace it with the "Done" button
        flexContainer.removeChild(button);
        const doneButton = createDoneButton(() => finalizeCustomInput(currentScanCode, editableDiv, flexContainer, jsUiValueContainer));
        flexContainer.appendChild(doneButton);

        editableDiv.focus(); // Focus on the editableDiv for user input
    };

    return button;
}


function styleIconButton(button) {
    button.style.width = '24px'; // Set width to match your editable div's height
    button.style.height = '24px'; // Set height to match
    button.style.border = 'none'; // Remove border
    button.style.background = 'transparent'; // Remove background
    button.style.cursor = 'pointer'; // Change cursor on hover
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    // Add any additional styling you need
}


function updatePriceInExportRowsMap(currentScanCode, newValue) {
    const exportRowsMap = getExportRowsMap();
    if (exportRowsMap.has(currentScanCode)) {
        let exportData = exportRowsMap.get(currentScanCode);
        exportData.price = newValue; // Update the price in the map
    } else {
        console.error(`No entry found for the scan code: ${currentScanCode}`);
    }
}

function getCurrentPriceValue(currentScanCode) {
    const exportRowsMap = getExportRowsMap();
    if (exportRowsMap.has(currentScanCode)) {
        const exportData = exportRowsMap.get(currentScanCode);
        return exportData.price; // Return the current price value from the export data
    }
    return ''; // Default to an empty string if no current value is found
}

