import { getDatabaseCsvHeaders } from "./data-manager.js";
import { getDatabaseMap } from "./comparison.js";
import { objectToCsvString } from "./comparison.js";
import { updateSelectedRows, deleteSelectedRows } from './export-manager.js';

const RowTypes = {
  MATCHING: "matching",
  PARTIAL: "partial",
  NO_MATCH: "no-match",
};

export const RowSource = {
  USER: "user-row",
  DATABASE: "database-row"
};

function areHeadersMatching(userHeaders) {
  const dbHeaders = getDatabaseCsvHeaders();
  return (
    userHeaders
      .split(",")
      .map((h) => h.trim())
      .join(",") === dbHeaders.join(",")
  );
}

// export function createCsvTable(rows, type) {
//   let table = '<table id="csvTable">';

//   if (!areHeadersMatching(rows[0])) {
//     return "<p>Error: CSV headers do not match the database headers.</p>";
//   }

//   // Add table headers (assuming the first row contains headers)
//   const headers = rows[0].split(",").map((header) => header.trim());
//   const headerRow = headers.map((header) => `<th>${header}</th>`).join("");
//   table += `<tr>${headerRow}</tr>`;

//   function getRowClass(index, type) {
//     if (type === RowTypes.NO_MATCH) {
//       return "no-match-user-row";
//     }
//     return index % 2 === 0 ? `${type}-database-row` : `${type}-user-row`;
//   }

//   // Add each data row to the table
//   for (let i = 1; i < rows.length; i++) {
//     const cells = rows[i].split(",").map((cell) => cell.trim());
//     const rowClass = getRowClass(i, type);

//     const checkboxHtml = `<input type="checkbox" class="row-checkbox" name="rowSelect${i}">`;
//     // Embed the checkbox within the first cell of the row
//     cells[0] = `${checkboxHtml}<span class="cell-content">${cells[0]}</span>`;

//     const rowHtml = cells.map((cell) => `<td class="relative-td">${cell}</td>`).join("");
//     table += `<tr class="${rowClass}" name="${i}">${rowHtml}</tr>`;

//     //table += `<tr class="${rowClass}">${rowHtml}</tr>`;
//   }

//   // const modifiedRows = addSelectionOptionsToRows(rows, type);
//   // modifiedRows.forEach(rowHtml => {
//   //   table += `<tr>${rowHtml}</tr>`;
//   // });

//   table += "</table>";

//   return table;
// }

// export function createCsvTableNew(rows, type) {
//   // let table = '<table id="csvTable">';
//   let table = `<table id="csvTable_${type}" class="csvTable">`;

//   // if (!areHeadersMatching(rows[0])) {
//     // return "<p>Error: CSV headers do not match the database headers.</p>";
//   // }

//   // Add table headers (assuming the first row contains headers)
//   const headers = rows[0].split(",").map((header) => header.trim());
//   const headerRow = headers.map((header) => `<th>${header}</th>`).join("");
//   const databaseMap=getDatabaseMap();
//   const dbHeaders = Object.keys([...databaseMap.values()][0]);

//   table += `<tr>${headerRow}</tr>`;

//   // ...existing setup code for headers...

//   // Loop through rows starting from index 1, since index 0 contains headers
//   for (let i = 1; i < rows.length; i++) {
//     console.log('rows ', rows);
//     // Check if row is an object with a pair_id (scan_code), indicating a user row
//     if (typeof rows[i] === 'object' && rows[i].pair_id) {
//       console.log('whatssss type'+type);
//       // Extract user row details
//       const userRow = rows[i];
//       // console.log(userRow.csv);
//       const dbItemId=userRow.pair_id;
//       const dbItem = databaseMap.get(dbItemId);
//       const userCells = userRow.csv.split(",").map(cell => cell.trim());
//       const userItemId= userCells[0];
//       const dbCells = dbItem ? objectToCsvString(dbItem, dbHeaders).split(",").map(cell => cell.trim()) : [];

//       // Generate HTML for user row
//       const userRowHtml = generateRowHtml(userCells, `user-row ${type}-user-row ${userItemId}`, userRow.pair_id, i, type);
//       // Generate HTML for corresponding DB row
//       // userCells[0] is user item scan_id
//       const dbRowHtml = dbItem ? generateRowHtml(dbCells, `database-row ${type}-database-row ${dbItemId}`, userItemId, i, type) : '';
      

//       // Add both rows to the table HTML
//       table += dbRowHtml + userRowHtml ;
//     } else if (type === RowTypes.NO_MATCH) {
//       console.log('whats rows ');
//       console.log(rows[i]);
//       // No matches don't have a pair_id, process normally
//       const cells = rows[i].split(",").map(cell => cell.trim());
//       const rowHtml = generateRowHtml(cells, 'no-match-user-row user-row', null, i, type);
//       table += rowHtml;
//     }
//   }

//   table += "</table>";
//   return table;
// }

// function generateRowHtml(cells, rowClass, pair_id, index, type) {
//   pair_id= pair_id ? pair_id : '';
//   const modifiedCells = [...cells];
//   const checkboxHtml = `<input type="checkbox" class="row-checkbox" data-pair-id="${pair_id}" name="rowSelect${index}">`;
//   modifiedCells[0] = `${checkboxHtml}<span class="cell-content">${cells[0]}</span>`;


//   // Determine the additional class for alternating colors
//   let colorClass = '';
//   if (type === RowTypes.MATCHING || type === RowTypes.PARTIAL) {
//     //colorClass = Math.floor((index - 1) / 2) % 2 === 0 ? `${type}-row-1` : `${type}-row-2`;
//     colorClass = (index % 2) === 0 ? `${type}-row-2` : `${type}-row-1`;
//   } 
//   // else if (type === RowTypes.NO_MATCH) {
//     // colorClass = 'no-match-user-row';
//   // }

//   const rowHtml = modifiedCells.map(cell => `<td class="relative-td">${cell}</td>`).join("");
//   return `<tr class="${rowClass} ${colorClass}" data-id="${cells[0]}" data-pair-id="${pair_id}">${rowHtml}</tr>`;
// }


export function displayResults(matchingItems, partialMatches, noMatches) {
  const matchingContent = document.querySelector(
    "#matchingItems .expandable-content .table-container"
  );
  const partialContent = document.querySelector(
    "#partialMatches .expandable-content .table-container"
  );
  const noMatchContent = document.querySelector(
    "#noMatches .expandable-content .table-container"
  );

  const matchingSelectionControls = createSelectionControls(RowTypes.MATCHING);
  const partialSelectionControls = createSelectionControls(RowTypes.PARTIAL);
  const noMatchSelectionControls = createSelectionControls(RowTypes.NO_MATCH);

  matchingContent.innerHTML = matchingSelectionControls + createCsvTableNew(matchingItems, RowTypes.MATCHING);
  partialContent.innerHTML = partialSelectionControls + createCsvTableNew(partialMatches, RowTypes.PARTIAL);
  noMatchContent.innerHTML = noMatchSelectionControls + createCsvTableNew(noMatches, RowTypes.NO_MATCH);

  document.querySelectorAll(".expandable-title").forEach((title) => {
    title.removeEventListener("click", toggleExpand);
    title.addEventListener("click", toggleExpand);
  });

  setupCheckboxes();
  setupSelectionControls(RowTypes.MATCHING);
  setupSelectionControls(RowTypes.PARTIAL);
  setupSelectionControls(RowTypes.NO_MATCH);

}

function unselectRows(tableType) {
  const table = document.querySelector(`#csvTable_${tableType}`);
  if (!table) return;

  const checkedCheckboxes = table.querySelectorAll('tr .row-checkbox:checked');
  if (checkedCheckboxes.length > 0) {
    checkedCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      handleCheckboxChange({ target: checkbox });
    });

    // Uncheck select radio buttons
    const selectDbRadio = document.querySelector(`#selectDb_${tableType}`);
    const selectFileRadio = document.querySelector(`#selectFile_${tableType}`);
    if (selectDbRadio) selectDbRadio.checked = false;
    if (selectFileRadio) selectFileRadio.checked = false;
  }
}

function selectRows(rowType, tableType) {
  const table = document.querySelector(`#csvTable_${tableType}`);
  if (!table) return;

  table.querySelectorAll('tr').forEach(row => {
    if (rowType === '' || row.classList.contains(rowType)) {
      const checkbox = row.querySelector('.row-checkbox');
      if (checkbox && !checkbox.checked) {
        checkbox.checked = rowType !== '';
        handleCheckboxChange({ target: checkbox });
      }
    }
  });
}

function createSelectionControls (type) {
  // <input type="radio" id="unselectAll_${type}" name="selectionControl_${type}">
  //   <label for="unselectAll_${type}">Unselect All</label>

  if (type == RowTypes.NO_MATCH){
    return `
    <div class="selection-controls">
      <div class="selection-buttons">
        <input type="radio" id="selectFile_${type}" name="selectionControl_${type}">
        <label for="selectFile_${type}">Select All File Entries</label>
      </div>
      <button id="unselectAll_${type}" class="unselect-button">Unselect All</button>
    </div>`;
  }
  return `
  <div class="selection-controls">
    <div class="selection-buttons">
      <input type="radio" id="selectDb_${type}" name="selectionControl_${type}">
      <label for="selectDb_${type}">Select All Database Entries</label>
      <input type="radio" id="selectFile_${type}" name="selectionControl_${type}">
      <label for="selectFile_${type}">Select All File Entries</label>
    </div>
    <button id="unselectAll_${type}" class="unselect-button">Unselect All</button>
  </div>`;
  
}

function setupSelectionControls(type) {
  if (type != RowTypes.NO_MATCH) {
    document.querySelector(`#selectDb_${type}`).addEventListener('click', () => selectRows('database-row', type));
  }
  document.querySelector(`#selectFile_${type}`).addEventListener('click', () => selectRows('user-row', type));
  document.querySelector(`#unselectAll_${type}`).addEventListener('click', () => unselectRows(type));
}


function setupCheckboxes() {
  // Add event listeners to all checkboxes
  document.querySelectorAll('.row-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
}

function handleCheckboxChange(event) {
  // Get the current checkbox and its state
  const currentCheckbox = event.target;
  const isChecked = currentCheckbox.checked;
  const currentRow = currentCheckbox.closest('tr');
  const currentRowType = currentRow.classList.contains('user-row') ? 'user-row' : 'database-row';
  const pairId = currentCheckbox.dataset.pairId;
  // const itemID = currentRow.getAttribute('data-id');
  const dataID = currentRow.dataset.id;

  const currentRowSource = currentRow.classList.contains(RowSource.USER) ? RowSource.USER : RowSource.DATABASE;

  updateSelectedRows(dataID, currentRowSource, isChecked);
  // Only proceed if the checkbox is being checked
  if (isChecked) {
    if (pairId){
    // Determine the class for the paired row based on the current row's class
      const pairedRowClass = currentRowType === 'user-row' ? 'database-row' : 'user-row';
      // Find the paired checkbox within the same table
      const pairedCheckbox = currentRow.parentNode.querySelector(`.${pairedRowClass}[data-id="${pairId}"] .row-checkbox`);
      // If a paired checkbox is found, uncheck it
      if (pairedCheckbox) {
        pairedCheckbox.checked = false;
      }
      if (pairId != dataID){ //partial matches should delete previous entry
        deleteSelectedRows(pairId);
      }
    }
    // else{ //no match
      // addSelectedUserRow(dataID);
    // }
  }
}

function toggleExpand() {
  let content = this.nextElementSibling;
  if (content.style.display === "none") {
    content.style.display = "block";
  } else {
    content.style.display = "none";
  }
}

export function clearCsvTable() {
  document.getElementById("csvDisplayArea").innerHTML = "";
}
