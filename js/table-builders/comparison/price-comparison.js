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
let totalSelectedDatabaseItemCosts_matching = 0;
let totalSelectedExportItemCosts_matching = 0;

// Totals for partial matching items - including cost
let totalSelectedDatabaseItemCosts_partial_match = 0;
let totalSelectedExportItemCosts_partial_match = 0;

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


export function updateStatisticsUI() {
    // Calculate the averages
    const averagePriceDifferenceMatching = totalSelectedDatabaseItems_matching > 0 ?
        (totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItems_matching : 0;
    const averagePercentagePriceDifferenceMatching = totalSelectedDatabaseItems_matching > 0 ?
        ((totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItemPrices_matching) * 100 : 0;

    const averagePriceDifferencePartialMatch = totalSelectedDatabaseItems_partial_match > 0 ?
        (totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItems_partial_match : 0;
    const averagePercentagePriceDifferencePartialMatch = totalSelectedDatabaseItems_partial_match > 0 ?
        ((totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItemPrices_partial_match) * 100 : 0;

    // Update the UI elements
    // This assumes you have elements with these specific IDs in your HTML
    document.getElementById('matching-average-percentage').textContent = formatDifference(averagePercentagePriceDifferenceMatching) + '%';
    document.getElementById('matching-average-total').textContent = formatDifference(averagePriceDifferenceMatching) + '$';

    document.getElementById('partial-matching-average-percentage').textContent = formatDifference(averagePercentagePriceDifferencePartialMatch) + '%';
    document.getElementById('partial-matching-average-total').textContent = formatDifference(averagePriceDifferencePartialMatch) + '$';
}

// Function to calculate averages for matching items
export function calculateAveragesMatching() {
    const averagePriceDifference = totalSelectedDatabaseItems_matching > 0
        ? (totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItems_matching
        : 0;
    const averagePercentagePriceDifference = totalSelectedDatabaseItems_matching > 0
        ? ((totalSelectedExportItemPrices_matching - totalSelectedDatabaseItemPrices_matching) / totalSelectedDatabaseItemPrices_matching) * 100 / totalSelectedDatabaseItems_matching
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
    const averagePercentageCostDifference = totalSelectedDatabaseItemCosts_matching > 0
        ? ((totalSelectedExportItemCosts_matching - totalSelectedDatabaseItemCosts_matching) / totalSelectedDatabaseItemCosts_matching) * 100
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
    const averagePercentageCostDifference = totalSelectedDatabaseItemCosts_partial_match > 0
        ? ((totalSelectedExportItemCosts_partial_match - totalSelectedDatabaseItemCosts_partial_match) / totalSelectedDatabaseItemCosts_partial_match) * 100
        : 0;

    return {
        averageCostDifference,
        averagePercentageCostDifference
    };
}



// Function to calculate averages for partial matching items
export function calculateAveragesPartialMatch() {
    const averagePriceDifference = totalSelectedDatabaseItems_partial_match > 0
        ? (totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItems_partial_match
        : 0;
    const averagePercentagePriceDifference = totalSelectedDatabaseItems_partial_match > 0
        ? ((totalSelectedExportItemPrices_partial_match - totalSelectedDatabaseItemPrices_partial_match) / totalSelectedDatabaseItemPrices_partial_match) * 100 / totalSelectedDatabaseItems_partial_match
        : 0;

    return {
        averagePriceDifference,
        averagePercentagePriceDifference
    };
}


export function formatDifference(value, inverted = false) {
    const formattedValue = value.toFixed(2);
    const sign = value >= 0 ? "+" : "";
    const colorClass = (value >= 0 && !inverted) ? "positive-diff" : "negative-diff";
    return `<span class="${colorClass}">${sign}${formattedValue}</span>`;
}

// Assuming the existence of formatDifference function as defined earlier

// Updates the UI with the calculated averages for matching items
export function updateMatchingAveragesUI() {
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
export function updatePartialMatchingAveragesUI() {
    const { averagePriceDifference, averagePercentagePriceDifference } = calculateAveragesPartialMatch();

    // Format the calculated averages
    const formattedPriceDiff = formatDifference(averagePriceDifference);
    const formattedPercentageDiff = formatDifference(averagePercentagePriceDifference);

    // Select the elements by their class names and update their HTML
    const priceDiffElement = document.querySelector('.partial-match-average-cost-total');
    const percentageDiffElement = document.querySelector('.partial-match-average-cost-percentage');

    if (priceDiffElement) priceDiffElement.innerHTML = formattedPriceDiff;
    if (percentageDiffElement) percentageDiffElement.innerHTML = formattedPercentageDiff;
}
