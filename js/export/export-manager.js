import { getDatabaseMap } from "../table-builders/comparison/comparison.js";
import { getDatabaseCsvHeaders } from "../data-manager.js";
import { objectToCsvString } from "../table-builders/comparison/comparison.js";
import { getUserMap } from "../table-builders/comparison/comparison.js";
import { RowSource, columnsForUpdate, databaseHeaders, exportHeaders, userHeaderMappings } from "../file-constants.js";
import { originalUserHeaders } from "../csv-file-helpers/user-header-to-db-header.js";
import { exportRowsMap, isSelectedKey } from "../table-builders/comparison/comparison.js";

// Global map to track selected rows
let selectedRowsMap = new Map();

export function clearSelectedRowsMap() {
  selectedRowsMap = new Map();
}

//returns array
function dataToExport() {
  console.log(exportRowsMap);
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
  debugger
  const exportData = dataToExport(); // Use the modified prepareForExport function

  if (exportData.length === 0) {
    alert("No Rows Selected for Export");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include UTF-8 BOM for Excel compatibility

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

// export function exportSelectedRowsToCsvWithExportHeaders() {
//   const exportData = dataToExport(); // Prepare data based on selected rows

//   if (exportData.length === 0) {
//     alert("No Rows Selected for Export");
//     return;
//   }

//   let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Initialize CSV content with UTF-8 BOM for Excel compatibility

//   // Construct the CSV header row, ensuring headers are properly quoted
//   const headersRow = Object.values(exportHeaders).map(header => `"${header.exportName.replace(/"/g, '""')}"`); // Ensure special characters are maintained and double quotes are escaped
//   csvContent += headersRow.join(",") + "\r\n";

//   exportData.forEach(row => {
//     const rowCsv = Object.entries(exportHeaders).map(([internalHeader, { defaultValue }]) => {
//       let cellValue;
//       if (row.hasOwnProperty(internalHeader)) {
//         cellValue = row[internalHeader];
//       } else {
//         // Apply default value if the property is not found, except for databaseHeaders
//         cellValue = databaseHeaders.includes(internalHeader) ? '' : defaultValue;
//       }
//       // Encode cell values to handle special characters like hashtags and ensure they are properly quoted
//       cellValue = encodeURIComponent(cellValue.toString()).replace(/"/g, '""');
//       // Replace encoded spaces with actual spaces for readability in CSV
//       cellValue = cellValue.replace(/%20/g, ' ');
//       return `"${cellValue}"`;
//     }).join(",");

//     csvContent += rowCsv + "\r\n";
//   });

//   // Encode the entire CSV content
//   const encodedUri = encodeURI(csvContent);
//   //to fix # issue that was causing it to halt the export
//   const fixedEncodedURI = encodedUri.replaceAll('#', '%23');
//   const link = document.createElement("a");
//   link.setAttribute("href", fixedEncodedURI);
//   link.setAttribute("download", "exported_data.csv"); // Set the filename for the exported CSV
//   document.body.appendChild(link); // Required for Firefox and other browsers that may block direct clicking
//   link.click(); // Trigger the download
//   document.body.removeChild(link); // Clean up by removing the link element
// }


// Function to generate a CSV row for a given data object
// function generateCsvRow(row) {
//   return Object.entries(exportHeaders).map(([internalHeader, { defaultValue }]) => {
//     let cellValue = row[internalHeader] !== undefined ? row[internalHeader] : defaultValue;
//     if (databaseHeaders.includes(internalHeader) && cellValue === defaultValue) {
//       cellValue = ''; // Leave blank for database headers if no value is present
//     }
//     return `"${cellValue.toString().replace(/"/g, '""')}"`; // Handle internal quotes
//   }).join(",");
// }

// export function exportSelectedRowsToCsvWithExportHeaders2() {
//   const exportData = dataToExport(); // Prepare data based on selected rows

//   if (exportData.length === 0) {
//     alert("No Rows Selected for Export");
//     return;
//   }

//   let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Initialize CSV content with UTF-8 BOM for Excel compatibility
//   // const headersRow = Object.values(exportHeaders).map(header => header.exportName).join(","); // Construct the CSV header row
//   // csvContent += headersRow + "\r\n";
//   // Construct the CSV header row, ensuring headers are properly quoted and encoded if necessary
//   const headersRow = Object.values(exportHeaders).map(header => {
//     debugger
//     const encodedHeader = encodeURIComponent(header.exportName).replace(/"/g, '""').replace(/%20/g, ' '); // Encode and then replace encoded spaces with actual spaces
//     return `"${encodedHeader}"`;
//   });
//   csvContent += headersRow.join(",") + "\r\n";

//   // Generate CSV rows for each data object
//   exportData.forEach(row => {
//     const rowCsv = generateCsvRow(row);
//     csvContent += rowCsv + "\r\n";
//   });

//   // Code to trigger the download...
//   triggerCsvDownload(csvContent);
// }

// Function to trigger CSV download
// function triggerCsvDownload(csvContent) {
//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "exported_data.csv");
//   document.body.appendChild(link); // Required for Firefox
//   link.click(); // Trigger the download
//   document.body.removeChild(link); // Clean up after download
// }


// export function exportSelectedRowsToCsv2() {
//   if (selectedRowsMap.size === 0) {
//     const checkboxes = document.querySelectorAll('input.row-checkbox:checked');
//     if (checkboxes.length != 0) {
//       alert("Please make sure file includes required headers");
//       return;
//     }
//     alert("No Rows Selected");
//     return;
//   }

//   let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include UTF-8 BOM for Excel compatibility

//   // Map originalUserHeaders to their corresponding database headers
//   const mappedUserHeaders = originalUserHeaders.map(originalHeader =>
//     getDatabaseHeaderFromUserHeader(originalHeader)
//   );

//   csvContent += originalUserHeaders.join(",") + "\r\n"; // Use mapped user headers for the CSV header row

//   selectedRowsMap.forEach(row => {
//     const rowCsv = mappedUserHeaders.map(mappedHeader => {
//       // Directly use the value if it exists under the mapped header
//       const cellValue = (mappedHeader in row) ? row[mappedHeader] : "";
//       return `"${cellValue.toString().replace(/"/g, '""')}"`; // Handle internal quotes
//     }).join(",");

//     csvContent += rowCsv + "\r\n";
//   });

//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "selected_rows.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

// // Function to get the database header from the user header using userHeaderMappings
// function getDatabaseHeaderFromUserHeader(userHeader) {
//   for (const dbHeader in userHeaderMappings) {
//     if (userHeaderMappings[dbHeader].includes(userHeader)) {
//       return dbHeader;
//     }
//   }
//   // If not found, return the user header itself
//   return userHeader;
// }



/**
 * Main function to export selected rows to a CSV file.
 */
export function exportSelectedRowsToCsvWithExportHeaders() {
  const exportData = dataToExport(); // Prepare data based on selected rows

  if (exportData.length === 0) {
    alert("No Rows Selected for Export");
    return;
  }

  const csvContent = constructCsvContent(exportData);
  triggerCsvDownload(csvContent);
}

/**
 * Constructs the CSV content as a string.
 * @param {Array} exportData - The data to be exported.
 * @return {string} The CSV content.
 */
function constructCsvContent(exportData) {
  let csvContent = initializeCsvContent();
  csvContent += constructHeadersRow() + "\r\n";

  exportData.forEach(row => {
    csvContent += constructDataRow(row) + "\r\n";
  });

  return encodeCsvContent(csvContent);
}

/**
 * Initializes CSV content with UTF-8 BOM for Excel compatibility.
 * @return {string} The initial CSV content.
 */
function initializeCsvContent() {
  return "data:text/csv;charset=utf-8,\uFEFF";
}

/**
 * Constructs the header row for the CSV file.
 * @return {string} The CSV header row.
 */
function constructHeadersRow() {
  return Object.values(exportHeaders).map(header =>
    `"${header.exportName.replace(/"/g, '""')}"`
  ).join(",");
}

/**
 * Constructs a single data row for the CSV file by mapping over the defined export headers
 * and fetching the corresponding values from the data row. Handles default values for missing data
 * and ensures that values from database headers are maintained correctly.
 * @param {Object} row - The data row to be included in the CSV, representing an object where keys are column names.
 * @return {string} The CSV data row, where each cell is properly formatted for CSV.
 */
function constructDataRow(row) {
  // Construct an array of cell values for the row
  const cellValues = Object.entries(exportHeaders).map(([internalHeader, { defaultValue }]) => {
    // Check if the property exists in the row and its value is neither null, undefined, nor an empty string
    const cellValue = row.hasOwnProperty(internalHeader) && row[internalHeader] ? row[internalHeader] : defaultValue;

    // For database headers, use an empty string if the value is not meaningfully present
    if (databaseHeaders.includes(internalHeader) && !row.hasOwnProperty(internalHeader)) {
      return formatCsvCell(''); // Use an empty string for missing database header values
    }

    // Format the cell value for CSV
    return formatCsvCell(cellValue);
  });

  // Join the constructed cell values with a comma to form a complete CSV row
  return joinCsvRow(cellValues);
}


/**
 * Joins an array of CSV cell values into a single CSV row.
 * @param {Array} cellValues - An array of formatted cell values.
 * @return {string} A CSV row constructed by joining the cell values with commas.
 */
function joinCsvRow(cellValues) {
  return cellValues.join(",");
}


/**
 * Formats a cell value for CSV, ensuring proper quoting. Handles `null` and `undefined` gracefully,
 * and avoids unnecessary URI encoding.
 * @param {string} cellValue - The value of the cell to format.
 * @return {string} The formatted cell value. Returns an empty string for `null` or `undefined` values.
 */
function formatCsvCell(cellValue) {
  if (cellValue === null || cellValue === undefined) {
    return '""'; // Represents an empty cell in CSV
  }

  try {
    // Convert the cell value to a string to prevent errors
    let formattedValue = cellValue.toString();

    // Escape double quotes by doubling them (CSV standard for escaping quotes)
    formattedValue = formattedValue.replace(/"/g, '""');

    // Enclose the cell value in double quotes
    return `"${formattedValue}"`;
  } catch (error) {
    console.error(`Error formatting cell value: ${error}`);
    // throw new Error(`Failed to format cell value: ${cellValue}. Error: ${error.message}`);
  }
}


/**
 * Encodes and prepares the CSV content for download, fixing any potential issues with special characters.
 * @param {string} csvContent - The CSV content to encode.
 * @return {string} The encoded and fixed CSV content ready for download.
 */
function encodeCsvContent(csvContent) {
  const encodedUri = encodeURI(csvContent);
  return encodedUri.replaceAll('#', '%23'); // Fix issues with special characters like '#'
}

/**
 * Triggers the download of the CSV content by creating a hidden link and simulating a click.
 * @param {string} csvContent - The encoded CSV content to download.
 */
function triggerCsvDownload(csvContent) {
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "exported_data.csv"); // Set the filename for the exported CSV
  document.body.appendChild(link); // Required for Firefox
  link.click(); // Trigger the download
  document.body.removeChild(link); // Clean up
}
