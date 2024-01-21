import { getDatabaseMap } from "./comparison.js";
import { getDatabaseCsvHeaders } from "./data-manager.js";
import { objectToCsvString } from "./comparison.js";
import { getUserMap } from "./comparison.js";
import { RowSource } from "./table.js";
import { databaseHeaders, columnsForUpdate } from "./file-constants.js";

// Global map to track selected rows
const selectedRowsMap = new Map();

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

export function exportSelectedRowsToCsv() {
  if (selectedRowsMap.size==0){
    alert("No Rows Selected");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";

  // Retrieve the headers from your data source
  const headers = getDatabaseCsvHeaders(); // Assuming this function returns an array of header strings
  csvContent += headers.join(",") + "\r\n";

  // Iterate over the selectedRowsMap to add each row to the CSV content
  selectedRowsMap.forEach((row) => {
    // Convert the row object to a CSV string if necessary
    let rowCsv = Array.isArray(row) ? row.join(",") : objectToCsvString(row, headers);
    csvContent += rowCsv + "\r\n";
  });

  // Trigger the download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "selected_rows.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// export function addSelectedUserRow(id) {
//   let userRow= getUserMap().get(id);
//   if (userRow){
//     selectedRowsMap.set(id, userRow);
//   }
// }

// export function exportSelectedRowsToCsv(getDatabaseCsvHeaders) {
//   let csvContent = "data:text/csv;charset=utf-8,";

//   // Add CSV headers
//   csvContent += getDatabaseCsvHeaders().join(",") + "\r\n";

//   // Add each selected row to the CSV
//   selectedRowsMap.forEach((rowCsv) => {
//     csvContent += rowCsv + "\r\n";
//   });

//   // Trigger CSV download
//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "selected_rows.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }
