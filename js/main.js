import { displayResults, clearCsvTable } from "./table.js";
import { compareCsvDataToDB } from "./comparison.js";

let databaseCsv;
export let databaseCsvHeaders;

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/inventory")
    .then((response) => response.json())
    .then((data) => {
      // console.log("whats data from database");
      // console.log(data);
      // const csvData = jsonToCsv(data);
      // databaseCsv = csvData;
      databaseCsv = data;
      // Assuming each row is an object with properties matching your table columns
      databaseCsvHeaders = Object.keys(data[0]);
      // console.log('headers '+databaseCsvHeaders);
      setupNavigation();
      // Process and display your data as needed

      // localStorage.setItem("inventoryData", JSON.stringify(data));

      // const lsdata = JSON.parse(localStorage.getItem("inventoryData"));
      // console.log("whats data from localstorage ", lsdata);
      //   console.log("equal? " + isEqual(lsdata, data));
    })
    .catch((error) => {
      console.error("Error fetching inventory:", error);

      // const localData = localStorage.getItem("inventoryData");
      // if (localData) {
      //   const data = JSON.parse(localData);
      //   console.log("whats data from localstorage ", data);
      //   // const csvData = jsonToCsv(data);
      //   databaseCsv = data;
      //   databaseCsvHeaders = Object.keys(data[0]);
      //   // console.log('headers '+databaseCsvHeaders);
      //   setupNavigation();
      //   // Process the data as if it were loaded from the database
      //   // clearLocalState()
      // } else {
      //   console.error("No local data available");
      // }
    });

  console.log("hi");

  // fetch('resources/csv/updated_user_data_v6.csv')
  //     .then(response => response.text())
  //     .then(csv => {
  //         throw error;
  //         console.log('whats csv from file ',csv);
  //         databaseCsv = csv;
  //         // Extract headers
  //         databaseCsvHeaders = extractHeaders(csv);
  //         console.log('headers '+databaseCsvHeaders);
  //         setupNavigation();
  //         // loadPreviousState();

  //         localStorage.setItem('inventoryData', (csv));
  //         // console.log('whats data from localstorage ', localStorage.getItem('inventoryData'));
  //     }).catch(error => {
  //         console.error('Error fetching inventory:', error);
  //         const localData = localStorage.getItem('inventoryData');
  //         if (localData) {
  //             //const data = JSON.parse(localData);
  //             console.log('whats data from localstorage ', localData);
  //             databaseCsv = localData;
  //             databaseCsvHeaders = extractHeaders(localData);
  //             setupNavigation();
  //             // clearLocalState()
  //         } else {
  //             console.error('No local data available');
  //         }
  //     });
});

function clearLocalState() {
  // Clear user CSV data from localStorage
  localStorage.removeItem("userCsvData");
}

function jsonToCsv(jsonData) {
  if (!jsonData || !jsonData.length) {
    return "";
  }

  // Extract headers
  const headers = Object.keys(jsonData[0]);
  const csvRows = [headers.join(",")]; // Create a string for headers

  // Loop over the rows
  for (const row of jsonData) {
    const values = headers.map((header) => {
      let field = row[header];
      if (field == null) field = ""; // Convert null or undefined to empty string
      return field; // Don't wrap the values in double quotes
    });
    csvRows.push(values.join(",")); // Create a string for each row
  }

  return csvRows.join("\n"); // Join rows with a newline to get CSV format
}

function setupNavigation() {
  const importButton = document.getElementById("importCsvBtn");
  const fileInput = document.getElementById("csvFileInput");
  const backBtn = document.getElementById("backBtn");

  importButton.onclick = () => fileInput.click();
  fileInput.onchange = handleFileSelect;
  backBtn.onclick = () => {
    clearState();
    resetFileInput(fileInput);
    switchView("importView");
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleFileSelect(event) {
  toggleLoading(true);
  const file = event.target.files[0];
  if (!file) {
    toggleLoading(false);
    return;
  }
  // Show spinner and disable button
  //   await delay(100000);

  const reader = new FileReader();
  reader.onload = (e) => {
    console.log("reader loading");
    const userCsvData = e.target.result;
    // Split the userCsvData into an array of rows
    //const userCsvRows = userCsvData.split('\n');
    // Store user CSV data as JSON
    // localStorage.setItem('userCsvData', JSON.stringify(userCsvRows));

    // Perform comparison
    const { matchingItems, partialMatches, noMatches } = compareCsvDataToDB(
      databaseCsv,
      userCsvData
    );
    console.log("no matches ", noMatches);
    displayResults(matchingItems, partialMatches, noMatches);
    // Hide spinner and enable button
    toggleLoading(false);
    switchView("tableView");
  };
  console.log("reading as text file");
  reader.readAsText(file);
}

function toggleLoading(isLoading) {
  // console.log("toggling loading " + isLoading);
  document.getElementById("importCsvBtn").disabled = isLoading;
  // console.log(
    // " toggling loading what was it " +
      // document.getElementById("spinner").style.display
  // );
  document.getElementById("spinner").style.display = isLoading
    ? "block"
    : "none";
  console.log(
    "toggling loading what is it now " +
      document.getElementById("spinner").style.display
  );
}

// function loadPreviousState() {
//   const userCsvData = localStorage.getItem("userCsvData");
//   if (userCsvData) {
//     const { matchingItems, partialMatches, noMatches } = compareCsvData(
//       databaseCsv,
//       userCsvData
//     );
//     displayResults(matchingItems, partialMatches, noMatches);
//     switchView("tableView");
//   }
// }

function switchView(viewId) {
  document.getElementById("importView").style.display =
    viewId === "importView" ? "block" : "none";
  document.getElementById("tableView").style.display =
    viewId === "tableView" ? "flex" : "none";
}

function resetFileInput(fileInput) {
  fileInput.value = "";
}

// function extractHeaders(csv) {
//   // Assuming the first line of the CSV contains the headers
//   return csv
//     .split("\n")[0]
//     .split(",")
//     .map((header) => header.trim());
// }

function clearState() {
  // localStorage.removeItem('userCsvData');
  clearCsvTable();
}

function isEqual(obj1, obj2) {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (let key of obj1Keys) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !isEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

function isObject(object) {
  return object != null && typeof object === "object";
}
