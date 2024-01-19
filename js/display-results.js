import { RowTypes } from './file-constants.js';
import { createCsvTableNew } from './table-creation.js';
// import { getDatabaseMap, objectToCsvString } from "./comparison.js";
// import { updateSelectedRows, deleteSelectedRows } from './export-manager.js';
import { createSelectionControls, setupSelectionControls } from './selection-controls.js';
import { toggleExpand } from './toggle-expand.js';
import { setupCheckboxes } from './checkbox-handling.js';

export function displayResults(matchingItems, partialMatches, noMatches) {
    const matchingContent = document.querySelector(
        "#matchingItems .expandable-content .table-container"
    );
    const partialContent = document.querySelector(
        "#partialMatches .expandable-content .table-container"
    );
    const noMatchContent = document.querySelector(
        "#noMatches .expandable-content .table-container"
    );

    const matchingSelectionControls = createSelectionControls(RowTypes.MATCHING);
    const partialSelectionControls = createSelectionControls(RowTypes.PARTIAL);
    const noMatchSelectionControls = createSelectionControls(RowTypes.NO_MATCH);

    matchingContent.innerHTML = matchingSelectionControls + createCsvTableNew(matchingItems, RowTypes.MATCHING);
    partialContent.innerHTML = partialSelectionControls + createCsvTableNew(partialMatches, RowTypes.PARTIAL);
    noMatchContent.innerHTML = noMatchSelectionControls + createCsvTableNew(noMatches, RowTypes.NO_MATCH);

    document.querySelectorAll(".expandable-title").forEach((title) => {
        title.removeEventListener("click", toggleExpand);
        title.addEventListener("click", toggleExpand);
    });

    setupCheckboxes();
    setupSelectionControls(RowTypes.MATCHING);
    setupSelectionControls(RowTypes.PARTIAL);
    setupSelectionControls(RowTypes.NO_MATCH);

}