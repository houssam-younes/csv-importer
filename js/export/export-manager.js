import { getDatabaseMap } from "../table-builders/comparison/comparison.js";
import { getDatabaseCsvHeaders } from "../data-manager.js";
import { objectToCsvString } from "../table-builders/comparison/comparison.js";
import { getUserMap } from "../table-builders/comparison/comparison.js";
import { RowSource, columnsForUpdate, userHeaderMappings } from "../file-constants.js";
import { originalUserHeaders } from "../csv-file-helpers/user-header-to-db-header.js";
import { exportRowsMap, isSelectedKey } from "../table-builders/comparison/comparison.js";

// Global map to track selected rows
let selectedRowsMap = new Map();

export function clearSelectedRowsMap() {
  selectedRowsMap = new Map();
}

//returns array
function dataToExport() {
  const exportData = [];
  exportRowsMap.forEach((userItem) => {
    if (userItem[isSelectedKey]) { // Check if the item is selected
      // Initialize an empty object for the item to export
      let itemForExport = {};

      // Iterate over all keys in the userItem
      Object.keys(userItem).forEach(key => {
        // Copy all properties except the isSelectedKey
        if (key !== isSelectedKey.toString()) {
          itemForExport[key] = userItem[key];
        }
      });

      // Add the cleaned item to the export data array
      exportData.push(itemForExport);
    }
  });
  return exportData;
}


export function updateSelectedRows(id, rowSource, isChecked, pairId) {
  if (!isChecked) {
    deleteSelectedRows(id);
    return;
  }

  let entry = null;
  if (rowSource === RowSource.DATABASE) {
    entry = updateUserEntryFromDatabase(id, pairId);
  } else if (rowSource === RowSource.USER) {
    entry = getUserMap().get(id);
  }

  if (entry) {
    selectedRowsMap.set(id, entry);
  }
}

function updateUserEntryFromDatabase(databaseId, pairId) {
  const dbEntry = getDatabaseMap().get(databaseId);
  const userEntryOriginal = getUserMap().get(pairId);

  if (!dbEntry || !userEntryOriginal) {
    return null;
  }

  // Create a shallow copy of the user entry
  const userEntryCopy = { ...userEntryOriginal };

  columnsForUpdate.forEach(header => {
    if (Object.prototype.hasOwnProperty.call(dbEntry, header) &&
      Object.prototype.hasOwnProperty.call(userEntryCopy, header)) {
      userEntryCopy[header] = dbEntry[header];
    }
  });

  return userEntryCopy;
}

export function deleteSelectedRows(id) {
  if (selectedRowsMap.get(id)) {
    selectedRowsMap.delete(id);
  }
  // console.log(selectedRowsMap);
}

export function exportSelectedRowsToCsv() {
  const exportData = dataToExport(); // Use the modified prepareForExport function

  if (exportData.length === 0) {
    alert("No Rows Selected for Export");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include UTF-8 BOM for Excel compatibility

  console.log('whats export data ');
  console.log(exportData);
  // Assuming the first item in exportData has all the headers
  const headers = Object.keys(exportData[0]);

  csvContent += headers.join(",") + "\r\n"; // Adding headers to CSV content

  exportData.forEach(row => {
    const rowCsv = headers.map(header => {
      const cellValue = row[header] ? row[header].toString() : "";
      // Handle internal quotes by doubling them
      return `"${cellValue.replace(/"/g, '""')}"`;
    }).join(",");

    csvContent += rowCsv + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "selected_exported_rows.csv"); // Set the file name for the exported CSV
  document.body.appendChild(link); // Required for Firefox
  link.click(); // Trigger the download
  document.body.removeChild(link); // Clean up
}

export function exportSelectedRowsToCsv2() {
  if (selectedRowsMap.size === 0) {
    const checkboxes = document.querySelectorAll('input.row-checkbox:checked');
    if (checkboxes.length != 0) {
      alert("Please make sure file includes required headers");
      return;
    }
    alert("No Rows Selected");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include UTF-8 BOM for Excel compatibility

  // Map originalUserHeaders to their corresponding database headers
  const mappedUserHeaders = originalUserHeaders.map(originalHeader =>
    getDatabaseHeaderFromUserHeader(originalHeader)
  );

  csvContent += originalUserHeaders.join(",") + "\r\n"; // Use mapped user headers for the CSV header row

  selectedRowsMap.forEach(row => {
    const rowCsv = mappedUserHeaders.map(mappedHeader => {
      // Directly use the value if it exists under the mapped header
      const cellValue = (mappedHeader in row) ? row[mappedHeader] : "";
      return `"${cellValue.toString().replace(/"/g, '""')}"`; // Handle internal quotes
    }).join(",");

    csvContent += rowCsv + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "selected_rows.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Function to get the database header from the user header using userHeaderMappings
function getDatabaseHeaderFromUserHeader(userHeader) {
  for (const dbHeader in userHeaderMappings) {
    if (userHeaderMappings[dbHeader].includes(userHeader)) {
      return dbHeader;
    }
  }
  // If not found, return the user header itself
  return userHeader;
}
