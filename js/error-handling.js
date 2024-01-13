import { setupNavigation } from "./navigation.js";
import { setDatabaseCsvHeaders } from "./data-manager.js";

export function handleFetchError() {
    console.error("Failed to fetch inventory data. Attempting to load from local storage.");
  
    const localData = localStorage.getItem("inventoryData");
    if (localData) {
      const data = JSON.parse(localData);
      console.log("Loaded data from local storage:", data);
      setDatabaseCsvHeaders(Object.keys(data[0]));
      setupNavigation(data);   
      // Here you can call any functions necessary to process and display the local data
      // For example, setupNavigation(data); if the local data can be used directly
    } else {
      console.error("No local data available. Displaying error message to user.");
      // Display an error message to the user or provide options to retry fetching data
      // This could be a simple alert or a more complex UI update
        // clearLocalState()
    }
  }
  