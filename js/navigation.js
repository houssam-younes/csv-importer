import { clearCsvTable } from "./table.js";
import { handleFileSelect, resetFileInput } from "./file-select.js";
import { clearSelectedRowsMap, exportSelectedRowsToCsv } from "./export-manager.js";
import { clearGlobalErrorMessage } from './file-error.js'; // Ensure the path is correct


export function switchView(viewId) {
    const importView = document.getElementById("importView");
    const tableView = document.getElementById("tableView");
    const legend = document.getElementsByClassName("legend")[0];

    clearSelectedRowsMap();
  
    importView.style.display = viewId === "importView" ? "block" : "none";
    tableView.style.display = viewId === "tableView" ? "flex" : "none";
    legend.style.display = viewId === "importView" ? "none" : "block";

    if (viewId === "importView") {
      clearGlobalErrorMessage(); // Clear the error message when switching back to the import view
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
    exportSelectedRowsToCsv();
  };
  
  backBtn.onclick = () => {
    clearCsvTable();
    resetFileInput(fileInput);
    switchView("importView");
  };

    // Add the event listener for the home button
    homeBtn.onclick = () => {
      clearCsvTable();
      resetFileInput(fileInput);
      switchView("importView");
    };
}
