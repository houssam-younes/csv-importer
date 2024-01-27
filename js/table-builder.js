import { RowSource, RowTypes } from "./file-constants.js";
import { databaseHeaders } from "./file-constants.js";
import { getDatabaseMap } from "./comparison.js";
import { CELL_INDICES } from "./file-constants.js";

export let PricePercentageArray = [];
export let PriceDifferenceArrayTypeMatching = [];
export let CostPercentageArray = [];
export let CostDifferenceArrayTypeMatching = [];

export function resetPriceCostTables(){
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
  // const dbHeaders = getDatabaseCsvHeaders();
  const dbHeaders = databaseHeaders;
  return (
    userHeaders
      .split(",")
      .map((h) => h.trim())
      .join(",") === dbHeaders.join(",")
  );
}

export function generateRowHtml(cells, rowClass, pair_id, index, type) {
  if (rowClass.includes('no-match-')){
  }
  pair_id = pair_id || "";
  const modifiedCells = [...cells];
  const checkboxHtml = `<input type="checkbox" class="row-checkbox" data-pair-id="${pair_id}" name="rowSelect${index}">`;
  modifiedCells[0] = `${checkboxHtml}<span class="cell-content">${cells[0]}</span>`;

  // Determine the additional class for alternating colors
  let colorClass = "";
  if (type === RowTypes.MATCHING || type === RowTypes.PARTIAL) {
    colorClass = index % 2 === 0 ? `${type}-row-2` : `${type}-row-1`;
  }

  // if (pair_id && rowClass.includes(RowSource.USER)) {
  //   const price = getPriceFromDatabaseMap(pair_id);
  //   console.log("priceeeeeee " + price);
  // }

  let rowHtml = modifiedCells.map((cell, cellIndex) => {
    let cellHtml = `<td class="relative-td">${cell}</td>`;
    // Check if the current cell is the 'price' cell
    if (isUserWithMatchingPair(pair_id,rowClass)){
      if ( cellIndex === CELL_INDICES.price) {
        cellHtml= addPriceCompareToTD(cell, pair_id);
      }
      else if (cellIndex === CELL_INDICES.cost) {
        cellHtml = addCostCompareToTD(cell, pair_id);
      }
    }
    return cellHtml;
  });
  // let rowHtml = modifiedCells.map((cell, cellIndex) => {
  //   if (isUserWithMatchingPair(pair_id, rowClass)) {
  //     if (cellIndex === CELL_INDICES.price) {
  //       return addPriceCompareToTD(cell, pair_id);
  //     } else if (cellIndex === CELL_INDICES.cost) {
  //       return addCostCompareToTD(cell, pair_id);
  //     }
  //   }
  //   return `<td class="relative-td">${cell}</td>`;
  // });

  rowHtml = rowHtml.join("");
  return `<tr class="${rowClass} ${colorClass}" data-id="${cells[0]}" data-pair-id="${pair_id}">${rowHtml}</tr>`;
}

function isUserWithMatchingPair(pair_id, rowClass){
  return pair_id && rowClass.includes(RowSource.USER);
}

function addCostCompareToTD(cellValue, pair_id) {
  const userCost = parseFloat(cellValue);
  const databaseCost = parseFloat(getCostFromDatabaseMap(pair_id));

  if (isNaN(userCost) || isNaN(databaseCost)) {
    return `<td class="relative-td">${cellValue}</td>`;
  }

  if (userCost === databaseCost) {
    return `<td class="relative-td"><div class="cost-container">${cellValue}</div><div class="cost-info-container"><span class="cost-match">Match</span></div></td>`;
  }

  const costDifference = userCost - databaseCost;
  let percentageDifference;
  if (databaseCost === 0) {
    // Handle the case where databaseCost is 0
    percentageDifference = "N/A";
  } else {
    percentageDifference = (costDifference / databaseCost) * 100;
    CostPercentageArray.push(percentageDifference);
  }

  CostDifferenceArrayTypeMatching.push(costDifference);

  const sign = (value) => (value >= 0 ? "+" : "");
  let percentageDisplay= "N/A";
  if (databaseCost){
    percentageDisplay = `${sign(percentageDifference)}${percentageDifference.toFixed(2)}`;
  }
  const costDifferenceDisplay = `${sign(costDifference)}${costDifference.toFixed(2)}`;

  const colorClass = percentageDifference >= 0 ? "red-color-class" : "green-color-class";

  let costDisplayPercentageMessage= `${percentageDisplay}% Compared To Database`;
  if (databaseCost === 0){
    costDisplayPercentageMessage= "N/A";
  }
  return `
    <td class="relative-td">
     <div class="compare-td-container">
      <div class="cost-container">${cellValue}</div>
        <div class="cost-info-container">
          <span class="cost-info ${colorClass}">${costDisplayPercentageMessage}</span>
          <span class="cost-difference ${colorClass}">Difference: ${costDifferenceDisplay}</span>
        </div>
      </div>  
    </td>`;
}

function getCostFromDatabaseMap(pair_id) {
  let cost = getDatabaseMap().get(pair_id)?.cost;
  return cost || "N/A";
}

function addPriceCompareToTD(cellValue, pair_id) {
  const userPrice = parseFloat(cellValue);
  const databasePrice = parseFloat(getPriceFromDatabaseMap(pair_id));

  if (isNaN(userPrice) || isNaN(databasePrice)) {
    return `<td class="relative-td">${cellValue}</td>`; // Return original cell if prices are not valid numbers
  }

  // Check for exact match
  if (userPrice === databasePrice) {
    return `<td class="relative-td"><div class="price-container">${cellValue}</div><div class="price-info-container"><span class="price-match">Match</span></div></td>`;
  }

  const priceDifference = userPrice - databasePrice;
  let percentageDifference;
  if (databasePrice === 0) {
    // Handle the case where databaseCost is 0
    percentageDifference = 0;
  } else {
    percentageDifference = (priceDifference / databasePrice) * 100;
    PricePercentageArray.push(percentageDifference);
  }

  // Add values to arrays
  PriceDifferenceArrayTypeMatching.push(priceDifference);

  const sign = (value) => (value >= 0 ? "+" : "");
  const priceDifferenceDisplay = `${sign(priceDifference)}${priceDifference.toFixed(2)}`;

  let percentageDisplay= "N/A";
  if (percentageDifference){
    // Format the display values with +/- signs
    percentageDisplay = `${sign(percentageDifference)}${percentageDifference.toFixed(2)}`;
  }
  // Determine color class based on the percentage
  const colorClass = priceDifference >= 0 ? "green-color-class" : "red-color-class";

  // Construct the cell HTML
  return `
    <td class="relative-td">
     <div class="compare-td-container">
      <div class="price-container">${cellValue}</div>
        <div class="price-info-container">
          <span class="price-info ${colorClass}">${percentageDisplay}% Compared To Database</span>
          <span class="price-difference ${colorClass}">Difference: ${priceDifferenceDisplay}</span>
        </div>
      </div>  
    </td>`;
}

function getPriceFromDatabaseMap(pair_id) {
  // Assuming databaseMap is a JavaScript object where key is pair_id
  let price = getDatabaseMap().get(pair_id)?.price;
  return price || "N/A";
}
