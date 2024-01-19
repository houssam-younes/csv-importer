import { processCsvFile } from "./csv-handler.js";
import { compareCsvDataToDB } from "./comparison.js";
// import { displayResults } from "./table.js";
import { displayResults } from "./display-results.js";
import { toggleLoading, switchView } from "./navigation.js";

export async function handleFileSelect(event, databaseCsv) {
    toggleLoading(true);
    const file = event.target.files[0];
    if (!file) {
      toggleLoading(false);
      return;
    }
    processCsvFile(file, databaseCsv, (databaseData, userData) => {
      const { matchingItems, partialMatches, noMatches } = compareCsvDataToDB(databaseData, userData);
      displayResults(matchingItems, partialMatches, noMatches);
      toggleLoading(false);
      switchView("tableView");
    });
  }
  
  export function resetFileInput(fileInput) {
    fileInput.value = "";
  }
  