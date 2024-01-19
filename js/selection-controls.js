import { RowTypes } from "./file-constants.js";
import { handleCheckboxChange } from "./checkbox-handling.js";

export function createSelectionControls(type) {
  // <input type="radio" id="unselectAll_${type}" name="selectionControl_${type}">
  //   <label for="unselectAll_${type}">Unselect All</label>

  if (type == RowTypes.NO_MATCH) {
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

export function setupSelectionControls(type) {
  if (type != RowTypes.NO_MATCH) {
    document
      .querySelector(`#selectDb_${type}`)
      .addEventListener("click", () => selectRows("database-row", type));
  }
  document
    .querySelector(`#selectFile_${type}`)
    .addEventListener("click", () => selectRows("user-row", type));
  document
    .querySelector(`#unselectAll_${type}`)
    .addEventListener("click", () => unselectRows(type));
}

function selectRows(rowType, tableType) {
  const table = document.querySelector(`#csvTable_${tableType}`);
  if (!table) return;

  table.querySelectorAll("tr").forEach((row) => {
    if (rowType === "" || row.classList.contains(rowType)) {
      const checkbox = row.querySelector(".row-checkbox");
      if (checkbox && !checkbox.checked) {
        checkbox.checked = rowType !== "";
        handleCheckboxChange({ target: checkbox });
      }
    }
  });
}

function unselectRows(tableType) {
  const table = document.querySelector(`#csvTable_${tableType}`);
  if (!table) return;

  const checkedCheckboxes = table.querySelectorAll("tr .row-checkbox:checked");
  if (checkedCheckboxes.length > 0) {
    checkedCheckboxes.forEach((checkbox) => {
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
