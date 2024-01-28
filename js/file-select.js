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
      // processCsvFile(file, databaseCsv, async (databaseData, userData) => {
      //     const { matchingItems, partialMatches, noMatches } = await compareCsvDataToDB(databaseData, userData);
      //     displayResults(matchingItems, partialMatches, noMatches);
      //     toggleLoading(false);
      //     switchView("tableView");
      // });
       // Await the processCsvFile Promise
       const userData = await processCsvFile(file);
       const { matchingItems, partialMatches, noMatches } = await compareCsvDataToDB(databaseCsv, userData);
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
  