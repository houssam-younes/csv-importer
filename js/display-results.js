import { RowTypes } from './file-constants.js';
import { createCsvTableNew } from './table-creation.js';
// import { getDatabaseMap, objectToCsvString } from "./comparison.js";
// import { updateSelectedRows, deleteSelectedRows } from './export-manager.js';
import { createSelectionControls, setupSelectionControls } from './selection-controls.js';
import { toggleExpand } from './toggle-expand.js';
import { setupCheckboxes } from './checkbox-handling.js';

// export function displayResults(matchingItems, partialMatches, noMatches) {
//     const matchingContent = document.querySelector(
//         "#matchingItems .expandable-content .table-div"
//     );
//     const partialContent = document.querySelector(
//         "#partialMatches .expandable-content .table-div"
//     );
//     const noMatchContent = document.querySelector(
//         "#noMatches .expandable-content .table-div"
//     );

//     console.log('whats no matches ');
//     console.log(noMatches);


//     const matchingSelectionControls = createSelectionControls(RowTypes.MATCHING);
//     const partialSelectionControls = createSelectionControls(RowTypes.PARTIAL);
//     const noMatchSelectionControls = createSelectionControls(RowTypes.NO_MATCH);

//     matchingContent.innerHTML = matchingSelectionControls + createCsvTableNew(matchingItems, RowTypes.MATCHING);
//     partialContent.innerHTML = partialSelectionControls + createCsvTableNew(partialMatches, RowTypes.PARTIAL);
//     noMatchContent.innerHTML = noMatchSelectionControls + createCsvTableNew(noMatches, RowTypes.NO_MATCH);

//     document.querySelectorAll(".expandable-title").forEach((title) => {
//         title.removeEventListener("click", toggleExpand);
//         title.addEventListener("click", toggleExpand);
//     });

//     setupCheckboxes();
//     setupSelectionControls(RowTypes.MATCHING);
//     setupSelectionControls(RowTypes.PARTIAL);
//     setupSelectionControls(RowTypes.NO_MATCH);

// }


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

function insertTables(type, items) {
    const container = getContainerByType(type);
    if (!container) return;

    const tableHtml = createCsvTableNew(items, type);
    // Find or create the 'table-div' within the container to insert the table HTML
    // let tableContainer = container.querySelector('.table-div');
    // if (!tableDiv) {
    //     tableDiv = document.createElement('div');
    //     tableDiv.classList.add('table-div');
    //     container.appendChild(tableDiv);
    // }
    container.innerHTML += tableHtml;

      // Wait for the next frame to ensure the DOM is updated
      requestAnimationFrame(() => {
        // Find the inserted table within tableDiv
        const table = container.querySelector('table');
        if (table) {
            // Check if the table's width exceeds its parent's width
            if (table.offsetWidth > container.offsetWidth) {
                // Add class to adjust table's position if it overflows
                table.classList.add('overflow-adjustment');
            }
        }
    });
}


export function displayResults(matchingItems, partialMatches, noMatches) {
    // Insert selection controls and tables for each type
    insertSelectionControls(RowTypes.MATCHING);
    insertTables(RowTypes.MATCHING, matchingItems);

    insertSelectionControls(RowTypes.PARTIAL);
    insertTables(RowTypes.PARTIAL, partialMatches);

    insertSelectionControls(RowTypes.NO_MATCH);
    insertTables(RowTypes.NO_MATCH, noMatches);
    
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
