import { RowTypes } from '../file-constants.js';
import { createCsvTableNew, appendMatchingStatisticsInfo, appendPartialMatchStatisticsInfo } from '../table-builders/table-creation.js';
// import { getDatabaseMap, objectToCsvString } from "./comparison.js";
// import { updateSelectedRows, deleteSelectedRows } from './export-manager.js';
import { createSelectionControls, setupSelectionControls } from '../tables/row-select/selection-controls.js';
import { toggleExpand } from './toggle-expand.js';
import { setupCheckboxes } from '../tables/row-select/checkbox-handling.js';
import { addPriceAdjustmentFeature } from '../table-builders/add-all-price.js';

export let total = 0;

function getContainerByType(type) {
    switch (type) {
        case RowTypes.MATCHING:
            return document.querySelector("#matchingItems .expandable-content .table-container");
        case RowTypes.PARTIAL:
            return document.querySelector("#partialMatches .expandable-content .table-container");
        case RowTypes.NO_MATCH:
            return document.querySelector("#noMatches .expandable-content .table-container");
        default:
            return null; // or a sensible default
    }
}

function insertSelectionControls(type) {
    const container = getContainerByType(type);
    if (!container) return;

    const selectionControlsHtml = createSelectionControls(type);
    // Assuming the container directly holds the selection controls
    container.innerHTML = selectionControlsHtml;
}

// function insertTables(type, items) {
//     const container = getContainerByType(type);
//     if (!container) return;

//     const tableHtml = createCsvTableNew(items, type);
//     // Find or create the 'table-div' within the container to insert the table HTML
//     // let tableContainer = container.querySelector('.table-div');
//     // if (!tableDiv) {
//     //     tableDiv = document.createElement('div');
//     //     tableDiv.classList.add('table-div');
//     //     container.appendChild(tableDiv);
//     // }
//     container.innerHTML += tableHtml;

//       // Wait for the next frame to ensure the DOM is updated
//       requestAnimationFrame(() => {
//         // Find the inserted table within tableDiv
//         const table = container.querySelector('table');
//         if (table) {
//             // Check if the table's width exceeds its parent's width
//             if (table.offsetWidth > container.offsetWidth) {
//                 // Add class to adjust table's position if it overflows
//                 table.classList.add('overflow-adjustment');
//             }
//         }
//     });
// }

/**
 * Dynamically inserts a table into a specified container element within the DOM, based on the provided data type and items. This function
 * creates a new table element and populates it with headers and rows according to the structured data format provided by the `createCsvTableNew`
 * function. It handles different row types by checking the type parameter and adjusts the row content accordingly, ensuring the correct
 * presentation of export rows, database rows, and user rows. This allows for a dynamic and flexible approach to rendering CSV data, enabling
 * interactive data exploration and manipulation directly within the web UI.
 *
 * The function first identifies or creates a container for the table based on the provided type. It then constructs the table element, including
 * thead and tbody sections, and iterates over the row data to create and append table rows. For rows corresponding to matched or partially matched
 * data, it includes both user and database information. For 'No Match' rows, it focuses on the raw CSV data. The function also appends any provided
 * footer statistics below the table, enhancing the data analysis capabilities. Finally, it checks and adjusts the table layout to prevent overflow
 * issues, ensuring a seamless integration within the UI.
 *
 * @param {String} type - Specifies the type of data (e.g., 'Matching', 'No Match') and influences the structure and content of the table rows.
 * @param {Array} items - The data items to be included in the table, expected to be in a structured format as provided by `createCsvTableNew`.
 */
function insertTables(type, items) {
    const container = getContainerByType(type);
    if (!container) return;

    // Assuming createCsvTableNew now returns a DOM element instead of an HTML string
    let tableDOMElement = createCsvTableNew(items, type);

    // Use a conditional check to determine which statistics info function to call
    let statsElement = document.createElement('div');
    if (type === RowTypes.MATCHING) {
        statsElement = appendMatchingStatisticsInfo(); // For matching items
        // Add the price adjustment feature here, passing the container element directly
    } else if (type === RowTypes.PARTIAL) {
        statsElement = appendPartialMatchStatisticsInfo(); // For partial matching items
        // Add the price adjustment feature here, passing the container element directly
    }


    // Find or create the 'table-div' within the container to insert the table
    // let tableDiv = container.querySelector('.table-div');
    // if (!tableDiv) {
    let tableDiv = document.createElement('div');
    tableDiv.classList.add('table-div');
    // }

    // Directly append the table DOM element and stats element to the tableDiv
    tableDiv.appendChild(tableDOMElement);
    container.appendChild(tableDiv);
    container.appendChild(statsElement);
    if (type !== RowTypes.NO_MATCH) {
        addPriceAdjustmentFeature(container);
    }

    // Use requestAnimationFrame to ensure the DOM is updated
    requestAnimationFrame(() => {
        // Check if the table's width exceeds its parent's width
        if (tableDOMElement.offsetWidth > container.offsetWidth) {
            // Add class to adjust table's position if it overflows
            tableDOMElement.classList.add('overflow-adjustment');
        }
    });
}

// function insertTables(type, items) {
//     const container = getContainerByType(type);
//     if (!container) return;

//     // const tableHtml = createCsvTableNew(items, type);
//     // let tableHtml = createCsvTableNew(items, type);
//     let tableDOMElement = createCsvTableNew(items, type); // This is now a DOM element
//     // Convert the DOM element to an HTML string
//     let tableHtml = tableDOMElement.outerHTML;

//     let statsElement = appendStatisticsInfo(type);
//     const statsHtml = statsElement.outerHTML;
//     // const statsHtml = appendStatisticsInfo(type);
//     tableHtml += statsHtml;
//     // You can append statsHtml to tableHtml or insert it into the DOM wherever needed

//     // Find or create the 'table-div' within the container to insert the table HTML
//     let tableDiv = container.querySelector('.table-div');
//     if (!tableDiv) {
//         tableDiv = document.createElement('div');
//         tableDiv.classList.add('table-div');
//         container.appendChild(tableDiv);
//     }

//     // Use a DOM parser to convert the tableHtml string to DOM elements
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(tableHtml, 'text/html');
//     const tableElement = doc.querySelector('table');

//     if (tableElement) {
//         // Append the table element to the tableDiv
//         tableDiv.appendChild(tableElement);

//         // Wait for the next frame to ensure the DOM is updated
//         requestAnimationFrame(() => {
//             // Check if the table's width exceeds its parent's width
//             if (tableElement.offsetWidth > container.offsetWidth) {
//                 // Add class to adjust table's position if it overflows
//                 tableElement.classList.add('overflow-adjustment');
//             }
//         });
//     }
// }

export function displayResults(matchingItems, partialMatches, noMatches) {
    // Update 'total' with the current total number of items, ensuring arrays are not null
    total = (matchingItems ? matchingItems.length - 1 : 0) +
        (partialMatches ? partialMatches.length - 1 : 0) +
        (noMatches ? noMatches.length - 1 : 0);

    // Check and process each type if they are not null
    if (matchingItems) {
        insertSelectionControls(RowTypes.MATCHING);
        insertTables(RowTypes.MATCHING, matchingItems);
        updateTotalDisplay(`${RowTypes.MATCHING}-total`, matchingItems.length - 1);
    }

    if (partialMatches) {
        insertSelectionControls(RowTypes.PARTIAL);
        insertTables(RowTypes.PARTIAL, partialMatches);
        updateTotalDisplay(`${RowTypes.PARTIAL}-total`, partialMatches.length - 1);
    }

    if (noMatches) {
        insertSelectionControls(RowTypes.NO_MATCH);
        insertTables(RowTypes.NO_MATCH, noMatches);
        updateTotalDisplay(`${RowTypes.NO_MATCH}-total`, noMatches.length - 1);
    }

    // Setup expandable titles and checkboxes
    document.querySelectorAll(".expandable-title").forEach((title) => {
        title.removeEventListener("click", toggleExpand);
        title.addEventListener("click", toggleExpand);
    });
    setupCheckboxes();
    setupSelectionControls(RowTypes.MATCHING);
    setupSelectionControls(RowTypes.PARTIAL);
    setupSelectionControls(RowTypes.NO_MATCH);
}

function updateTotalDisplay(spanClass, itemCount) {
    // Use the globally declared 'total' variable
    let displayText = `${itemCount} Item${itemCount !== 1 ? 's' : ''}`;
    if (itemCount > 0) {
        const percentage = total > 0 ? ((itemCount / total) * 100).toFixed(2) : "0.00";
        displayText += ` (${percentage}%)`;
    }

    const span = document.querySelector(`.${spanClass}`);
    // Check if the span element exists before attempting to update it
    if (span) {
        span.textContent = displayText;
    }
}