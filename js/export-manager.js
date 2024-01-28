import { getDatabaseMap } from "./comparison.js";
import { getDatabaseCsvHeaders } from "./data-manager.js";
import { objectToCsvString } from "./comparison.js";
import { getUserMap } from "./comparison.js";
import { RowSource } from "./table.js";
import { databaseHeaders, columnsForUpdate, userHeaderMappings } from "./file-constants.js";
import { originalUserHeaders } from "./user-header-to-db-header.js";


// Global map to track selected rows
let selectedRowsMap = new Map();

export function clearSelectedRowsMap(){
  selectedRowsMap= new Map();
}
// export function updateSelectedRows(id, rowSource, isChecked, pairId) {
//   if (isChecked) {
//     let entry=null;
//     entry = getEntryBySouce(id, rowSource);
//     if (entry){
//       selectedRowsMap.set(id, entry);
//     }
//   } else {
//     deleteSelectedRows(id);
//   }
//   // console.log(selectedRowsMap);
// }

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

// export function updateSelectedRows(id, rowSource, isChecked, pairId) {
//   if (isChecked) {
//     let entry = null;
//     if (rowSource == RowSource.DATABASE) {
//       const dbEntry = getDatabaseMap().get(id);
//       const userEntry = getUserMap().get(pairId);
//       if (dbEntry && userEntry) {
//         // Iterate through the databaseHeaders array
//         databaseHeaders.forEach(header => {
//           // Check if the key exists in both entries and update user entry if it does
//           if (dbEntry.hasOwnProperty(header) && userEntry.hasOwnProperty(header)) {
//             userEntry[header] = dbEntry[header];
//           }
//         });
//         entry = userEntry;
//       }
//     } else if (rowSource == RowSource.USER) {
//       entry = getUserMap().get(id);
//     }
//     if (entry) {
//       selectedRowsMap.set(id, entry);
//     }
//   } else {
//     deleteSelectedRows(id);
//   }
//   // console.log(selectedRowsMap);
// }

// function getEntryBySouce(id, rowSource){
//   let entry=null;
//   if (rowSource == RowSource.DATABASE){
//     entry= getDatabaseMap().get(id);
//   }
//   else if (rowSource == RowSource.USER){
//     entry = getUserMap().get(id);
//   }
//   return entry;
// }

export function deleteSelectedRows(id) {
  if (selectedRowsMap.get(id)){
    selectedRowsMap.delete(id);
  }
  // console.log(selectedRowsMap);
}

// export function exportSelectedRowsToCsv() {
//   if (selectedRowsMap.size==0){
//     alert("No Rows Selected");
//     return;
//   }

//   let csvContent = "data:text/csv;charset=utf-8,";

//   // Retrieve the headers from your data source
//   const headers = getDatabaseCsvHeaders(); // Assuming this function returns an array of header strings
//   csvContent += headers.join(",") + "\r\n";

//   // Iterate over the selectedRowsMap to add each row to the CSV content
//   console.log(selectedRowsMap);
//   selectedRowsMap.forEach((row) => {
//     // Convert the row object to a CSV string if necessary
//     //let rowCsv = Array.isArray(row) ? row.join(",") : objectToCsvString(row, headers);
//     let rowCsv = objectToCsvString(row, headers);
//     csvContent += rowCsv + "\r\n";
//   });

//   // Trigger the download
//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "selected_rows.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

// export function exportSelectedRowsToCsv() {
//   if (selectedRowsMap.size === 0) {
//       alert("No Rows Selected");
//       return;
//   }

//   let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include UTF-8 BOM for Excel compatibility
//   csvContent += originalUserHeaders.join(",") + "\r\n"; // Use original user headers for the CSV header row
//   console.log('whats original ');
//   console.log(originalUserHeaders);

//   // Iterate over the selected rows
//   selectedRowsMap.forEach(row => {
//       console.log('whats row ');
//       console.log(row);
//       console.log('whataa are original user headers ');
//       console.log(originalUserHeaders);
//       const rowCsv = originalUserHeaders.map(originalHeader => {
//           // Reverse mapping: Find the database header that corresponds to the original user header
//           const dbHeader = Object.keys(userHeaderMappings).find(key => 
//               userHeaderMappings[key].includes(originalHeader) || key === originalHeader);
//           const cellValue = row[dbHeader] || row[originalHeader];
//           return `"${cellValue.toString().replace(/"/g, '""')}"`; // Handle internal quotes
//       }).join(",");
//       csvContent += rowCsv + "\r\n";
//   });

//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "selected_rows.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }


export function exportSelectedRowsToCsv() {
  if (selectedRowsMap.size === 0) {
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
