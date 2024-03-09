import { databaseHeaders, CELL_INDICES, RowTypes } from "../file-constants.js";
import { getUserMap, getDatabaseMap, getExportRowsMap } from "../table-builders/comparison/comparison.js";
import { updatePriceAveragesUI, updateCostAveragesUI, toggleMatchingPriceSelection, togglePartialMatchPriceSelection, updatePartialMatchPriceAveragesUI, updateMatchingPriceAveragesUI } from "../table-builders/comparison/price-comparison.js";
import { ValueType, updateTotalsAndInfoForRow } from "../table-builders/comparison/price-cost-update-helpers.js";
import { handleCustomInput } from "./custom-input.js";
/**
 * Handles the change event for dropdowns, updating the respective field based on the selected value.
 */
export function handleDropdownChange(userItemId, pairId, cellIndex, currentScanCode, eventTarget) {
    let selectedValue = eventTarget.value;
    // Directly handle custom value case without fetching
    if (selectedValue === "custom") {
        // Call a function to handle custom input, this function needs to be implemented to handle the UI logic for custom inputs
        handleCustomInput(userItemId, pairId, cellIndex, currentScanCode, eventTarget);
        return; // Exit early since we're handling custom input separately
    }

    // Update the previous value attribute to the current value, as this attempt is valid
    eventTarget.setAttribute('data-prev-value', eventTarget.value);

    const newValue = fetchNewValue(userItemId, pairId, cellIndex, selectedValue);

    if (newValue !== null) {
        switch (cellIndex) {
            case CELL_INDICES.scan_code:
                changeScanCode(currentScanCode, newValue, eventTarget);
                break;
            case CELL_INDICES.item_name:
                changeItemName(currentScanCode, newValue, eventTarget);
                break;
            case CELL_INDICES.department:
                changeDepartment(currentScanCode, newValue, eventTarget);
                break;
            case CELL_INDICES.cost:
                changeCost(currentScanCode, newValue, eventTarget);
                break;
            case CELL_INDICES.price:
                changePrice(currentScanCode, newValue, eventTarget);
                break;
            default:
                console.log("Unhandled cell index:", cellIndex);
        }
    } else {
        console.log(`No new value found for cell index ${cellIndex} using selected option: ${selectedValue}`);
    }
}

/**
 * Fetches the new value for a given field based on the user's selection.
 */
function fetchNewValue(userItemId, pairId, cellIndex, selectedValue) {
    let fieldName = databaseHeaders[cellIndex];
    let newValue = null;

    if (selectedValue === "use_file") {
        const userMap = getUserMap();
        const userData = userMap.get(userItemId);
        newValue = userData ? userData[fieldName] : null;
    } else if (selectedValue === "use_database") {
        const databaseMap = getDatabaseMap();
        const databaseData = databaseMap.get(pairId);
        newValue = databaseData ? databaseData[fieldName] : null;
    } else if (selectedValue === "custom") {
        console.log("Custom value selected, implementation needed.");
    }

    return newValue;
}

/**
 * Updates the UI with the new value by finding the closest 'td' and then the '.js-ui-value' element.
 */
function updateUIValueInClosestTd(eventTarget, newValue) {
    const parentTd = eventTarget.closest('td');
    const valueDisplay = parentTd.querySelector('.js-ui-value');
    if (valueDisplay) {
        valueDisplay.textContent = newValue;
    }
}

/**
 * Updates the scan code for a given export row and reflects this change in the exportRowsMap.
 * Also updates the UI by changing the 'data-scan-code' attribute of the closest 'tr' element and
 * updating the value displayed in the '.js-ui-value' element.
 * 
 * @param {string} currentScanCode - The current scan code of the item, used as the key in exportRowsMap.
 * @param {string} newValue - The new scan code value that will replace the currentScanCode.
 * @param {HTMLElement} eventTarget - The element that initiated the change event.
 */
function changeScanCode(currentScanCode, newValue, eventTarget) {
    const exportRowsMap = getExportRowsMap();

    if (exportRowsMap.has(currentScanCode)) {
        let exportData = exportRowsMap.get(currentScanCode);

        // Delete the old entry with the current scan code
        exportRowsMap.delete(currentScanCode);

        // Update the scan code in the export data
        exportData.scan_code = newValue;

        // Add a new entry with the new scan code as the key and the updated export data as the value
        exportRowsMap.set(newValue, exportData);

        // Update the 'data-scan-code' attribute of the closest 'tr' element
        const rowElement = eventTarget.closest('tr');
        if (rowElement) {
            rowElement.setAttribute('data-scan-code', newValue);
        }

        // Update the value displayed in the UI
        updateUIValueInClosestTd(eventTarget, newValue);
    } else {
        console.log(`No entry found for the current scan code: ${currentScanCode}`);
    }
}

/**
 * Updates the item name in the export data for a given scan code and updates the UI.
 */
function changeItemName(currentScanCode, newValue, eventTarget) {
    const exportRowsMap = getExportRowsMap();
    if (exportRowsMap.has(currentScanCode)) {
        let exportData = exportRowsMap.get(currentScanCode);
        exportData.item_name = newValue;
        updateUIValueInClosestTd(eventTarget, newValue);
    } else {
        console.log(`No entry found for the scan code: ${currentScanCode}`);
    }
}

/**
 * Updates the department in the export data for a given scan code and updates the UI.
 */
function changeDepartment(currentScanCode, newValue, eventTarget) {
    const exportRowsMap = getExportRowsMap();
    if (exportRowsMap.has(currentScanCode)) {
        let exportData = exportRowsMap.get(currentScanCode);
        exportData.department = newValue;
        updateUIValueInClosestTd(eventTarget, newValue);
    } else {
        console.log(`No entry found for the scan code: ${currentScanCode}`);
    }
}

/**
 * Updates the cost in the export data for a given scan code and updates the UI.
 */
function changeCost(currentScanCode, newValue, eventTarget) {
    const exportRowsMap = getExportRowsMap();
    if (exportRowsMap.has(currentScanCode)) {
        let exportData = exportRowsMap.get(currentScanCode);
        let oldCost = validateAndParseNumber(exportData.cost, 'old cost', 'cost');
        exportData.cost = newValue;
        updateUIValueInClosestTd(eventTarget, newValue);

        updateRowAndTotalsForNewCost(eventTarget, oldCost, newValue);
    } else {
        console.log(`No entry found for the scan code: ${currentScanCode}`);
    }
}

function updateRowAndTotalsForNewCost(eventTarget, oldCost, newCost) {
    // Find the closest 'tr' element to get the associated row
    const rowElement = eventTarget.closest('tr');
    if (!rowElement) {
        console.error('No row element found for the event target');
        return;
    }
    if (rowElement.classList.contains(RowTypes.NO_MATCH)) {
        return;
    }

    // Get the database cost from the dataset of the row
    const databaseCost = parseFloat(rowElement.dataset.databaseCost || 0);
    if (isNaN(databaseCost)) {
        console.warn('Invalid or missing database cost in the row dataset');
        return;
    }

    // Update the dataset of the row with the new cost (export cost)
    const validatedNewCost = validateAndParseNumber(newCost, 'Export item', 'cost');
    console.log('what was old cost in row dataset? ' + rowElement.dataset.userCost);
    rowElement.dataset.userCost = validatedNewCost;

    // Call a function to update the totals based on the new cost
    updateTotalsAndInfoForRow(databaseCost, oldCost, validatedNewCost, eventTarget, ValueType.COST);
}

/**
 * Updates the price in the export data for a given scan code and updates the UI.
 */
export function changePrice(currentScanCode, newValue, eventTarget) {
    const exportRowsMap = getExportRowsMap();
    if (exportRowsMap.has(currentScanCode)) {
        let exportData = exportRowsMap.get(currentScanCode);
        let oldPrice = validateAndParseNumber(exportData.price, 'old price', 'price');
        exportData.price = newValue;
        updateUIValueInClosestTd(eventTarget, newValue);

        // Now call the new function to update the row's dataset and totals
        updateRowAndTotalsForNewPrice(eventTarget, oldPrice, newValue);

    } else {
        console.log(`No entry found for the scan code: ${currentScanCode}`);
    }
}

export function updateRowAndTotalsForNewPrice(eventTarget, oldPrice, newPrice) {
    // Find the closest 'tr' element to get the associated row
    const rowElement = eventTarget.closest('tr');
    if (!rowElement) {
        console.error('No row element found for the event target');
        return;
    }
    if (rowElement.classList.contains(RowTypes.NO_MATCH)) {
        return;
    }

    // Get the database price from the dataset of the row
    const databasePrice = parseFloat(rowElement.dataset.databasePrice || 0);
    if (isNaN(databasePrice)) {
        console.warn('Invalid or missing database price in the row dataset');
        return;
    }

    // Update the dataset of the row with the new price (export price)
    const validatedNewPrice = validateAndParseNumber(newPrice, 'Export item', 'price');
    rowElement.dataset.userPrice = validatedNewPrice;

    // Call a function to update the totals based on the new price
    // updatePriceTotalsForRow(databasePrice, validatedNewPrice, rowElement);
    updateTotalsAndInfoForRow(databasePrice, oldPrice, validatedNewPrice, eventTarget, ValueType.PRICE);
}

export function validateAndParseNumber(value, itemName, valueType) {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
        console.warn(`${itemName} ${valueType} is not a valid number: ${value}`);
        return 0; // Default to 0 if the value is not a valid number
    }
    return parsedValue;
}

/**
 * Handles the change event for source selection dropdowns (js-tr-select),
 * updating all cell dropdowns in the same row (js-td-select) based on the selected source.
 */
export function handleSourceChange(event) {
    const selectedSource = event.target.value; // 'user' or 'database'

    // Map 'user' and 'database' to 'use_file' and 'use_database' respectively
    const valueMap = {
        use_source_file: 'use_file',
        use_source_database: 'use_database'
    };

    const mappedValue = valueMap[selectedSource]; // Get the mapped value ('use_file' or 'use_database')

    const row = event.target.closest('tr'); // Find the parent row

    // Find all cell dropdowns in this row with class '.js-td-select'
    const cellDropdowns = row.querySelectorAll('.js-td-select');

    // Iterate through each cell dropdown and update its value
    cellDropdowns.forEach((dropdown, indexx) => {
        dropdown.value = mappedValue; // Update the dropdown's value based on the source selection
        dropdown.dispatchEvent(new Event('change'));
        //need to check if sync or async to make sure
        //no other field is changed while changeScanCode is executing
        console.log('dispatched event ', mappedValue);
        // example(dropdown);
        console.log(indexx);
        console.log('waited ' + indexx);
        // setTimeout(() => console.log("This message will appear after 3 seconds."), 3000);

        // Optionally, trigger the change event for each dropdown if needed
        // This mimics a user manually changing each dropdown and allows any associated logic to run
        // dropdown.dispatchEvent(new Event('change'));
        // Note: Be cautious with dispatchEvent, ensure your change handlers can handle programmatic events properly
    });
}

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
            console.log("Something after the promise inside wait resolves.");
        }, ms);
    });
}

async function example(dropdown) {
    // example
    console.log("This message will appear immediately.");
    await wait(2000);
    console.log("This message will appear after 2 seconds.");
    dropdown.dispatchEvent(new Event('change'));
}
