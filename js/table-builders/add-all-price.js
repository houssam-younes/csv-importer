import { clearHtml, closeEditableDiv, createCustomInputFlex, createEditButton, createEditableDivShared, handleCustomPriceInput } from "../export/custom-input.js";
import { changePrice } from "../export/dropdown-listeners.js";

export function addPriceAdjustmentFeature(containerElement) {
    // Outer container with 90% width
    const adjustmentContainer = document.createElement('div');
    adjustmentContainer.classList.add('price-adjustment-container');

    // Inner container to hold contents, aligned at the end
    const contentContainer = document.createElement('div');
    contentContainer.classList.add('price-adjustment-content-container');
    adjustmentContainer.appendChild(contentContainer); // Append content container to the outer container

    // Text node for 'Add'
    const textBeforeInput = document.createTextNode('Add ');
    contentContainer.appendChild(textBeforeInput);

    // Input for amount
    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'priceAdditionInput';
    input.classList.add('price-adjustment-input');
    input.placeholder = 'Amount in $';
    contentContainer.appendChild(input);

    // Text node for 'to all item prices'
    const textAfterInput = document.createTextNode('$ to all prices');
    contentContainer.appendChild(textAfterInput);

    // Confirm button
    const button = document.createElement('button');
    button.id = 'confirmPriceAddition';
    button.classList.add('confirm-price-addition');
    button.textContent = 'Confirm';
    contentContainer.appendChild(button);

    // Append the outer container to the passed container element at the end
    containerElement.appendChild(adjustmentContainer); // Use appendChild to add it at the end

    // Add click event listener to the button
    button.addEventListener('click', function () {
        const additionAmount = parseFloat(input.value);
        if (isNaN(additionAmount) || additionAmount === 0) {
            alert('Please enter a valid amount.');
            return;
        }

        // Find the closest .expandable-content container
        const expandableContent = this.closest('.expandable-content');
        if (!expandableContent) {
            console.error('Expandable content container not found');
            return;
        }

        // Search for price cells within the .expandable-content container
        //const priceCells = expandableContent.querySelectorAll('.js-price .js-ui-value');
        const priceContainers = expandableContent.querySelectorAll('.price-container');
        priceContainers.forEach(container => {
            // Get the closest 'tr' element
            const closestTr = container.closest('tr');
            if (!closestTr) {
                console.error('No closest <tr> found for the price container');
                return;
            }

            // Retrieve the old price and scan code from the closest 'tr'
            const oldPrice = parseFloat(closestTr.dataset.userPrice); // Ensure this attribute exists or determine the price appropriately
            const currentScanCode = closestTr.dataset.scanCode; // Ensure this attribute exists or determine the scan code appropriately

            if (isNaN(oldPrice)) {
                console.error('Invalid old price found');
                return;
            }

            // Calculate the updated price
            const updatedPrice = oldPrice + additionAmount;

            //
            changePrice(currentScanCode, updatedPrice, container);

            // handleCustomPriceInput(currentScanCode, container);
            createPriceEditableDiv(currentScanCode, updatedPrice, container);

            // Pass the updated price, currentScanCode, and other necessary parameters to your function
            // updatePriceCellAndAddEditButton(container, updatedPrice, currentScanCode, expandableContent);
        });
    });
}


function createPriceEditableDiv(currentScanCode, price, eventTarget) {

    const parentTd = eventTarget.closest('td');
    const jsUiValueContainer = parentTd.querySelector('.js-ui-value');

    // jsUiValueContainer.innerHTML = ''; // Clear the container
    clearHtml(jsUiValueContainer);


    // Create a flex container for the editable div and buttons
    const flexContainer = createCustomInputFlex();

    const editableDiv = createEditableDivShared(price, false);
    closeEditableDiv(editableDiv);
    flexContainer.appendChild(editableDiv);

    const editButton = createEditButton(currentScanCode, editableDiv, flexContainer, jsUiValueContainer);
    flexContainer.appendChild(editButton);


    jsUiValueContainer.appendChild(flexContainer); // Append the flex container to the jsUiValueContainer
}


function createEditableDivNoListener(currentValue) {
    const editableDiv = document.createElement('div');
    // editableDiv.contentEditable = true; // Ensure it's editable when "Custom" is selected
    editableDiv.className = 'custom-price-editable editable-div';
    editableDiv.style.border = '1px solid #ccc';
    editableDiv.style.padding = '5px 8px';
    // editableDiv.style.width = '100px'; // Fixed width
    editableDiv.style.width = 'fit-content'; // Fixed width
    editableDiv.style.minWidth = '50px'; // Fixed width
    editableDiv.style.maxWidth = '80px'; // Fixed width
    editableDiv.style.display = 'inline-block';
    editableDiv.style.borderRadius = '4px';
    editableDiv.style.backgroundColor = '#fff'; // White background for editable state
    editableDiv.style.outline = 'none'; // Remove focus outline for cleaner look
    editableDiv.textContent = currentValue;

    // Add keypress event listener to check for Enter key
    editableDiv.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default Enter key action

            // Find the "Done" button by class name within the closest 'td' or container
            const parentTd = this.closest('td'); // Adjust if your structure is different
            const doneButton = parentTd.querySelector('.done-button');
            if (doneButton) {
                doneButton.click(); // Simulate clicking the Done button
            }
        }
    });


    editableDiv.style.backgroundColor = '#e9ecef'; // Light grey background indicates readonly
    editableDiv.style.color = '#495057'; // Darker text for contrast
    editableDiv.style.border = '1px solid #ced4da'; // Solid border to mimic input field in readonly state

    // Optionally, if you wish to keep the cursor as default instead of text selection
    editableDiv.style.cursor = 'default';


    return editableDiv;
}
