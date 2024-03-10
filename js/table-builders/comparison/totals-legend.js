export let totalItems = 0;
export let totalSelectedItems = 0;

// Function to update the display of total items
export function updateTotalItemsDisplay() {
    try {
        document.getElementById('totalItems').textContent = totalItems.toString();
    } catch (error) {
        console.error("Error updating total items display:", error);
    }
}

// Function to update the display of total selected items
export function updateTotalSelectedItemsDisplay() {
    try {
        document.getElementById('selectedItems').textContent = totalSelectedItems.toString();
    } catch (error) {
        console.error("Error updating total selected items display:", error);
    }
}

// Function to clear both total and selected item counts and update the display
export function clearAllCounts() {
    try {
        totalItems = 0;
        totalSelectedItems = 0;
        updateTotalItemsDisplay();
        updateTotalSelectedItemsDisplay();
    } catch (error) {
        console.error("Error clearing all counts:", error);
    }
}

// Function to set the total number of items
export function setTotalItems(newTotalItems) {
    try {
        totalItems = newTotalItems;
        updateTotalItemsDisplay(); // Update the display for total items
    } catch (error) {
        console.error("Error setting total items:", error);
    }
}

// Function to set the total number of selected items
export function setTotalSelectedItems(newTotalSelectedItems) {
    try {
        totalSelectedItems = newTotalSelectedItems;
        updateTotalSelectedItemsDisplay(); // Update the display for selected items
    } catch (error) {
        console.error("Error setting total selected items:", error);
    }
}

// Function to increase the count of total selected items
export function increaseTotalSelected() {
    try {
        totalSelectedItems += 1;
        updateTotalSelectedItemsDisplay(); // Update the display for selected items
    } catch (error) {
        console.error("Error increasing total selected items:", error);
    }
}

// Function to decrease the count of total selected items
export function decreaseTotalSelected() {
    try {
        if (totalSelectedItems > 0) {
            totalSelectedItems -= 1;
            updateTotalSelectedItemsDisplay(); // Update the display for selected items
        }
    } catch (error) {
        console.error("Error decreasing total selected items:", error);
    }
}
