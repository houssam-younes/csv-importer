import { fetchInventory } from "./api.js";
import { setupNavigation } from "./navigation.js";
import { handleFetchError } from "./error-handling.js";
import { setDatabaseCsvHeaders } from "./data-manager.js";

document.addEventListener("DOMContentLoaded", async function () {
  let databaseCsv = await fetchInventory();
  if (databaseCsv) {
    setDatabaseCsvHeaders(Object.keys(databaseCsv[0]));
    setupNavigation(databaseCsv);
    // localStorage.setItem("inventoryData", JSON.stringify(databaseCsv));
  } else {
    handleFetchError();
  }
});
