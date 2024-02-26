import { processCsvFile } from "./csv-handler.js";
import { compareCsvDataToDB } from "../table-builders/comparison/comparison.js";
import { displayResults } from "../display-page/display-results.js";
import { toggleLoading, switchView } from "../navigation.js";
import { logResults } from "../table-builders/comparison/price-comparison.js";

export async function handleFileSelect(event, databaseCsv) {
  toggleLoading(true);
  const file = event.target.files[0];
  if (!file) {
    toggleLoading(false);
    alert('No file was selected. Please select a file.');
    return;
  }

  // Check if the file is a CSV by its MIME type or extension
  if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
    toggleLoading(false);
    alert('The file is not a CSV. Please upload a CSV file.');
    return;
  }

  try {
    // Process the CSV file, error handling is now within processCsvFile
    const userData = await processCsvFile(file);
    const { matchingItems, partialMatches, noMatches } = await compareCsvDataToDB(databaseCsv, userData);
    // logResults();
    displayResults(matchingItems, partialMatches, noMatches);
    toggleLoading(false);
    switchView("tableView");
  } catch (error) {
    toggleLoading(false);
    alert(error.message);
  }

}

export function resetFileInput(fileInput) {
  fileInput.value = "";
}
