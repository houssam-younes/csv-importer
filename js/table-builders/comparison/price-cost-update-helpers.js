import { RowTypes, featureFlags } from "../../file-constants.js";
import { hideElement } from "../table-builder.js";
import { toggleMatchingCostSelection, toggleMatchingPriceSelection, togglePartialMatchCostSelection, togglePartialMatchPriceSelection, updateMatchingCostAveragesUI, updateMatchingCostTotals, updateMatchingPriceAveragesUI, updateMatchingPriceTotals, updatePartialMatchCostTotals, updatePartialMatchPriceAveragesUI, updatePartialMatchPriceTotals, updatePartialMatchingCostAveragesUI } from "./price-comparison.js";

export const ValueType = {
    PRICE: 'price',
    COST: 'cost'
};

export const ValueClassEnum = {
    PRICE_INFO: 'price-info',
    PRICE_DIFFERENCE: 'price-difference',
    COST_INFO: 'cost-info',
    COST_DIFFERENCE: 'cost-difference'
};



export function updateTotalsAndInfoForRow(databaseValue, oldUserValue, newUserValue, eventTarget, valueType) {
    const rowElement = eventTarget.closest('tr');
    const tdElement = eventTarget.closest('td');

    if (!rowElement || !tdElement) {
        console.error('No row or td element found for the event target');
        return;
    }

    const isMatching = rowElement.classList.contains(RowTypes.MATCHING);
    const isPartialMatch = rowElement.classList.contains(RowTypes.PARTIAL);

    if (isMatching) {
        if (valueType === ValueType.PRICE) {
            updateMatchingPriceTotals(databaseValue, oldUserValue, newUserValue);
            updateMatchingPriceAveragesUI();
        } else {
            updateMatchingCostTotals(databaseValue, oldUserValue, newUserValue);
            updateMatchingCostAveragesUI();
        }
    } else if (isPartialMatch) {
        if (valueType === ValueType.PRICE) {
            updatePartialMatchPriceTotals(databaseValue, oldUserValue, newUserValue);
            updatePartialMatchPriceAveragesUI();
        } else {
            updatePartialMatchCostTotals(databaseValue, oldUserValue, newUserValue);
            updatePartialMatchingCostAveragesUI();
        }
    }

    compareAndUpdateUI(tdElement, databaseValue, newUserValue, valueType);
}

function compareAndUpdateUI(tdElement, databaseValue, exportValue, valueType) {
    debugger
    const isPrice = valueType === ValueType.PRICE;
    const isCost = valueType === ValueType.COST;

    // Determine the appropriate classes for 'info' and 'difference' based on the valueType
    const infoClass = isPrice ? ValueClassEnum.PRICE_INFO : ValueClassEnum.COST_INFO;
    const differenceClass = isPrice ? ValueClassEnum.PRICE_DIFFERENCE : ValueClassEnum.COST_DIFFERENCE;

    // Calculate the value difference and the percentage difference
    const valueDifference = exportValue - databaseValue;
    const percentageDifference = (databaseValue === 0) ? 0 : (valueDifference / databaseValue) * 100;
    const colorClass = getColorClass(valueDifference, isCost);

    const infoContent = formatValue(percentageDifference, true);
    const differenceContent = formatValue(valueDifference);

    // Check if there's any difference
    if (exportValue !== databaseValue) {
        // If there's a difference, display the percentage difference in 'info' and value difference in 'difference'
        let show = featureFlags.showPercentages ? true : false;
        updateUIElement(tdElement, infoClass, infoContent, colorClass, show);
        updateUIElement(tdElement, differenceClass, differenceContent, colorClass);
    } else {
        // If there's no difference, display "Match" in 'info' and hide the 'difference' element
        updateUIElement(tdElement, differenceClass, "Match", colorClass);
        updateUIElement(tdElement, infoClass, infoContent, colorClass, false);
        // hideUIElement(tdElement, infoClass);
        // const element = tdElement.querySelector(`.${infoClass}`);
        // if (element !== null) {
        // hideElement(element);
        // }
    }
}

// function hideUIElement(tdElement, valueType) {
//     const element = tdElement.querySelector(`.${valueType}`);
//     if (element !== null) {
//         //element.style.display = 'none'; // Hide the element
//         hideElement(element);
//     }
// }


function getColorClass(valueDifference, inverted = false) {
    if (inverted) {
        return valueDifference >= 0 ? 'negative-diff' : 'positive-diff';
    } else {
        return valueDifference >= 0 ? 'positive-diff' : 'negative-diff';
    }
}

function formatValue(value, isPercentage = false) {
    const sign = value >= 0 ? "+" : "-";
    return `${sign}${Math.abs(value).toFixed(2)}${isPercentage ? '%' : ''}`;
}

function updateUIElement(tdElement, valueType, content, colorClass, show = true) {
    const element = tdElement.querySelector(`.${valueType}`);
    if (element !== null) {
        element.style.display = ''; // Reset any display style to default, making the element visible if it was hidden
        element.textContent = content;
        element.className = `${valueType} ${colorClass}`;
        if (!show) {
            hideElement(element);
        }
    } else {
        console.error(`Element with class ${valueType} not found in the td element`);
    }
}
