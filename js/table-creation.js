import { areHeadersMatching, generateRowHtml } from "./table-builder.js";
import { getDatabaseMap } from "./comparison.js";
import { objectToCsvString } from "./comparison.js";
import { RowTypes } from "./file-constants.js";
import { databaseHeaders } from "./file-constants.js";
import { resetPriceCostTables, calculateAverage, PricePercentageArray, PriceDifferenceArrayTypeMatching, CostDifferenceArrayTypeMatching, CostPercentageArray } from "./table-builder.js";
// export function createCsvTable(rows, type) {
// ... implementation (using areHeadersMatching and generateRowHtml) ...
//   }

export function createCsvTableNew(rows, type) {
  let table = `<div class='table-div'> <table id="csvTable_${type}" class="csvTable">`;
  // if (!areHeadersMatching(rows[0])) {
    // return "<p>Error: CSV headers do not match the database headers.</p>";
  // }

  // Add table headers (assuming the first row contains headers)
  const headers = rows[0].split(",").map((header) => header.trim());
  const headerRow = headers.map((header) => `<th>${header}</th>`).join("");
  const databaseMap = getDatabaseMap();

  table += `<tr>${headerRow}</tr>`;

  // ...existing setup code for headers...

  // Loop through rows starting from index 1, since index 0 contains headers
  for (let i = 1; i < rows.length; i++) {
    // Check if row is an object with a pair_id (scan_code), indicating a user row
    if (typeof rows[i] === "object" && rows[i].pair_id) {
      // Extract user row details
      const userRow = rows[i];
      const dbItemId = userRow.pair_id;
      const dbItem = databaseMap.get(dbItemId);

      const userCells = userRow.csv.split(",").map((cell) => cell.trim());

      const userItemId = userCells[0];

      const dbCells = dbItem
        // ? objectToCsvString(dbItem, dbHeaders)
        ? objectToCsvString(dbItem, databaseHeaders)
          .split(",")
          .map((cell) => cell.trim())
        : [];

      // Generate HTML for user row
      const userRowHtml = generateRowHtml(
        userCells,
        `user-row ${type}-user-row ${userItemId}`,
        userRow.pair_id,
        i,
        type
      );
      // Generate HTML for corresponding DB row
      // userCells[0] is user item scan_id
      const dbRowHtml = dbItem
        ? generateRowHtml(
          dbCells,
          `database-row ${type}-database-row ${dbItemId}`,
          userItemId,
          i,
          type
        )
        : "";

      // Add both rows to the table HTML
      table += dbRowHtml + userRowHtml;
    } else if (type === RowTypes.NO_MATCH) {
      // No matches don't have a pair_id, process normally
      const cells = rows[i].split(",").map((cell) => cell.trim());
      const rowHtml = generateRowHtml(
        cells,
        "no-match-user-row user-row",
        null,
        i,
        type
      );
      table += rowHtml;
    }
  }

  table += "</table></div>";
  if (type !== RowTypes.NO_MATCH) {
    const averagePricePercentageDiff = calculateAverage(PricePercentageArray);
    const averagePriceTotalDiff = calculateAverage(PriceDifferenceArrayTypeMatching);
    const averageCostPercentageDiff = calculateAverage(CostPercentageArray);
    const averageCostTotalDiff = calculateAverage(CostDifferenceArrayTypeMatching);

    // Append the calculated averages to the table HTML
    // Append the calculated averages to the table HTML
    table += `
    <div class="average-info">
      <div class="stats-group price-stats">
        <p>Average % Price Difference: ${formatDifference(averagePricePercentageDiff)}%</p>
        <p>Average Price Difference: ${formatDifference(averagePriceTotalDiff)} $</p>
      </div>
      <div class="stats-group cost-stats">
        <p>Average % Cost Difference: ${formatDifference(averageCostPercentageDiff, true)}%</p>
        <p>Average Cost Difference: ${formatDifference(averageCostTotalDiff, true)} $</p>
      </div>
     </div>
    `;
    resetPriceCostTables();
  }
  return table;
}

function formatDifference(value, inverted = false) {
  const formattedValue = value.toFixed(2);
  const sign = value >= 0 ? "+" : "";
  const colorClass= ( value >= 0 && !inverted) ? "positive-diff" : "negative-diff"; 
  return `<span class="${colorClass}">${sign}${formattedValue}</span>`;
}

