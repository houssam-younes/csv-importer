import { featureFlags } from "./file-constants.js";

const selectButtons = document.querySelectorAll(".select-btn"); // Select all dropdown buttons
const items = document.querySelectorAll(".item");

export function clearCheckboxes() {
    items.forEach(item => {
        item.classList.remove("checked"); // Remove 'checked' from all items
    });
}


function findContainer(element) {
    return element.closest('.js-expandable-content');
}


selectButtons.forEach(selectBtn => {
    selectBtn.addEventListener("click", () => {
        selectBtn.classList.toggle("open");
    });
});


items.forEach(item => {
    item.addEventListener("click", () => {
        item.classList.toggle("checked");
        const feature = item.getAttribute("data-feature");
        const parentContainer = findContainer(item);

        switch (feature) {
            case "showCostInfo":
                featureFlags.showCostComparisons = !featureFlags.showCostComparisons;
                toggleCostInfoContainers(parentContainer);
                break;
            case "showPercentages":
                featureFlags.showPercentages = !featureFlags.showPercentages;
                toggleComparisonInfo(parentContainer);
                break;
            // Add more cases as needed for other features
        }
    });
});

function toggleCostInfoContainers(parentContainer) {
    if (!parentContainer) {
        console.log('Something went wrong');
        return;
    }
    const costInfoContainers = parentContainer.querySelectorAll(".table-container .cost-info-container");
    costInfoContainers.forEach(container => {
        container.classList.toggle("display-none");
    });

    const costStats = parentContainer.querySelector(".table-container .cost-stats");
    costStats?.classList.toggle("display-none");
}

// New function to toggle visibility of comparison info elements
function toggleComparisonInfo(parentContainer) {
    if (!parentContainer) {
        console.log('Something went wrong');
        return;
    }
    const container = parentContainer.querySelector(".table-container");

    const priceInfoElements = container.querySelectorAll(".price-info");
    const costInfoElements = container.querySelectorAll(".cost-info");

    priceInfoElements.forEach(elem => elem.classList.toggle("display-none"));
    costInfoElements.forEach(elem => elem.classList.toggle("display-none"));
    // });

    const priceAvgPercentage = container.querySelector(".info-price-avg-percentage");
    const costAvgPercentage = container.querySelector(".info-cost-avg-percentage");

    priceAvgPercentage.classList.toggle("display-none");
    costAvgPercentage.classList.toggle("display-none");
}




function closeDropdown() {
    selectButtons.forEach(selectBtn => selectBtn.classList.remove("open"));
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Define relevant containers once the document is fully loaded
    const relevantContainers = [
        document.querySelector(".settings-container-matching"),
        document.querySelector(".settings-container-partial-match") // Spread operator to handle NodeList
    ].filter(Boolean); // Filter out any null values in case the selectors don't match any elements

    // Add the click event listener to the document
    document.addEventListener("click", (event) => {
        // Check if the click was within any of the relevant containers
        const withinBoundaries = relevantContainers.some(container => {
            return event.composedPath().includes(container);
        });

        if (!withinBoundaries) {
            closeDropdown(); // Close the dropdown if the click is outside the relevant containers
        }
    });
});
