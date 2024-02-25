import { RowSource, RowTypes } from "../file-constants.js";
import { databaseHeaders } from "../file-constants.js";
import { getDatabaseMap } from "./comparison/comparison.js";
import { CELL_INDICES } from "../file-constants.js";
import { handleDropdownChange, handleSourceChange } from "../export/dropdown-listeners.js";

export let PricePercentageArray = [];
export let PriceDifferenceArrayTypeMatching = [];
export let CostPercentageArray = [];
export let CostDifferenceArrayTypeMatching = [];

export function resetPriceCostTables() {
  PricePercentageArray = [];
  PriceDifferenceArrayTypeMatching = [];
  CostPercentageArray = [];
  CostDifferenceArrayTypeMatching = [];
}

// Helper function to calculate the average of an array
export function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

export function areHeadersMatching(userHeaders) {
  const dbHeaders = databaseHeaders;
  return (
    userHeaders
      .split(",")
      .map((h) => h.trim())
      .join(",") === dbHeaders.join(",")
  );
}

/**
 * Generates a table row (tr element) including dynamic cells with dropdowns and comparison results.
 * 
 * @param {Array<string>} cells - Cell content for the row.
 * @param {string} rowClass - The CSS class to apply to the row.
 * @param {string} pair_id - The pair ID associated with the row, for linking related rows.
 * @param {number} index - The index of the row, used for creating unique identifiers.
 * @param {string} type - The type of row, affecting styling and content generation.
 * @param {boolean} isExportRow - Indicates if the row is an export row, affecting content generation.
 * @param {Array<string>} dbCells - Additional cell content for database rows, if applicable.
 * @return {HTMLElement} The constructed table row (tr element).
 */
export function generateRowHtml(cells, rowClass, pair_id, index, type, isExportRow = false, dbCells = []) {
  const row = document.createElement('tr');
  row.className = `${rowClass} ${getRowColorClass(index, type, isExportRow)}`;
  let userItemId = cells[0]; //scan code set up to be first, even if not first in user csv file
  row.setAttribute('data-id', userItemId);
  row.setAttribute('data-pair-id', pair_id || "");
  if (isExportRow) {
    row.setAttribute('data-scan-code', userItemId); // Use userItemId as the initial scan code
  }

  const tdSourceColumn = document.createElement('td');
  tdSourceColumn.className = 'source-column';
  const sourceColumnDom = createSourceColumnContent(rowClass, type, index, isExportRow);
  tdSourceColumn.appendChild(sourceColumnDom);
  row.appendChild(tdSourceColumn);

  cells.forEach((cell, cellIndex) => {
    const td = document.createElement('td');
    td.className = 'relative-td';
    const cellContentWrapper = document.createElement('div');
    cellContentWrapper.className = 'cell-content-wrapper js-td-wrapper';

    // Create a div for the cell content instead of a text node
    const contentDiv = document.createElement('div');
    contentDiv.className = 'js-ui-value'; // Assign the 'js-ui-value' class to this div
    contentDiv.textContent = cell; // Set the cell content as the text content of the div

    // Append the contentDiv to the cellContentWrapper
    cellContentWrapper.appendChild(contentDiv);

    if (isExportRow) {
      const isPriceOrCostCell = cellIndex === CELL_INDICES.price || cellIndex === CELL_INDICES.cost;
      isPriceOrCostCell ? td.classList.add('fixed-width-cell') : null;
      if (isExportRowWithMatchingPair(pair_id, rowClass) && isPriceOrCostCell) {
        const comparisonResultDom = cellIndex === CELL_INDICES.price
          ? addPriceCompareToTD(cell, pair_id)
          : addCostCompareToTD(cell, pair_id);
        cellContentWrapper.appendChild(comparisonResultDom);
      }

      // Append the dropdown for export rows
      const dropdownDom = createDropdownForCellSelection(index, cellIndex, cellIndex === CELL_INDICES.price, userItemId);
      cellContentWrapper.appendChild(dropdownDom);
    }

    td.appendChild(cellContentWrapper);
    row.appendChild(td);
  });

  return row;
}

/**
 * Generates a table row (tr element) for export, including source column content and dynamic cells with dropdowns.
 * 
 * @param {Array<string>} userCells - Cell content for the row.
 * @param {string} rowClass - The CSS class to apply to the row.
 * @param {string} userItemId - The unique identifier for the user's item.
 * @param {string} pairId - The pair ID associated with the row, for linking related rows.
 * @param {number} index - The index of the row, used for creating unique identifiers.
 * @param {string} type - The type of row, affecting styling and content generation.
 * @return {HTMLElement} The constructed table row (tr element).
 */
export function generateExportRowHtml(userCells, rowClass, userItemId, pairId, index, type) {
  const row = document.createElement('tr');
  row.className = `${rowClass} ${getRowColorClass(index, type, true)}`;
  row.setAttribute('data-id', userItemId);
  row.setAttribute('data-pair-id', pairId);
  row.setAttribute('data-scan-code', userItemId); // Use userItemId as the initial scan code

  const sourceColumnDom = createSourceColumnContent(rowClass, type, index, true);
  const tdSourceColumn = document.createElement('td');
  tdSourceColumn.className = 'source-column';
  tdSourceColumn.appendChild(sourceColumnDom);
  row.appendChild(tdSourceColumn);

  userCells.forEach((cell, cellIndex) => {
    const td = document.createElement('td');
    td.className = 'relative-td';
    const cellContentWrapper = document.createElement('div');
    cellContentWrapper.className = 'cell-content-wrapper js-td-wrapper';

    const isPriceOrCostCell = cellIndex === CELL_INDICES.price || cellIndex === CELL_INDICES.cost;

    isPriceOrCostCell ? td.classList.add('fixed-width-cell') : null;

    // Handle price or cost cell comparison
    if (isExportRowWithMatchingPair(pairId, rowClass) && isPriceOrCostCell) {
      const comparisonResultDom = cellIndex === CELL_INDICES.price
        ? addPriceCompareToTD(cell, pairId)
        : addCostCompareToTD(cell, pairId); // Assuming addCostCompareToTD is similarly updated
      cellContentWrapper.appendChild(comparisonResultDom);
    } else {
      // Create a div for the cell content instead of a text node
      const contentDiv = document.createElement('div');
      contentDiv.className = 'js-ui-value'; // Assign the 'js-ui-value' class to this div
      contentDiv.textContent = cell; // Set the cell content as the text content of the div

      // Append the contentDiv to the cellContentWrapper
      cellContentWrapper.appendChild(contentDiv);
    }

    // Add dropdowns for making selections, attach userItemId and pairId for tracking
    const dropdownDom = createDropdownForCellSelection(index, cellIndex, cellIndex === CELL_INDICES.price, userItemId, pairId);
    cellContentWrapper.appendChild(dropdownDom);

    td.appendChild(cellContentWrapper);
    row.appendChild(td);
  });

  return row;
}

function createStaticSourceText(rowClass) {
  const textNode = document.createTextNode(
    rowClass.includes(RowSource.DATABASE) ? "Database" : "File"
  );
  const span = document.createElement("span"); // Create a span to hold the text
  span.appendChild(textNode);
  return span; // Return a span element containing the text
}

function createDropdownForSourceSelection(index) {
  const container = document.createElement("div");
  container.className = "dropdown-container";

  const label = document.createElement("label");
  label.setAttribute("for", `sourceSelect${index}`);
  label.className = "source-label";
  label.textContent = "Select source:";

  const select = document.createElement("select");
  select.id = `sourceSelect${index}`;
  select.name = `sourceSelect${index}`;
  select.className = "source-select js-tr-select";

  const optionUser = document.createElement("option");
  optionUser.value = "use_source_file"; // Ensure this matches the value expected in your dropdown logic
  optionUser.textContent = "User";

  const optionDatabase = document.createElement("option");
  optionDatabase.value = "use_source_database"; // Ensure this matches the value expected in your dropdown logic
  optionDatabase.textContent = "Database";

  select.appendChild(optionUser);
  select.appendChild(optionDatabase);

  // Add event listener for handling changes
  select.addEventListener('change', (event) => {
    handleSourceChange(event);
  });

  container.appendChild(label);
  container.appendChild(select);

  return container; // Return the container div with all elements inside
}


function createCheckboxForRow(prefix, index) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "row-checkbox";
  checkbox.setAttribute("data-pair-id", `${prefix}_${index}`);
  checkbox.name = `${prefix}Checkbox${index}`;

  return checkbox; // Return the checkbox input element
}

/**
 * Creates a dropdown element for cell selection within a row. The dropdown includes options based on
 * the cell type and context. If the cell is a price cell, a custom option is included. The 'Database' option
 * is included only if a pairId is provided, indicating database mapping is available for that row.
 *
 * @param {number} index - The index of the row, used for naming the dropdown.
 * @param {number} cellIndex - The index of the cell within the row, used for naming the dropdown.
 * @param {boolean} isPriceCell - Indicates if the dropdown is for a price cell, which includes a 'Custom' option.
 * @param {string} userItemId - Identifier for the user's item, used in event handling.
 * @param {string} [pairId] - Optional pair identifier for the row, used to determine if the 'Database' option should be included.
 * @return {HTMLElement} The constructed select element with configured event listener for dynamic updates.
 */
function createDropdownForCellSelection(index, cellIndex, isPriceCell, userItemId, pairId = null) {
  const dropdown = document.createElement('select');
  dropdown.className = 'cell-dropdown js-td-select';
  dropdown.name = `cellSelect${index}_${cellIndex}`;

  var selectedOption = 'use_file';

  // Base option 'File' is always included
  const options = [{ value: selectedOption, text: 'File', selected: true }];
  // Initially set the 'data-prev-value' to the default selected option value
  dropdown.setAttribute('data-prev-value', 'use_file');

  // Include 'Database' option if pairId is provided
  if (pairId) {
    options.push({ value: 'use_database', text: 'Database' });
  }

  // Include 'Custom' option for price cells
  if (isPriceCell) {
    options.push({ value: 'custom', text: 'Custom' });
  }

  // Append options to the dropdown
  options.forEach(({ value, text }) => {
    const optionElement = document.createElement('option');
    optionElement.value = value;
    optionElement.textContent = text;
    dropdown.appendChild(optionElement);
  });

  // Add event listener for handling changes
  dropdown.addEventListener('change', (event) => {
    const row = event.target.closest('tr'); // Find the parent row
    const currentScanCode = row.getAttribute('data-scan-code'); // Get the current scan code
    handleDropdownChange(userItemId, pairId, cellIndex, currentScanCode, event.target);
  });

  return dropdown;
}


/**
 * Handles change events for dropdowns in export rows, logging relevant identifiers.
 * 
 * @param {string} userItemId - Identifier for the user's item involved in the change.
 * @param {string} pairId - Pair identifier for the row where the change occurred.
 */
function dropdownChanged(userItemId, pairId) {
  console.log(`Dropdown changed for userItemId: ${userItemId}, pairId: ${pairId}`);
  // Implement further logic as needed
}


function getRowColorClass(index, type, isExportRow) {
  let colorClass = "";
  if (type === RowTypes.MATCHING || type === RowTypes.PARTIAL) {
    colorClass = index % 2 === 0 ? `${type}-row-2` : `${type}-row-1`;
  }
  if (!isExportRow) {
    colorClass += " read-only-row"; // Additional class for read-only styling
  }
  return colorClass;
}

/**
 * Creates a container DOM element for the source column content based on the row type and export status.
 *
 * @param {string} rowClass - The class indicating the row's source, such as database or file.
 * @param {string} type - The type of row, determining the content to generate (e.g., no match, export row).
 * @param {number} index - The index of the row, used for creating unique identifiers.
 * @param {boolean} isExportRow - Flag indicating if the row is an export row.
 * @return {HTMLElement} A div element containing the appropriate children based on the row type and export status.
 */
function createSourceColumnContent(rowClass, type, index, isExportRow) {
  const container = document.createElement("div");

  if (type === RowTypes.NO_MATCH && isExportRow) {
    container.appendChild(createStaticSourceText(rowClass));
    container.appendChild(createCheckboxForRow("nomatch", index));
  } else if (isExportRow) {
    container.appendChild(createCheckboxForRow("export", index));
    container.appendChild(createDropdownForSourceSelection(index));
  } else {
    container.appendChild(createStaticSourceText(rowClass));
  }

  return container; // Return the container DOM element directly
}

function isExportRowWithMatchingPair(pair_id, rowClass) {
  return pair_id && rowClass.includes(RowSource.EXPORT);
}

/**
 * Creates a DOM element to compare the user cost with the database cost, highlighting differences.
 * 
 * @param {string} cellValue - The value of the cell containing the user's cost.
 * @param {string} pair_id - The pair ID used to retrieve the corresponding database cost.
 * @return {HTMLElement} The DOM element with the comparison result.
 */
function addCostCompareToTD(cellValue, pair_id) {
  const userCost = parseFloat(cellValue);
  const databaseCost = parseFloat(getCostFromDatabaseMap(pair_id));

  const compareContainer = document.createElement('div');
  compareContainer.className = 'compare-td-container';

  const costContainer = document.createElement('div');
  costContainer.className = 'cost-container js-ui-value';
  costContainer.textContent = cellValue;
  compareContainer.appendChild(costContainer);

  if (isNaN(userCost) || isNaN(databaseCost)) {
    // If either cost is not a valid number, return the original cell content
    return compareContainer; // Return as is, with just the cellValue
  }

  const infoContainer = document.createElement('div');
  infoContainer.className = 'cost-info-container';

  let infoText;
  const costDifference = userCost - databaseCost;
  let percentageDifference = databaseCost === 0 ? "N/A" : (costDifference / databaseCost) * 100;

  const sign = value => value >= 0 ? "+" : "";
  const costDifferenceDisplay = `${sign(costDifference)}${costDifference.toFixed(2)}$`;

  let percentageDisplay = percentageDifference === "N/A" ? "N/A" : `${sign(percentageDifference)}${percentageDifference.toFixed(2)}%`;
  const colorClass = costDifference >= 0 ? 'red-color-class' : 'green-color-class';

  if (userCost === databaseCost) {
    infoText = document.createElement('span');
    infoText.className = 'cost-info cost-match';
    infoText.textContent = 'Match';
  } else {
    const differenceSpan = document.createElement('span');
    differenceSpan.className = `cost-difference ${colorClass}`;
    differenceSpan.textContent = costDifferenceDisplay;

    infoText = document.createElement('span');
    infoText.className = `cost-info ${colorClass}`;
    infoText.textContent = databaseCost === 0 ? "N/A" : `${percentageDisplay}`;

    infoContainer.appendChild(differenceSpan);
  }

  infoContainer.appendChild(infoText);
  compareContainer.appendChild(infoContainer);

  return compareContainer;
}

function getCostFromDatabaseMap(pair_id) {
  let cost = getDatabaseMap().get(pair_id)?.cost;
  return cost || "N/A";
}

/**
 * Creates a DOM element to compare the user price with the database price, highlighting differences.
 * 
 * @param {string} cellValue - The value of the cell containing the user's price.
 * @param {string} pair_id - The pair ID used to retrieve the corresponding database price.
 * @return {HTMLElement} The DOM element with the comparison result.
 */
function addPriceCompareToTD(cellValue, pair_id) {
  const userPrice = parseFloat(cellValue);
  const databasePrice = parseFloat(getPriceFromDatabaseMap(pair_id));

  // Create the main container for the comparison
  const compareContainer = document.createElement('div');
  compareContainer.className = 'compare-td-container js-price';

  // Always include the original price value
  const priceContainer = document.createElement('div');
  priceContainer.className = 'price-container js-ui-value';
  priceContainer.textContent = cellValue;

  compareContainer.appendChild(priceContainer);

  // Check if prices are valid numbers before comparison
  if (!isNaN(userPrice) && !isNaN(databasePrice)) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'price-info-container js-hide-on-custom';

    const priceDifference = userPrice - databasePrice;
    let percentageDifference = databasePrice === 0 ? 0 : (priceDifference / databasePrice) * 100;

    // Determine display values
    const sign = value => value >= 0 ? "+" : "";
    const priceDifferenceDisplay = `${sign(priceDifference)}${priceDifference.toFixed(2)}`;
    const percentageDisplay = percentageDifference ? `${sign(percentageDifference)}${percentageDifference.toFixed(2)}%` : "N/A";

    // Determine color class based on the difference
    const colorClass = priceDifference >= 0 ? 'green-color-class' : 'red-color-class';

    // Create and append the price information span
    const infoText = document.createElement('span');
    infoText.className = `price-info ${colorClass}`;
    infoText.textContent = userPrice === databasePrice ? 'Match' : `${percentageDisplay}`;
    infoContainer.appendChild(infoText);

    // If there is a difference, also append the difference span
    if (userPrice !== databasePrice) {
      const differenceText = document.createElement('span');
      differenceText.className = `price-difference ${colorClass}`;
      differenceText.textContent = `${priceDifferenceDisplay}$`;
      infoContainer.appendChild(differenceText);
    }

    compareContainer.appendChild(infoContainer);
  }

  return compareContainer;
}


function getPriceFromDatabaseMap(pair_id) {
  // Assuming databaseMap is a JavaScript object where key is pair_id
  let price = getDatabaseMap().get(pair_id)?.price;
  return price || "N/A";
}
