import { generateRowHtml, generateExportRowHtml } from "./table-builder.js";
import { getDatabaseMap } from "./comparison/comparison.js";
import { objectToCsvString } from "./comparison/comparison.js";
import { RowTypes, featureFlags } from "../file-constants.js";
import { databaseHeaders } from "../file-constants.js";
import { resetPriceCostTables, calculateAverage, PricePercentageArray, PriceDifferenceArrayTypeMatching, CostDifferenceArrayTypeMatching, CostPercentageArray } from "./table-builder.js";
import { originalUserHeaders } from "../csv-file-helpers/user-header-to-db-header.js";
import { calculateAveragesMatching, calculateAveragesPartialMatch, calculateAverageCostsMatching, calculateAverageCostsPartialMatch } from "./comparison/price-comparison.js";

/**
 * Creates a structured representation of a CSV table as a JavaScript object. This function is designed to handle and
 * differentiate between various types of rows such as export rows, database rows, and user rows, which facilitates the
 * dynamic rendering of tables in web applications. The structure includes table identifiers, header information, row data,
 * and potentially statistical data for matching types. This approach allows for flexible and interactive data presentation
 * and manipulation within the UI, supporting functionalities like viewing, selecting, and exporting specific rows.
 *
 * The function parses the input CSV rows and categorizes them based on the provided type and the presence of specific
 * identifiers (e.g., 'pair_id' for matching rows). It then constructs an object that represents the table, with detailed
 * information for each row, including whether it corresponds to user data, database data, or a mix of both. For 'No Match'
 * types, the function handles rows differently, focusing on the raw CSV data. Additionally, for types other than 'No Match',
 * the function computes and includes statistical information about the data, enhancing the data analysis capabilities of the table.
 *
 * @param {Array<string>} rows - An array of strings where each string represents a CSV-formatted row. The first row is expected to be the header.
 * @param {String} type - A string that indicates the category of rows the table will contain, affecting the processing and structure of row data.
 * @returns {Object} An object representing the structured table, including properties for the table ID, CSS class, headers, row data, and optionally statistical data.
 */
export function createCsvTableNew(rows, type) {
  // const tableDiv = document.createElement('div');
  // tableDiv.className = 'table-div';

  const table = document.createElement('table');
  table.id = `csvTable_${type}`;
  table.className = 'csvTable';

  // Assume getDatabaseMap and other utility functions are defined elsewhere
  let headers;
  // if (type === RowTypes.NO_MATCH) {
  // For NO_MATCH type, use a predefined set of headers with "Source" at the start
  // headers = ["Source", ...originalUserHeaders];
  // } else {
  // For other types, use the first row as headers with "Source" prepended
  headers = rows[0].split(",").map(header => header.trim());
  headers.unshift("Source");
  // }

  // Create header row
  const headerRow = document.createElement('tr');

  // DocumentFragment for minimal DOM manipulation
  const docFrag = document.createDocumentFragment();
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    docFrag.appendChild(th);
  });

  headerRow.appendChild(docFrag);
  table.appendChild(headerRow);

  const databaseMap = getDatabaseMap();

  for (let i = 1; i < rows.length; i++) {
    if (typeof rows[i] === "object" && rows[i].pair_id) {
      const userRow = rows[i];
      const dbItemId = userRow.pair_id;
      const dbItem = databaseMap.get(dbItemId);
      const userCells = userRow.csv.split(",").map(cell => cell.trim());
      const userItemId = userCells[0];
      const dbCells = dbItem ? objectToCsvString(dbItem, databaseHeaders).split(",").map(cell => cell.trim()) : [];

      const dbRowDom = generateRowHtml(dbCells, `database-row ${type}-database-row ${dbItemId}`, userItemId, i, type);
      const exportRowDom = generateExportRowHtml(userCells, `export-row ${type}-export-row ${userItemId}`, userItemId, userRow.pair_id, i, type);
      const userRowDom = generateRowHtml(userCells, `user-row ${type}-user-row ${userItemId}`, userRow.pair_id, i, type);

      table.appendChild(exportRowDom);
      if (dbItem) {
        table.appendChild(dbRowDom);
      }
      table.appendChild(userRowDom);

    } else if (type === RowTypes.NO_MATCH) {
      const cells = rows[i].split(",").map(cell => cell.trim());
      // const noMatchRowDom = generateRowHtml(cells, "no-match-user-row user-row", null, i, type, true);
      const noMatchRowDom = generateRowHtml(cells, "no-match-user-row", null, i, type, true);
      table.appendChild(noMatchRowDom);
    }
  }

  return table;
  // tableDiv.appendChild(table);
  // return tableDiv
}


// export function appendStatisticsInfo(type) {
// const statsDiv = document.createElement('div');
// statsDiv.className = "average-info";

// if (type !== RowTypes.NO_MATCH) {
//   const averagePricePercentageDiff = calculateAverage(PricePercentageArray);
//   const averagePriceTotalDiff = calculateAverage(PriceDifferenceArrayTypeMatching);
//   const averageCostPercentageDiff = calculateAverage(CostPercentageArray);
//   const averageCostTotalDiff = calculateAverage(CostDifferenceArrayTypeMatching);

//   // Constructing price stats with dynamic class names based on type
//   const pricePercentageClass = `${type}-average-percentage` + (averagePricePercentageDiff >= 0 ? ' positive-diff' : ' negative-diff');
//   const priceTotalClass = `${type}-average-total` + (averagePriceTotalDiff >= 0 ? ' positive-diff' : ' negative-diff');

//   const priceStatsDiv = document.createElement('div');
//   priceStatsDiv.className = "stats-group price-stats";
//   priceStatsDiv.innerHTML = `
//           <p>Average % Price Difference: <span class="${pricePercentageClass}">${formatDifference(averagePricePercentageDiff)}</span>%</p>
//           <p>Average Price Difference: <span class="${priceTotalClass}">${formatDifference(averagePriceTotalDiff)}</span> $</p>
//       `;

//   // Constructing cost stats with dynamic class names based on type
//   const costPercentageClass = `${type}-average-percentage` + (averageCostPercentageDiff >= 0 ? ' positive-diff' : ' negative-diff');
//   const costTotalClass = `${type}-average-total` + (averageCostTotalDiff >= 0 ? ' positive-diff' : ' negative-diff');

//   const costStatsDiv = document.createElement('div');
//   costStatsDiv.className = "stats-group cost-stats";
//   costStatsDiv.innerHTML = `
//           <p>Average % Cost Difference: <span class="${costPercentageClass}">${formatDifference(averageCostPercentageDiff)}</span>%</p>
//           <p>Average Cost Difference: <span class="${costTotalClass}">${formatDifference(averageCostTotalDiff)}</span> $</p>
//       `;

//   statsDiv.appendChild(priceStatsDiv);
//   statsDiv.appendChild(costStatsDiv);
//   resetPriceCostTables();
// }

// return statsDiv;
// }

// Function to append statistics info for matching items
export function appendMatchingStatisticsInfo() {
  const statsDiv = document.createElement('div');
  statsDiv.className = "average-info";

  const { averagePriceDifference, averagePercentagePriceDifference } = calculateAveragesMatching();
  // Price statistics
  const pricePercentageClass = `matching-average-percentage` + (averagePercentagePriceDifference >= 0 ? ' positive-diff' : ' negative-diff');
  const priceTotalClass = `matching-average-total` + (averagePriceDifference >= 0 ? ' positive-diff' : ' negative-diff');

  const priceStatsDiv = document.createElement('div');
  priceStatsDiv.className = "stats-group price-stats";
  // Updated to include the sign
  const formattedAvgPercentageDiff = (averagePercentagePriceDifference >= 0 ? "+" : "") + averagePercentagePriceDifference.toFixed(2);
  const formattedAvgPriceDiff = (averagePriceDifference >= 0 ? "+" : "") + averagePriceDifference.toFixed(2);

  const percentageVisibilityClass = featureFlags.showPercentages ? '' : 'display-none';

  priceStatsDiv.innerHTML = `
        <p class="${percentageVisibilityClass} info-price-matching-average-percentage">Average % Price difference: <span class="${pricePercentageClass}">${formattedAvgPercentageDiff}</span>%</p>
        <p class="info-price-matching-average-difference">Average Price Difference: <span class="${priceTotalClass}">${formattedAvgPriceDiff}</span> $</p>
    `;

  const { averageCostDifference, averagePercentageCostDifference } = calculateAverageCostsMatching();

  const costPercentageClass = `matching-average-cost-percentage` + (averagePercentageCostDifference >= 0 ? ' negative-diff' : ' positive-diff');
  const costTotalClass = `matching-average-cost-total` + (averageCostDifference >= 0 ? ' negative-diff' : ' positive-diff');

  // Format the cost differences to include the sign
  const formattedAvgCostDiff = (averageCostDifference >= 0 ? "+" : "") + averageCostDifference.toFixed(2);
  const formattedAvgPercentageCostDiff = (averagePercentageCostDifference >= 0 ? "+" : "") + averagePercentageCostDifference.toFixed(2);


  const costVisibilityClass = featureFlags.showCostComparisons ? '' : 'display-none';

  // Cost statistics set to 0 for now
  const costStatsDiv = document.createElement('div');
  costStatsDiv.className = `stats-group cost-stats ${costVisibilityClass}`;
  costStatsDiv.innerHTML = `
      <p class="${percentageVisibilityClass} info-cost-matching-average-percentage">Average % Cost Percentage: <span class="${costPercentageClass}">${formattedAvgPercentageCostDiff}</span>%</p>
      <p class="info-cost-matching-average-difference">Average Cost Difference: <span class="${costTotalClass}">${formattedAvgCostDiff}</span> $</p>
  `;

  statsDiv.appendChild(priceStatsDiv);
  statsDiv.appendChild(costStatsDiv);
  return statsDiv;
}

// Function to append statistics info for partial matching items
export function appendPartialMatchStatisticsInfo() {
  const statsDiv = document.createElement('div');
  statsDiv.className = "average-info";

  const { averagePriceDifference, averagePercentagePriceDifference } = calculateAveragesPartialMatch();

  const percentageVisibilityClass = featureFlags.showPercentages ? '' : 'display-none';

  // Price statistics
  const pricePercentageClass = `partial-match-average-percentage` + (averagePercentagePriceDifference >= 0 ? ' positive-diff' : ' negative-diff');
  const priceTotalClass = `partial-match-average-total` + (averagePriceDifference >= 0 ? ' positive-diff' : ' negative-diff');

  const priceStatsDiv = document.createElement('div');
  priceStatsDiv.className = "stats-group price-stats";
  // Updated to include the sign
  const formattedAvgPercentageDiff = (averagePercentagePriceDifference >= 0 ? "+" : "") + averagePercentagePriceDifference.toFixed(2);
  const formattedAvgPriceDiff = (averagePriceDifference >= 0 ? "+" : "") + averagePriceDifference.toFixed(2);

  priceStatsDiv.innerHTML = `
       <p class=" ${percentageVisibilityClass} info-price-partial-match-average-percentage">Average % Price Difference: <span class="${pricePercentageClass}">${formattedAvgPercentageDiff}</span>%</p>
       <p class="info-price-partial-match-average-difference">Average Price Difference: <span class="${priceTotalClass}">${formattedAvgPriceDiff}</span> $</p>
   `;


  const { averageCostDifference, averagePercentageCostDifference } = calculateAverageCostsPartialMatch();
  // Initialize cost averages to 0
  // const averageCostDifference = 0; // Assuming no calculation needed for now
  // const averagePercentageCostDifference = 0; // Assuming no calculation needed for now

  // Format the cost differences to include the sign
  const formattedAvgCostDiff = (averageCostDifference >= 0 ? "+" : "") + averageCostDifference.toFixed(2);
  const formattedAvgPercentageCostDiff = (averagePercentageCostDifference >= 0 ? "+" : "") + averagePercentageCostDifference.toFixed(2);

  const costPercentageClass = `partial-match-average-cost-percentage` + (averagePercentageCostDifference >= 0 ? ' negative-diff' : ' positive-diff');
  const costTotalClass = `partial-match-average-cost-total` + (averageCostDifference >= 0 ? ' negative-diff' : ' positive-diff');

  const costVisibilityClass = featureFlags.showCostComparisons ? '' : 'display-none';

  // Cost statistics set to 0 for now
  const costStatsDiv = document.createElement('div');
  costStatsDiv.className = `stats-group cost-stats ${costVisibilityClass}`;

  costStatsDiv.innerHTML = `
      <p class="${percentageVisibilityClass} info-cost-partial-match-average-percentage">Average % Cost % Difference: <span class="${costPercentageClass}">${formattedAvgPercentageCostDiff}</span>%</p>
      <p class="info-cost-partial-match-average-difference">Average Cost Difference: <span class="${costTotalClass}">${formattedAvgCostDiff}</span> $</p>
  `;

  statsDiv.appendChild(priceStatsDiv);
  statsDiv.appendChild(costStatsDiv);
  return statsDiv;
}



export function formatDifference(value, inverted = false) {
  const formattedValue = value.toFixed(2);
  const sign = value >= 0 ? "+" : "";
  const colorClass = (value >= 0 && !inverted) ? "positive-diff" : "negative-diff";
  return `<span class="${colorClass}">${sign}${formattedValue}</span>`;
}

