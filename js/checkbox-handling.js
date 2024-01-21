import { RowSource } from './file-constants.js';
import { updateSelectedRows, deleteSelectedRows } from './export-manager.js';

export function setupCheckboxes() {
    // Add event listeners to all checkboxes
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

export function handleCheckboxChange(event) {
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
