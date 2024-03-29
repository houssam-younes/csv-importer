import { handleFileSelect, resetFileInput } from "./csv-file-helpers/file-select.js";
import { clearSelectedRowsMap, exportSelectedRowsToCsvWithExportHeaders } from "./export/export-manager.js";
import { clearGlobalErrorMessage } from './csv-file-helpers/file-error.js'; // Ensure the path is correct
import { resetTotals } from "./table-builders/comparison/price-comparison.js";
import { clearExportRowsMap } from "./table-builders/comparison/comparison.js";
import { resetFeatureFlags } from "./file-constants.js";
import { clearCheckboxes } from "./settings-dropdown.js";
import { clearDuplicateScanCodes } from "./table-builders/comparison/duplicate-scan-codes.js";

export function switchView(viewId) {
  const importView = document.getElementById("importView");
  const tableView = document.getElementById("tableView");
  const legend = document.getElementsByClassName("legend")[0];

  clearSelectedRowsMap();
  clearDuplicateScanCodes();
  resetFeatureFlags();

  // Function to clear inner HTML of all elements with a given class
  const clearTableContainers = () => {
    const containers = document.querySelectorAll('.table-container');
    containers.forEach(container => container.innerHTML = '');
  };

  // Toggle display and clear content of table containers if not in view
  if (viewId === "importView") {
    importView.style.display = "block";
    tableView.style.display = "none";
    clearTableContainers(); // Clear content of table containers
    legend.style.display = "none";
    clearGlobalErrorMessage(); // Clear the error message when switching back to the import view
    resetTotals();
    clearExportRowsMap();
    clearCheckboxes();
  } else if (viewId === "tableView") {
    tableView.style.display = "flex";
    importView.style.display = "none";
    legend.style.display = "block";
  }
}

export function toggleLoading(isLoading) {
  const importButton = document.getElementById("importCsvBtn");
  const spinner = document.getElementById("spinner");

  importButton.disabled = isLoading;
  spinner.style.display = isLoading ? "block" : "none";
}


export function setupNavigation(databaseCsv) {
  const importButton = document.getElementById("importCsvBtn");
  const fileInput = document.getElementById("csvFileInput");
  const backBtn = document.getElementsByClassName("back-header")[0];
  const homeBtn = document.getElementById("homeBtn");
  const exportButton = document.getElementById("export-btn");

  importButton.onclick = () => fileInput.click();
  fileInput.onchange = (event) => handleFileSelect(event, databaseCsv);

  exportButton.onclick = () => {
    //exportSelectedRowsToCsv();
    exportSelectedRowsToCsvWithExportHeaders();
  };

  backBtn.onclick = () => {
    resetFileInput(fileInput);
    switchView("importView");
  };

  // Add the event listener for the home button
  homeBtn.onclick = () => {
    resetFileInput(fileInput);
    switchView("importView");
  };
}
