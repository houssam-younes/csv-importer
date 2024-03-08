import { RowSource, RowTypes } from '../../file-constants.js';
import { updateSelectedRows, deleteSelectedRows } from '../../export/export-manager.js';
import { toggleSelection } from '../../table-builders/comparison/comparison.js';
import { selectUnselectRow, updateMatchingSectionAveragesUI, updatePartialMatchSectionAveragesUI } from '../../table-builders/comparison/price-comparison.js';

export function setupCheckboxes() {
    // Add event listeners to all checkboxes
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

export function handleCheckboxChange(event) {
    // Get the current checkbox and its state
    debugger
    const currentCheckbox = event.target;
    const isChecked = currentCheckbox.checked;
    const currentRow = currentCheckbox.closest('tr');
    const dataID = currentRow.dataset.scanCode; // Assuming 'data-scan-code' holds the unique identifier for the row

    // Toggle the selection status in exportRowsMap
    toggleSelection(dataID);

    processRowSelection(currentRow, isChecked);

    // Additional logic for handling paired rows, if necessary
    const pairId = currentCheckbox.dataset.pairId;
}

// This function fetches row data using attributes and calls selectUnselectRow
function processRowSelection(rowElement, isChecked) {
    debugger
    // Fetch necessary attributes from the row
    const isMatching = rowElement.classList.contains(RowTypes.MATCHING); // Adjust according to your actual logic
    const isPartialMatch = rowElement.classList.contains(RowTypes.PARTIAL); // Adjust according to your actual logic
    const databasePrice = parseFloat(rowElement.dataset.databasePrice || 0);
    const exportPrice = parseFloat(rowElement.dataset.userPrice || 0);
    const databaseCost = parseFloat(rowElement.dataset.databaseCost || 0);
    const exportCost = parseFloat(rowElement.dataset.userCost || 0);

    // Prepare row data for selectUnselectRow
    const rowData = {
        isMatching,
        isPartialMatch,
        databasePrice,
        exportPrice,
        databaseCost,
        exportCost
    };

    // Use selectUnselectRow with the gathered data
    selectUnselectRow(rowData, isChecked);
    if (isMatching) {
        updateMatchingSectionAveragesUI();
    }
    else if (isPartialMatch) {
        updatePartialMatchSectionAveragesUI();
    }
}


export function handleCheckboxChangeOld(event) {
    // Get the current checkbox and its state
    const currentCheckbox = event.target;
    const isChecked = currentCheckbox.checked;
    const currentRow = currentCheckbox.closest('tr');
    const currentRowType = currentRow.classList.contains('user-row') ? 'user-row' : 'database-row';
    const pairId = currentCheckbox.dataset.pairId;
    // const itemID = currentRow.getAttribute('data-id');
    const dataID = currentRow.dataset.id;

    const currentRowSource = currentRow.classList.contains(RowSource.USER) ? RowSource.USER : RowSource.DATABASE;

    updateSelectedRows(dataID, currentRowSource, isChecked, pairId);
    // Only proceed if the checkbox is being checked
    if (isChecked) {
        if (pairId) {
            // Determine the class for the paired row based on the current row's class
            const pairedRowClass = currentRowType === 'user-row' ? 'database-row' : 'user-row';
            // Find the paired checkbox within the same table
            const pairedCheckbox = currentRow.parentNode.querySelector(`.${pairedRowClass}[data-id="${pairId}"] .row-checkbox`);
            // If a paired checkbox is found, uncheck it
            if (pairedCheckbox) {
                pairedCheckbox.checked = false;
            }
            if (pairId != dataID) { //partial matches should delete previous entry
                deleteSelectedRows(pairId);
            }
        }
        // else{ //no match
        // addSelectedUserRow(dataID);
        // }
    }
}
