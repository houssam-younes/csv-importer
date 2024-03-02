// import { formatDifference } from "../table-creation";
// price-comparison.js



//rewrite to sum up percentages not just total

// Totals for matching items
let totalSelectedDatabaseItemPrices_matching = 0;
let totalSelectedExportItemPrices_matching = 0;
let totalSelectedDatabaseItems_matching = 0;
let totalSelectedExportItems_matching = 0;

// Totals for partial matching items
let totalSelectedDatabaseItemPrices_partial_match = 0;
let totalSelectedExportItemPrices_partial_match = 0;
let totalSelectedDatabaseItems_partial_match = 0;
let totalSelectedExportItems_partial_match = 0;


// Totals for matching items - including cost
export let totalSelectedDatabaseItemCosts_matching = 0;
export let totalSelectedExportItemCosts_matching = 0;

// Totals for partial matching items - including cost
export let totalSelectedDatabaseItemCosts_partial_match = 0;
export let totalSelectedExportItemCosts_partial_match = 0;

export function resetTotals() {
    // Reset totals for matching items
    totalSelectedDatabaseItemPrices_matching = 0;
    totalSelectedExportItemPrices_matching = 0;
    totalSelectedDatabaseItems_matching = 0;
    totalSelectedExportItems_matching = 0;

    // Reset totals for partial matching items
    totalSelectedDatabaseItemPrices_partial_match = 0;
    totalSelectedExportItemPrices_partial_match = 0;
    totalSelectedDatabaseItems_partial_match = 0;
    totalSelectedExportItems_partial_match = 0;

    // Reset totals for matching items - including cost
    totalSelectedDatabaseItemCosts_matching = 0;
    totalSelectedExportItemCosts_matching = 0;

    // Reset totals for partial matching items - including cost
    totalSelectedDatabaseItemCosts_partial_match = 0;
    totalSelectedExportItemCosts_partial_match = 0;

}


export function incrementMatchingTotals(matchingItem, userItem) {
    const databasePrice = validateAndParseNumber(matchingItem.price, 'Matching item', 'price');
    const exportPrice = validateAndParseNumber(userItem.price, 'User item', 'price');
    const databaseCost = validateAndParseNumber(matchingItem.cost, 'Matching item', 'cost');
    const exportCost = validateAndParseNumber(userItem.cost, 'User item', 'cost');

    // Update totals for prices and costs
    totalSelectedDatabaseItemPrices_matching += databasePrice;
    totalSelectedExportItemPrices_matching += exportPrice;
    totalSelectedDatabaseItemCosts_matching += databaseCost;
    totalSelectedExportItemCosts_matching += exportCost;

    // Increment item counts
    totalSelectedDatabaseItems_matching++;
    totalSelectedExportItems_matching++;
}

export function incrementPartialMatchTotals(bestMatch, userItem) {
    const databasePrice = validateAndParseNumber(bestMatch.price, 'Best match', 'price');
    const exportPrice = validateAndParseNumber(userItem.price, 'User item', 'price');
    const databaseCost = validateAndParseNumber(bestMatch.cost, 'Best match', 'cost');
    const exportCost = validateAndParseNumber(userItem.cost, 'User item', 'cost');

    // Update totals for prices and costs
    totalSelectedDatabaseItemPrices_partial_match += databasePrice;
    totalSelectedExportItemPrices_partial_match += exportPrice;
    totalSelectedDatabaseItemCosts_partial_match += databaseCost;
    totalSelectedExportItemCosts_partial_match += exportCost;

    // Increment item counts
    totalSelectedDatabaseItems_partial_match++;
    totalSelectedExportItems_partial_match++;
}


function validateAndParseNumber(value, itemName, valueType) {
    // Attempt to parse the value as a float
    const parsedValue = parseFloat(value);

    // Check if the parsed value is a number and not NaN
    if (!isNaN(parsedValue)) {
        return parsedValue; // Return the parsed number
    } else {
        // Log a warning if the value cannot be parsed as a number
        console.warn(`${itemName} ${valueType} is not a valid number: ${value}`);
        return 0; // Default to 0 if value is not a valid number
    }
}



export function logResults() {
    console.log(`Total Database Price for Matching Items: ${totalSelectedDatabaseItemPrices_matching}`);
    console.log(`Total Export Price for Matching Items: ${totalSelectedExportItemPrices_matching}`);
    console.log(`Total Number of Database Matching Items: ${totalSelectedDatabaseItems_matching}`);
    console.log(`Total Number of Export Matching Items: ${totalSelectedExportItems_matching}`);

    // Avoid division by zero by checking if the count is greater than zero
    const averagePriceDifferenceMatching = totalSelectedDatabaseItems_matching > 0
        ? (totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItems_matching
        : 0;
    const averagePercentagePriceDifferenceMatching = totalSelectedDatabaseItems_matching > 0
        ? ((totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItemPrices_matching) * 100 / totalSelectedDatabaseItems_matching
        : 0;

    console.log(`Average Price Difference for Matching Items: ${averagePriceDifferenceMatching}`);
    console.log(`Average Percentage Price Difference for Matching Items: ${averagePercentagePriceDifferenceMatching}%`);

    console.log(`Total Database Price for Partial Matching Items: ${totalSelectedDatabaseItemPrices_partial_match}`);
    console.log(`Total Export Price for Partial Matching Items: ${totalSelectedExportItemPrices_partial_match}`);
    console.log(`Total Number of Database Partial Matching Items: ${totalSelectedDatabaseItems_partial_match}`);
    console.log(`Total Number of Export Partial Matching Items: ${totalSelectedExportItems_partial_match}`);

    const averagePriceDifferencePartialMatch = totalSelectedDatabaseItems_partial_match > 0
        ? (totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItems_partial_match
        : 0;
    const averagePercentagePriceDifferencePartialMatch = totalSelectedDatabaseItems_partial_match > 0
        ? ((totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItemPrices_partial_match) * 100
        : 0;

    console.log(`Average Price Difference for Partial Matching Items: ${averagePriceDifferencePartialMatch}`);
    console.log(`Average Percentage Price Difference for Partial Matching Items: ${averagePercentagePriceDifferencePartialMatch}%`);
}

// Function to calculate averages for matching items
export function calculateAveragesMatching() {
    const averagePriceDifference = totalSelectedDatabaseItems_matching > 0
        ? (totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItems_matching
        : 0;
    const averagePercentagePriceDifference = (totalSelectedDatabaseItems_matching > 0 && totalSelectedDatabaseItemPrices_matching != 0)
        ? ((totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItemPrices_matching) * 100 / totalSelectedDatabaseItems_matching
        : 0;

    return {
        averagePriceDifference,
        averagePercentagePriceDifference
    };
}

// Function to calculate averages for partial matching items
export function calculateAveragesPartialMatch() {
    const averagePriceDifference = totalSelectedDatabaseItems_partial_match > 0
        ? (totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItems_partial_match
        : 0;
    const averagePercentagePriceDifference = (totalSelectedDatabaseItems_partial_match > 0 && totalSelectedDatabaseItemPrices_partial_match != 0)
        ? ((totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItemPrices_partial_match) * 100 / totalSelectedDatabaseItems_partial_match
        : 0;

    return {
        averagePriceDifference,
        averagePercentagePriceDifference
    };
}

export function calculateAverageCostsMatching() {
    const averageCostDifference = totalSelectedDatabaseItems_matching > 0
        ? (totalSelectedExportItemCosts_matching - totalSelectedDatabaseItemCosts_matching) / totalSelectedDatabaseItems_matching
        : 0;
    const averagePercentageCostDifference = (totalSelectedDatabaseItems_matching > 0 && totalSelectedDatabaseItemCosts_matching != 0)
        ? ((totalSelectedExportItemCosts_matching - totalSelectedDatabaseItemCosts_matching) / totalSelectedDatabaseItemCosts_matching) * 100 / totalSelectedDatabaseItems_matching
        : 0;

    return {
        averageCostDifference,
        averagePercentageCostDifference
    };
}

export function calculateAverageCostsPartialMatch() {
    const averageCostDifference = totalSelectedDatabaseItems_partial_match > 0
        ? (totalSelectedExportItemCosts_partial_match - totalSelectedDatabaseItemCosts_partial_match) / totalSelectedDatabaseItems_partial_match
        : 0;
    const averagePercentageCostDifference = (totalSelectedDatabaseItems_partial_match > 0 && totalSelectedDatabaseItemCosts_partial_match != 0)
        ? ((totalSelectedExportItemCosts_partial_match - totalSelectedDatabaseItemCosts_partial_match) / totalSelectedDatabaseItemCosts_partial_match) * 100 / totalSelectedDatabaseItems_partial_match
        : 0;

    return {
        averageCostDifference,
        averagePercentageCostDifference
    };
}



export function formatDifference(value, inverted = false) {
    const formattedValue = value.toFixed(2);
    const sign = value >= 0 ? "+" : "";
    let colorClass = "";
    if (!inverted) {
        colorClass = (value >= 0 && !inverted) ? "positive-diff" : "negative-diff";
    }
    else {
        colorClass = (value >= 0) ? "negative-diff" : "positive-diff";
    }
    return `<span class="${colorClass}">${sign}${formattedValue}</span>`;
}

// Assuming the existence of formatDifference function as defined earlier

export function updatePriceAveragesUI() {
    updateMatchingPriceAveragesUI();
    updatePartialMatchPriceAveragesUI();
}

export function updateMatchingSectionAveragesUI() {
    updateMatchingPriceAveragesUI();
    updateMatchingCostAveragesUI();
}

export function updatePartialMatchSectionAveragesUI() {
    updatePartialMatchPriceAveragesUI();
    updatePartialMatchingCostAveragesUI();
}

export function updateCostAveragesUI() {
    updateMatchingCostAveragesUI();
    updatePartialMatchingCostAveragesUI();
}

// Updates the UI with the calculated averages for matching items
export function updateMatchingPriceAveragesUI() {
    const { averagePriceDifference, averagePercentagePriceDifference } = calculateAveragesMatching();

    // Format the calculated averages
    const formattedPriceDiff = formatDifference(averagePriceDifference);
    const formattedPercentageDiff = formatDifference(averagePercentagePriceDifference);

    // Select the elements by their class names and update their HTML
    const priceDiffElement = document.querySelector('.matching-average-total');
    const percentageDiffElement = document.querySelector('.matching-average-percentage');

    if (priceDiffElement) priceDiffElement.innerHTML = formattedPriceDiff;
    if (percentageDiffElement) percentageDiffElement.innerHTML = formattedPercentageDiff;
}

// Updates the UI with the calculated averages for partial matching items
export function updatePartialMatchPriceAveragesUI() {
    const { averagePriceDifference, averagePercentagePriceDifference } = calculateAveragesPartialMatch();

    // Format the calculated averages
    const formattedPriceDiff = formatDifference(averagePriceDifference);
    const formattedPercentageDiff = formatDifference(averagePercentagePriceDifference);

    // Select the elements by their class names and update their HTML
    const priceDiffElement = document.querySelector('.partial-match-average-total');
    const percentageDiffElement = document.querySelector('.partial-match-average-percentage');

    if (priceDiffElement) priceDiffElement.innerHTML = formattedPriceDiff;
    if (percentageDiffElement) percentageDiffElement.innerHTML = formattedPercentageDiff;
}


// Updates the UI with the calculated averages for matching items costs
export function updateMatchingCostAveragesUI() {
    const { averageCostDifference, averagePercentageCostDifference } = calculateAverageCostsMatching();

    // Format the calculated averages
    const formattedCostDiff = formatDifference(averageCostDifference, true);
    const formattedPercentageDiff = formatDifference(averagePercentageCostDifference, true); // Invert color if needed

    // Select the elements by their class names and update their HTML
    const costDiffElement = document.querySelector('.matching-average-cost-total');
    const percentageDiffElement = document.querySelector('.matching-average-cost-percentage');

    if (costDiffElement) costDiffElement.innerHTML = formattedCostDiff;
    if (percentageDiffElement) percentageDiffElement.innerHTML = formattedPercentageDiff;
}

// Updates the UI with the calculated averages for partial matching items costs
export function updatePartialMatchingCostAveragesUI() {
    const { averageCostDifference, averagePercentageCostDifference } = calculateAverageCostsPartialMatch();

    // Format the calculated averages
    const formattedCostDiff = formatDifference(averageCostDifference, true);
    const formattedPercentageDiff = formatDifference(averagePercentageCostDifference, true); // Invert color if needed

    // Select the elements by their class names and update their HTML
    const costDiffElement = document.querySelector('.partial-match-average-cost-total');
    const percentageDiffElement = document.querySelector('.partial-match-average-cost-percentage');

    if (costDiffElement) costDiffElement.innerHTML = formattedCostDiff;
    if (percentageDiffElement) percentageDiffElement.innerHTML = formattedPercentageDiff;
}

export function selectUnselectRow(rowData, isSelected) {
    if (rowData.isMatching) {
        toggleMatchingPriceSelection(rowData.databasePrice, rowData.exportPrice, isSelected);
        toggleMatchingCostSelection(rowData.databaseCost, rowData.exportCost, isSelected);

        if (isSelected) {
            totalSelectedDatabaseItems_matching++;
            totalSelectedExportItems_matching++;
        } else {
            totalSelectedDatabaseItems_matching--;
            totalSelectedExportItems_matching--;
        }
    }

    if (rowData.isPartialMatch) {
        togglePartialMatchPriceSelection(rowData.databasePrice, rowData.exportPrice, isSelected);
        togglePartialMatchCostSelection(rowData.databaseCost, rowData.exportCost, isSelected);

        if (isSelected) {
            totalSelectedDatabaseItems_partial_match++;
            totalSelectedExportItems_partial_match++;
        } else {
            totalSelectedDatabaseItems_partial_match--;
            totalSelectedExportItems_partial_match--;
        }
    }
}

export function toggleMatchingPriceSelection(databasePrice, exportPrice, isSelected) {
    if (isSelected) {
        totalSelectedDatabaseItemPrices_matching += databasePrice;
        totalSelectedExportItemPrices_matching += exportPrice;
    } else {
        totalSelectedDatabaseItemPrices_matching -= databasePrice;
        totalSelectedExportItemPrices_matching -= exportPrice;
    }
}

export function toggleMatchingCostSelection(databaseCost, exportCost, isSelected) {
    if (isSelected) {
        totalSelectedDatabaseItemCosts_matching += databaseCost;
        totalSelectedExportItemCosts_matching += exportCost;
    } else {
        totalSelectedDatabaseItemCosts_matching -= databaseCost;
        totalSelectedExportItemCosts_matching -= exportCost;
    }

    // Update the UI for cost averages
    // updateMatchingCostAveragesUI();
}

export function togglePartialMatchPriceSelection(databasePrice, exportPrice, isSelected) {
    if (isSelected) {
        totalSelectedDatabaseItemPrices_partial_match += databasePrice;
        totalSelectedExportItemPrices_partial_match += exportPrice;
    } else {
        totalSelectedDatabaseItemPrices_partial_match -= databasePrice;
        totalSelectedExportItemPrices_partial_match -= exportPrice;
    }

    // Optionally, update the UI for partial match price averages
    // updatePartialMatchPriceAveragesUI();
}

export function togglePartialMatchCostSelection(databaseCost, exportCost, isSelected) {
    if (isSelected) {
        totalSelectedDatabaseItemCosts_partial_match += databaseCost;
        totalSelectedExportItemCosts_partial_match += exportCost;
    } else {
        totalSelectedDatabaseItemCosts_partial_match -= databaseCost;
        totalSelectedExportItemCosts_partial_match -= exportCost;
    }
}

export function updateMatchingPriceTotals(databasePrice, userOldPrice, userNewPrice) {
    const validatedOldPrice = validateAndParseNumber(userOldPrice, 'User old price', 'price');
    const validatedNewPrice = validateAndParseNumber(userNewPrice, 'User new price', 'price');

    // Remove the old user price from the totals
    totalSelectedExportItemPrices_matching -= validatedOldPrice;
    // Add the new user price to the totals
    totalSelectedExportItemPrices_matching += validatedNewPrice;
}

export function updateMatchingCostTotals(databaseCost, userOldCost, userNewCost) {
    const validatedOldCost = validateAndParseNumber(userOldCost, 'User old cost', 'cost');
    const validatedNewCost = validateAndParseNumber(userNewCost, 'User new cost', 'cost');

    // Remove the old user cost from the totals
    totalSelectedExportItemCosts_matching -= validatedOldCost;
    // Add the new user cost to the totals
    totalSelectedExportItemCosts_matching += validatedNewCost;
}

export function updatePartialMatchPriceTotals(databasePrice, userOldPrice, userNewPrice) {
    const validatedOldPrice = validateAndParseNumber(userOldPrice, 'User old price', 'price');
    const validatedNewPrice = validateAndParseNumber(userNewPrice, 'User new price', 'price');

    // Remove the old user price from the totals
    totalSelectedExportItemPrices_partial_match -= validatedOldPrice;
    // Add the new user price to the totals
    totalSelectedExportItemPrices_partial_match += validatedNewPrice;
}

export function updatePartialMatchCostTotals(databaseCost, userOldCost, userNewCost) {
    const validatedOldCost = validateAndParseNumber(userOldCost, 'User old cost', 'cost');
    const validatedNewCost = validateAndParseNumber(userNewCost, 'User new cost', 'cost');

    // Remove the old user cost from the totals
    totalSelectedExportItemCosts_partial_match -= validatedOldCost;
    // Add the new user cost to the totals
    totalSelectedExportItemCosts_partial_match += validatedNewCost;
}
